import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { PolicyService, Policy } from '../../services/policy.service';
import { AuthService, AuthUser } from '../../services/auth.service';
import { AnalyticsService } from '../../services/analytics.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

const FALLBACK_POLICIES: Policy[] = [
  {
    id: 1,
    title: "National Digital Health Mission Policy 2026",
    description: "Comprehensive digital healthcare framework providing digital ABHA health IDs, unified health records, e-Pharmacies, and tele-consultation across all AIIMS & PHCs.",
    category: "Healthcare",
    department: "Ministry of Health & Family Welfare",
    state: "All India",
    status: "PUBLISHED"
  },
  {
    id: 2,
    title: "PM-KISAN Agricultural Subsidies Policy",
    description: "Financial support of ₹6,000 per year directly transferred in 3 equal installments to small and marginal farmer families nationwide.",
    category: "Agriculture",
    department: "Ministry of Agriculture & Farmers Welfare",
    state: "All India",
    status: "PUBLISHED"
  },
  {
    id: 3,
    title: "National Education Policy (NEP) Skill Upgrade",
    description: "Integration of vocational skill training, multi-disciplinary undergraduate degrees, credit transfer banks, and coding education from Grade 6.",
    category: "Education",
    department: "Ministry of Education",
    state: "All India",
    status: "PUBLISHED"
  },
  {
    id: 4,
    title: "Green Energy & Solar Rooftop Subsidy Policy 2026",
    description: "Up to 40% central financial assistance subsidy for residential solar rooftop installations, net-metering benefits, and free green electricity up to 300 units.",
    category: "Environment & Energy",
    department: "Ministry of New and Renewable Energy",
    state: "All India",
    status: "PUBLISHED"
  },
  {
    id: 5,
    title: "Startup India Innovation & Seed Support Policy",
    description: "Collateral-free credit guarantees, tax exemption for 3 consecutive years, and seed capital grants up to ₹50 Lakhs for technology startups.",
    category: "Commerce & Industry",
    department: "Ministry of Commerce and Industry",
    state: "All India",
    status: "PUBLISHED"
  }
];

@Component({
  selector: 'app-policy-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './policy-list.html',
  styleUrl: './policy-list.css'
})
export class PolicyList implements OnInit {
  policies: Policy[] = FALLBACK_POLICIES;
  policyForm: FormGroup;
  showForm = false;
  isEditing = false;
  currentEditingId: number | null = null;
  isLoading = false;
  isLoadingData = false;
  currentUser: AuthUser | null = null;

  get canManagePolicies(): boolean {
    if (!this.currentUser) return false;
    const r = (this.currentUser.role || '').toLowerCase();
    return r === 'government_official' || r === 'administrator' || r === 'official';
  }

  // Search and Filter state
  searchQuery: string = '';
  selectedCategory: string = 'ALL';

  get filteredPolicies(): Policy[] {
    return this.policies.filter(p => {
      const q = this.searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        p.title.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.department && p.department.toLowerCase().includes(q));

      const matchesCategory = this.selectedCategory === 'ALL' || p.category === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }

  states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ];

  formatBeneficiaries(val: any): string {
    if (!val) return 'N/A';
    if (Array.isArray(val)) {
      return val.join(', ');
    }
    return val.toString();
  }

  // Detail Modal State
  selectedPolicyForDetails: Policy | null = null;
  showDetailsDialog = false;

  searchSubject = new Subject<string>();

  constructor(
    private fb: FormBuilder,
    private policyService: PolicyService,
    private authService: AuthService,
    private analyticsService: AnalyticsService
  ) {
    this.policyForm = this.fb.group({
      title: ['', Validators.required],
      policy_code: [''],
      type: ['', Validators.required],
      category: ['', Validators.required],
      sub_category: [''],
      ministry: ['', Validators.required],
      department: [''],
      version: ['1.0.0'],
      status: ['DRAFT'],

      executive_summary: ['', Validators.required],
      purpose: ['', Validators.required],
      problem_addressed: ['', Validators.required],
      objectives: ['', Validators.required],
      implementation_strategy: [''],
      expected_outcomes: [''],
      use_cases: [''],

      primary_beneficiary_category: ['', Validators.required],
      secondary_beneficiary_categories: [''],
      estimated_beneficiary_count: [''],
      geographical_coverage: ['', Validators.required],
      state_region: [''],

      key_innovation: [''],
      unique_benefits: [''],
      difference: [''],
      social_impact: [''],
      technology_used: [''],
      sustainability_approach: [''],

      start_date: [''],
      end_date: [''],
      authority: [''],
      budget: [''],
      funding_source: [''],
      phases: [''],
      review_frequency: [''],

      document_url: ['']
    });

    this.policyForm.get('geographical_coverage')?.valueChanges.subscribe(val => {
      const stateCtrl = this.policyForm.get('state_region');
      if (val === 'State') {
        stateCtrl?.setValidators([Validators.required]);
      } else {
        stateCtrl?.clearValidators();
      }
      stateCtrl?.updateValueAndValidity();
    });

    this.searchSubject.pipe(
      debounceTime(1000),
      distinctUntilChanged()
    ).subscribe(query => {
      if (query && query.trim().length > 0) {
        this.analyticsService.logSearch(query, this.selectedCategory).subscribe({
          error: err => console.warn('Search logging failed', err)
        });
      }
    });
  }

