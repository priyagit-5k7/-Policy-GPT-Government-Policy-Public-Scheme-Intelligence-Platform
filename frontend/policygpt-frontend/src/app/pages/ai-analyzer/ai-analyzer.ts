import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PolicyService, Policy } from '../../services/policy.service';
import { AuthService, AuthUser } from '../../services/auth.service';

@Component({
  selector: 'app-ai-analyzer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-analyzer.html',
  styleUrl: './ai-analyzer.css'
})
export class AiAnalyzer implements OnInit {
  policyId: number | null = null;
  policy: Policy | null = null;
  analysis: any = null;
  isLoading = true;
  errorMsg = '';
  currentUser: AuthUser | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private policyService: PolicyService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    const role = (this.currentUser?.role || '').toUpperCase();
    if (role !== 'ADMINISTRATOR' && role !== 'GOVERNMENT_OFFICIAL') {
      this.errorMsg = 'HTTP 403 Forbidden: You do not have permission to access the AI Analyzer.';
      this.isLoading = false;
      return;
    }

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.policyId = +id;
        this.fetchPolicyAndAnalysis();
      } else {
        this.errorMsg = 'Invalid Policy ID.';
        this.isLoading = false;
      }
    });
  }

  fetchPolicyAndAnalysis(): void {
    this.isLoading = true;
    if (!this.policyId) return;

    this.policyService.getPolicy(this.policyId).subscribe({
      next: (p) => {
        this.policy = p;
        this.policyService.analyzePolicy(this.policyId!).subscribe({
          next: (res) => {
            this.analysis = res;
            this.isLoading = false;
          },
          error: (err) => {
            this.errorMsg = err.error?.detail || 'Failed to generate AI Policy Analysis.';
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        this.errorMsg = '(HTTP 403 Forbidden) Failed to access. You do not have permission.';
        this.isLoading = false;
      }
    });
  }

  getExplanationKeys(): string[] {
    return this.analysis?.explanations ? Object.keys(this.analysis.explanations) : [];
  }

  goBack(): void {
    this.router.navigate(['/policies']);
  }
}
