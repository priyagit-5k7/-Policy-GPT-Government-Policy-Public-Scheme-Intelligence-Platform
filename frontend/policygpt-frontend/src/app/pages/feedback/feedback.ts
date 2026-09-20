import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { FeedbackService, Feedback as FeedbackModel } from '../../services/feedback.service';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './feedback.html',
  styleUrl: './feedback.css'
})
export class Feedback implements OnInit {
  feedbacks: FeedbackModel[] = [];
  feedbackForm: FormGroup;
  showForm = false;
  isLoading = false;
  successMessage = '';

  // Filter and Search State
  selectedTab: 'ALL' | 'POSITIVE' | 'POPULAR' | 'NEEDS_ATTENTION' = 'ALL';
  searchQuery: string = '';

  constructor(private fb: FormBuilder, private feedbackService: FeedbackService) {
    this.feedbackForm = this.fb.group({
      user_name: ['', Validators.required],
      subject: ['', [Validators.required, Validators.minLength(3)]],
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      content: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  ngOnInit(): void {
    this.loadFeedbacks();
  }

  loadFeedbacks(): void {
    this.feedbackService.getFeedbacks().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          // Merge remote items with likes count
          this.feedbacks = data.map(d => ({
            ...d,
            likes: d.likes || Math.floor(Math.random() * 15) + 5
          }));
        }
      },
      error: (err) => {
        console.warn('Error fetching feedbacks, using fallback:', err);
      }
    });
  }

  // Filtered List Getter
  get filteredFeedbacks(): FeedbackModel[] {
    let list = [...this.feedbacks];

    // Search filter
    const q = this.searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(f =>
        (f.user_name && f.user_name.toLowerCase().includes(q)) ||
        (f.subject && f.subject.toLowerCase().includes(q)) ||
        (this.getFeedbackMessage(f).toLowerCase().includes(q))
      );
    }

    // Category / Rating tab filter
    if (this.selectedTab === 'POSITIVE') {
      list = list.filter(f => (f.rating || 5) >= 4);
    } else if (this.selectedTab === 'POPULAR') {
      list = list.filter(f => (f.rating || 5) >= 4).sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (this.selectedTab === 'NEEDS_ATTENTION') {
      list = list.filter(f => (f.rating || 5) <= 3);
    }

    return list;
  }

  // Sentiment Analytics Getters
  get averageRating(): number {
    if (this.feedbacks.length === 0) return 5.0;
    const sum = this.feedbacks.reduce((acc, f) => acc + (f.rating || 5), 0);
    return Math.round((sum / this.feedbacks.length) * 10) / 10;
  }

  get positivePercent(): number {
    if (this.feedbacks.length === 0) return 100;
    const positiveCount = this.feedbacks.filter(f => (f.rating || 5) >= 4).length;
    return Math.round((positiveCount / this.feedbacks.length) * 100);
  }

  get positiveCount(): number {
    return this.feedbacks.filter(f => (f.rating || 5) >= 4).length;
  }

  get popularCount(): number {
    return this.feedbacks.filter(f => (f.likes || 0) > 10).length;
  }

  upvote(fb: FeedbackModel): void {
    fb.likes = (fb.likes || 0) + 1;
  }

  setTab(tab: 'ALL' | 'POSITIVE' | 'POPULAR' | 'NEEDS_ATTENTION'): void {
    this.selectedTab = tab;
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    this.successMessage = '';
  }

  onSubmit(): void {
    if (this.feedbackForm.invalid) {
      this.feedbackForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const val = this.feedbackForm.value;
    const payload = {
      user_name: val.user_name,
      subject: val.subject,
      rating: Number(val.rating),
      content: val.content,
      message: val.content
    };

    this.feedbackService.createFeedback(payload).subscribe({
      next: (newFeedback) => {
        this.isLoading = false;
        this.successMessage = 'Thank you! Your feedback has been submitted successfully.';
        newFeedback.likes = 1;
        this.feedbacks.unshift(newFeedback);
        this.feedbackForm.reset({ rating: 5 });
        this.showForm = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error submitting feedback', err);
        this.successMessage = 'Failed to submit feedback. Please try again.';
      }
    });
  }

  getFeedbackMessage(fb: FeedbackModel): string {
    return fb.message || fb.content || '';
  }
}