  onSearchChange(newValue: string) {
    this.searchSubject.next(newValue);
  }

  ngOnInit(): void {
    // Get user from local cache first for instant policy loading
    this.currentUser = this.authService.getUser();
    this.loadPolicies();

    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        const roleChanged = this.currentUser?.role !== user.role;
        this.currentUser = user;
        if (roleChanged) {
          this.loadPolicies();
        }
      },
      error: (err) => {
        console.warn('User session check notice:', err);
      }
    });
  }

  loadPolicies(): void {
    const role = (this.currentUser?.role || '').toUpperCase();

    // For Government Officials and Administrators, fetch full policy repo; for Citizens, fetch Published policies.
    const fetch$ = (role === 'GOVERNMENT_OFFICIAL' || role === 'ADMINISTRATOR')
      ? this.policyService.getPolicies()
      : this.policyService.getPublishedPolicies();

    fetch$.subscribe({
      next: (data) => {
        if (data) {
          this.policies = data;
        }

        this.isLoadingData = false;
      },
      error: (err) => {
        console.warn('Primary policies fetch failed, trying public published policies:', err);
        this.policyService.getPublishedPolicies().subscribe({
          next: (publishedData) => {
            if (publishedData) {
              this.policies = publishedData;
            }
            this.isLoadingData = false;
          },
          error: (fallbackErr) => {
            console.error('Published policies fallback failed:', fallbackErr);
            this.isLoadingData = false;
          }
        });
      }
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  parsePolicyDescription(desc: string | null | undefined): any {
    if (!desc) return {};
    try {
      if (desc.trim().startsWith('{')) {
        return JSON.parse(desc);
      }
    } catch (e) {
      console.warn("Failed to parse policy description as JSON:", e);
    }
    return {
      executive_summary: desc,
      purpose: desc,
      problem_addressed: 'Not provided',
      objectives: 'Not provided'
    };
  }

  getSnippet(policy: Policy): string {
    if (!policy.description) return '';
    const details = this.parsePolicyDescription(policy.description);
    return details.executive_summary || policy.description;
  }

  editPolicy(policy: Policy): void {
    this.isEditing = true;
    this.showForm = true;
    this.currentEditingId = policy.id;
    const details = this.parsePolicyDescription(policy.description);
    this.policyForm.patchValue({
      title: policy.title,
      policy_code: details.policy_code || '',
      type: details.type || '',
      category: policy.category || '',
      sub_category: details.sub_category || '',
      ministry: details.ministry || '',
      department: policy.department || '',
      version: details.version || '1.0.0',
      status: policy.status || 'DRAFT',

      executive_summary: details.executive_summary || '',
      purpose: details.purpose || '',
      problem_addressed: details.problem_addressed || '',
      objectives: details.objectives || '',
      implementation_strategy: details.implementation_strategy || '',
      expected_outcomes: details.expected_outcomes || '',
      use_cases: details.use_cases || '',

      primary_beneficiary_category: details.primary_beneficiary_category || '',
      secondary_beneficiary_categories: details.secondary_beneficiary_categories || '',
      estimated_beneficiary_count: details.estimated_beneficiary_count || '',
      geographical_coverage: details.geographical_coverage || '',
      state_region: policy.state || '',

      key_innovation: details.key_innovation || '',
      unique_benefits: details.unique_benefits || '',
      difference: details.difference || '',
      social_impact: details.social_impact || '',
      technology_used: details.technology_used || '',
      sustainability_approach: details.sustainability_approach || '',

      start_date: details.start_date || '',
      end_date: details.end_date || '',
      authority: details.authority || '',
      budget: details.budget || '',
      funding_source: details.funding_source || '',
      phases: details.phases || '',
      review_frequency: details.review_frequency || '',

      document_url: details.document_url || ''
    });
  }

  deletePolicy(id: number): void {
    if (confirm('Are you sure you want to delete this policy?')) {
      this.policyService.deletePolicy(id).subscribe({
        next: () => {
          this.policies = this.policies.filter(p => p.id !== id);
        },
        error: (err) => {
          console.error(err);
          alert(err.error?.detail || 'Failed to delete policy.');
        }
      });
    }
  }

  submitForApproval(id: number): void {
    if (confirm('Are you sure you want to submit this policy for approval?')) {
      this.isLoading = true;
      this.policyService.submitForApproval(id).subscribe({
        next: (updatedPolicy) => {
          const index = this.policies.findIndex(p => p.id === id);
          if (index !== -1) {
            this.policies[index] = updatedPolicy;
          }
          this.isLoading = false;
          alert('Policy submitted for approval successfully!');
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
          alert(err.error?.detail || 'Failed to submit policy.');
        }
      });
    }
  }

  resubmitForApproval(policy: Policy): void {
    if (confirm('Are you sure you want to resubmit this policy for approval?')) {
      this.isLoading = true;
      const { title, description, category, department, state } = policy;
      this.policyService.updatePolicy(policy.id, { title, description, category, department, state }).subscribe({
        next: (draftPolicy) => {
          this.policyService.submitForApproval(policy.id).subscribe({
            next: (submittedPolicy) => {
              const index = this.policies.findIndex(p => p.id === policy.id);
              if (index !== -1) {
                this.policies[index] = submittedPolicy;
              }
              this.isLoading = false;
              alert('Policy resubmitted for approval successfully!');
            },
            error: (err) => {
              console.error(err);
              this.isLoading = false;
              alert(err.error?.detail || 'Failed to submit policy.');
            }
          });
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
          alert(err.error?.detail || 'Failed to transition policy to draft.');
        }
      });
    }
  }

  onSubmit(): void {
    if (this.policyForm.invalid) {
      Object.keys(this.policyForm.controls).forEach(field => {
        const control = this.policyForm.get(field);
        control?.markAsTouched({ onlySelf: true });
      });
      alert('Please fill out all required fields first.');
      return;
    }

    this.isLoading = true;
    const val = this.policyForm.value;

    const metadata = {
      policy_code: val.policy_code,
      type: val.type,
      sub_category: val.sub_category,
      ministry: val.ministry,
      version: val.version,

      executive_summary: val.executive_summary,
      purpose: val.purpose,
      problem_addressed: val.problem_addressed,
      objectives: val.objectives,
      implementation_strategy: val.implementation_strategy,
      expected_outcomes: val.expected_outcomes,
      use_cases: val.use_cases,

      primary_beneficiary_category: val.primary_beneficiary_category,
      secondary_beneficiary_categories: val.secondary_beneficiary_categories,
      estimated_beneficiary_count: val.estimated_beneficiary_count,
      geographical_coverage: val.geographical_coverage,

      key_innovation: val.key_innovation,
      unique_benefits: val.unique_benefits,
      difference: val.difference,
      social_impact: val.social_impact,
      technology_used: val.technology_used,
      sustainability_approach: val.sustainability_approach,

      start_date: val.start_date,
      end_date: val.end_date,
      authority: val.authority,
      budget: val.budget,
      funding_source: val.funding_source,
      phases: val.phases,
      review_frequency: val.review_frequency,

      document_url: val.document_url
    };

    const body = {
      title: val.title,
      description: JSON.stringify(metadata),
      category: val.category,
      department: val.department,
      state: val.state_region || ''
    };

    if (this.isEditing && this.currentEditingId) {
      this.policyService.updatePolicy(this.currentEditingId, body).subscribe({
        next: (updatedPolicy) => {
          const index = this.policies.findIndex(p => p.id === this.currentEditingId);
          if (index !== -1) {
            this.policies[index] = updatedPolicy;
          }
          this.resetForm();
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
          alert(err.error?.detail || 'Failed to update policy.');
        }
      });
    } else {
      this.policyService.createPolicy(body).subscribe({
        next: (newPolicy) => {
          this.policies.unshift(newPolicy);
          this.resetForm();
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
          alert(err.error?.detail || 'Failed to create policy.');
        }
      });
    }
  }

  selectedPolicyAuditLogs: any[] = [];
  selectedDetails: any = {};

  viewDetails(policy: Policy): void {
    this.selectedPolicyForDetails = policy;
    this.selectedDetails = this.parsePolicyDescription(policy.description);
    this.selectedPolicyAuditLogs = [];
    this.policyService.getAuditLogs(policy.id).subscribe({
      next: (logs) => {
        this.selectedPolicyAuditLogs = logs;
      },
      error: (err) => {
        console.warn("Failed to load audit logs:", err);
      }
    });
    this.showDetailsDialog = true;
  }

  closeDetails(): void {
    this.selectedPolicyForDetails = null;
    this.selectedDetails = {};
    this.selectedPolicyAuditLogs = [];
    this.showDetailsDialog = false;
  }

  downloadPolicy(url: string | null | undefined): void {
    if (url) {
      window.open(url, '_blank');
    }
  }

  resetForm(): void {
    this.showForm = false;
    this.isEditing = false;
    this.currentEditingId = null;
    this.isLoading = false;
    this.policyForm.reset();
  }
}
