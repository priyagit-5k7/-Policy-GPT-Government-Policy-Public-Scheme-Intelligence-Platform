import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Registration } from './auth/registration/registration';
import { CitizenDashboard } from './dashboard/citizen-dashboard/citizen-dashboard';
import { PolicyList } from './pages/policy-list/policy-list';
import { SchemeList } from './pages/scheme-list/scheme-list';
import { Notifications } from './pages/notifications/notifications';
import { Feedback } from './pages/feedback/feedback';
import { Reports } from './pages/reports/reports';
import { LandingPage } from './pages/landing-page/landing-page';
import { PolicyApproval } from './pages/policy-approval/policy-approval';
import { ComparePolicies } from './pages/compare-policies/compare-policies';
import { EligibilityChecker } from './pages/eligibility-checker/eligibility-checker';
import { AnalyticsComponent } from './pages/analytics/analytics';
import { DepartmentAnalyticsComponent } from './pages/department-analytics/department-analytics';
import { AiAnalyzer } from './pages/ai-analyzer/ai-analyzer';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: 'landing', component: LandingPage },
  { path: 'login', component: Login },
  { path: 'register', component: Registration },
  { path: 'dashboard', component: CitizenDashboard, canActivate: [authGuard] },
  { path: 'policies', component: PolicyList, canActivate: [authGuard] },
  { path: 'approval', component: PolicyApproval, canActivate: [authGuard] },
  { path: 'policy-approval', component: PolicyApproval, canActivate: [authGuard] },
  { path: 'schemes', component: SchemeList, canActivate: [authGuard] },
  { path: 'compare', component: ComparePolicies, canActivate: [authGuard] },
  { path: 'eligibility', component: EligibilityChecker, canActivate: [authGuard] },
  { path: 'analyzer/:id', component: AiAnalyzer, canActivate: [authGuard] },
  { path: 'analytics', component: AnalyticsComponent, canActivate: [authGuard] },
  { path: 'department-analytics', component: DepartmentAnalyticsComponent, canActivate: [authGuard] },
  { path: 'notifications', component: Notifications, canActivate: [authGuard] },
  { path: 'feedback', component: Feedback, canActivate: [authGuard] },
  { path: 'reports', component: Reports, canActivate: [authGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

