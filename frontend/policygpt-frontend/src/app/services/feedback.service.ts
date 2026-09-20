import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Feedback {
  id: number;
  user_id?: number;
  user_name?: string;
  rating?: number;
  likes?: number;
  subject?: string;
  content?: string;
  message?: string;
  status?: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private API_URL = '/api/feedback';

  constructor(private http: HttpClient) {}

  getFeedbacks(): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(this.API_URL + '/');
  }

  createFeedback(feedback: { subject?: string, content?: string, user_name?: string, rating?: number, message?: string }): Observable<Feedback> {
    return this.http.post<Feedback>(this.API_URL + '/', feedback);
  }

  deleteFeedback(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }
}
