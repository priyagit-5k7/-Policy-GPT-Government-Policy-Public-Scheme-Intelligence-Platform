import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface KeyMetrics {
    total_users: number;
    active_users: number;
    total_policies: number;
    published_policies: number;
    pending_policies: number;
    approved_policies: number;
    rejected_policies: number;
    total_schemes: number;
    policy_searches: number;
    eligibility_checks: number;
    policy_comparisons: number;
    total_feedback: number;
}

export interface TrendPoint {
    date: string;
    count: number;
}

export interface PolicyStatusDistribution {
    draft: number;
    pending_approval: number;
    approved: number;
    rejected: number;
    published: number;
}

export interface CategoryDistribution {
    category: string;
    count: number;
}

export interface UsageActivity {
    searches: number;
    eligibility_checks: number;
    comparisons: number;
    feedback: number;
    notifications: number;
}

export interface AIInsight {
    trend: string;
    observation: string;
    anomaly: string;
    recommendation: string;
}

export interface AnalyticsOverviewResponse {
    metrics: KeyMetrics;
    policy_status_distribution: PolicyStatusDistribution;
    policy_creation_trend: TrendPoint[];
    scheme_category_distribution: CategoryDistribution[];
    usage_activity: UsageActivity;
    insights: AIInsight;
}

@Injectable({
    providedIn: 'root'
})
export class AnalyticsService {
    private apiUrl = '/api/analytics';

    constructor(private http: HttpClient) { }

    getAnalyticsOverview(): Observable<AnalyticsOverviewResponse> {
        return this.http.get<AnalyticsOverviewResponse>(`${this.apiUrl}/overview`);
    }

    logSearch(query: string, filters: string = ''): Observable<any> {
        return this.http.post(`${this.apiUrl}/log-search`, { query, filters });
    }

    logEligibilityCheck(entityId: number = 0): Observable<any> {
        return this.http.post(`${this.apiUrl}/log-eligibility`, { entity_id: entityId });
    }

    logComparison(): Observable<any> {
        return this.http.post(`${this.apiUrl}/log-comparison`, {});
    }
}
