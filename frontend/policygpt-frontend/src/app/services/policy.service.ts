import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Policy {
  id: number;
  title: string;
  description: string;
  category: string;
  department: string;
  state: string;
  status: string;
  created_by?: number;
  reviewed_by?: number;
  review_comment?: string;
  created_at?: string;
  updated_at?: string;
  reviewed_at?: string;
  published_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PolicyService {
  private API_URL = '/api/policies';

  constructor(private http: HttpClient) { }

  getPolicies(): Observable<Policy[]> {
    return this.http.get<Policy[]>(this.API_URL + '/');
  }

  getPendingPolicies(): Observable<Policy[]> {
    return this.http.get<Policy[]>(`${this.API_URL}/pending-approval`);
  }

  getPublishedPolicies(): Observable<Policy[]> {
    return this.http.get<Policy[]>(`${this.API_URL}/published`);
  }

  getPolicy(id: number): Observable<Policy> {
    return this.http.get<Policy>(`${this.API_URL}/${id}`);
  }

  createPolicy(policy: Partial<Policy>): Observable<Policy> {
    return this.http.post<Policy>(this.API_URL + '/', policy);
  }

  updatePolicy(id: number, policy: Partial<Policy>): Observable<Policy> {
    return this.http.put<Policy>(`${this.API_URL}/${id}`, policy);
  }

  deletePolicy(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }

  submitForApproval(id: number): Observable<Policy> {
    return this.http.post<Policy>(`${this.API_URL}/${id}/submit`, {});
  }

  approvePolicy(id: number, comment?: string): Observable<Policy> {
    return this.http.post<Policy>(`${this.API_URL}/${id}/approve`, { comment });
  }

  rejectPolicy(id: number, comment: string): Observable<Policy> {
    return this.http.post<Policy>(`${this.API_URL}/${id}/reject`, { comment });
  }

  publishPolicy(id: number): Observable<Policy> {
    return this.http.post<Policy>(`${this.API_URL}/${id}/publish`, {});
  }

  getAuditLogs(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/${id}/audit-logs`);
  }

  analyzePolicy(id: number): Observable<any> {
    return this.http.get<any>(`/api/analyzer/${id}`);
  }
}

