import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SchemeService, Scheme } from '../../services/scheme.service';
import { AuthService, AuthUser } from '../../services/auth.service';

@Component({
  selector: 'app-scheme-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './scheme-list.html',
  styleUrl: './scheme-list.css'
})
export class SchemeList implements OnInit {
  schemes: Scheme[] = [];
  schemeForm: FormGroup;
  showForm = false;
  isEditing = false;
  currentEditingId: number | null = null;
  isLoading = false;
  isLoadingData = false;
  currentUser: AuthUser | null = null;

  get canManageSchemes(): boolean {
    if (!this.currentUser) return false;
    const r = (this.currentUser.role || '').toLowerCase();
    return r === 'government_official' || r === 'administrator' || r === 'official';
  }

  constructor(
    private fb: FormBuilder,
    private schemeService: SchemeService,
    private authService: AuthService
  ) {
    this.schemeForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      category: [''],
      department: [''],
      eligibility_criteria: [''],
      benefits: [''],
      status: ['Active']
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    this.authService.getCurrentUser().subscribe({
      next: (user) => this.currentUser = user,
      error: (err) => console.error(err)
    });
    this.loadSchemes();
  }

  loadSchemes(): void {
    this.schemeService.getSchemes().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.schemes = data;
        }
        this.isLoadingData = false;
      },
      error: (err) => {
        console.warn('Backend schemes fetch failed, using fallback schemes:', err);
        this.isLoadingData = false;
      }
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  editScheme(scheme: Scheme): void {
    this.isEditing = true;
    this.showForm = true;
    this.currentEditingId = scheme.id;
    this.schemeForm.patchValue({
      title: scheme.title,
      description: scheme.description,
      category: scheme.category,
      department: scheme.department,
      eligibility_criteria: scheme.eligibility_criteria,
      benefits: scheme.benefits,
      status: scheme.status || 'Active'
    });
  }

  deleteScheme(id: number): void {
    if (confirm('Are you sure you want to delete this scheme?')) {
      this.schemeService.deleteScheme(id).subscribe({
        next: () => {
          this.schemes = this.schemes.filter(s => s.id !== id);
        },
        error: (err) => console.error(err)
      });
    }
  }

  onSubmit(): void {
    if (this.schemeForm.invalid) return;

    this.isLoading = true;
    if (this.isEditing && this.currentEditingId) {
      this.schemeService.updateScheme(this.currentEditingId, this.schemeForm.value).subscribe({
        next: (updatedScheme) => {
          const index = this.schemes.findIndex(s => s.id === this.currentEditingId);
          if (index !== -1) {
            this.schemes[index] = updatedScheme;
          }
          this.resetForm();
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
        }
      });
    } else {
      this.schemeService.createScheme(this.schemeForm.value).subscribe({
        next: (newScheme) => {
          this.schemes.unshift(newScheme);
          this.resetForm();
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
        }
      });
    }
  }

  resetForm(): void {
    this.showForm = false;
    this.isEditing = false;
    this.currentEditingId = null;
    this.isLoading = false;
    this.schemeForm.reset({ status: 'Active' });
  }
}
