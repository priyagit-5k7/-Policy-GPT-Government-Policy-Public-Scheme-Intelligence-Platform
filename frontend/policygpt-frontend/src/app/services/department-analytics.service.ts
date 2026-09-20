import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TrendPoint {
    date: string;
    count: number;
}

export interface CategoryDistribution {
    category: string;
    count: number;
}

export interface PolicyStatusDistribution {
    draft: number;
    pending_approval: number;
    approved: number;
    rejected: number;
    published: number;
}

export interface DepartmentKPIs {
    total_policies: number;
    draft: number;
    pending_approval: number;
    approved: number;
    rejected: number;
    published: number;
    total_schemes: number;
}

export interface DepartmentAnalyticsResponse {
    department: string;
    kpis: DepartmentKPIs;
    policy_status_distribution: PolicyStatusDistribution;
    policy_creation_trend: TrendPoint[];
    policy_category_distribution: CategoryDistribution[];
    scheme_category_distribution: CategoryDistribution[];
}

@Injectable({
    providedIn: 'root'
})
export class DepartmentAnalyticsService {
    private API_URL = '/api/analytics';

    constructor(private http: HttpClient) { }

    getDepartments(): Observable<string[]> {
        return this.http.get<string[]>(`${this.API_URL}/departments`);
    }

    getDepartmentAnalytics(department: string): Observable<DepartmentAnalyticsResponse> {
        return this.http.get<DepartmentAnalyticsResponse>(`${this.API_URL}/department/${department}`);
    }
}
