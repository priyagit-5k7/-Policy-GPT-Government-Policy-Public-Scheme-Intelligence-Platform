import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Scheme {
  id: number;
  title: string;
  description: string;
  category: string;
  department: string;
  state: string;
  status: string;
  eligibility_criteria?: string;
  benefits?: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SchemeService {
  private API_URL = '/api/schemes';

  constructor(private http: HttpClient) {}

  getSchemes(): Observable<Scheme[]> {
    return this.http.get<Scheme[]>(this.API_URL + '/');
  }

  getScheme(id: number): Observable<Scheme> {
    return this.http.get<Scheme>(`${this.API_URL}/${id}`);
  }

  createScheme(scheme: Partial<Scheme>): Observable<Scheme> {
    return this.http.post<Scheme>(this.API_URL + '/', scheme);
  }

  updateScheme(id: number, scheme: Partial<Scheme>): Observable<Scheme> {
    return this.http.put<Scheme>(`${this.API_URL}/${id}`, scheme);
  }

  deleteScheme(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }
}
