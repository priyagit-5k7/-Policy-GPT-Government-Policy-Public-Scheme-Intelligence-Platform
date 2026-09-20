import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Report {
  id: number;
  title: string;
  content: string;
  created_by: number;
  created_at: string;
}

export interface ReportSummary {
  total_policies: number;
  published_policies: number;
  pending_policies: number;
  draft_policies: number;
  total_schemes: number;
  active_schemes: number;
  total_feedback: number;
  average_rating: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private API_URL = '/api/reports';

  constructor(private http: HttpClient) {}

  getReports(): Observable<Report[]> {
    return this.http.get<Report[]>(this.API_URL + '/');
  }

  getReportSummary(): Observable<ReportSummary> {
    return this.http.get<ReportSummary>(`${this.API_URL}/summary`);
  }

  getPdfBlob(): Observable<Blob> {
    return this.http.get(`${this.API_URL}/export/pdf`, { responseType: 'blob' });
  }

  getExcelBlob(): Observable<Blob> {
    return this.http.get(`${this.API_URL}/export/excel`, { responseType: 'blob' });
  }

  openPdfInNewTab(): void {
    window.open(`${this.API_URL}/export/pdf`, '_blank');
  }

  downloadPdfReport(customFilename: string = 'PolicyGPT_System_Summary_Report.pdf'): void {
    this.getPdfBlob().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = customFilename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 1000);
      },
      error: (err) => {
        console.error('PDF Report Download Error:', err);
      }
    });
  }

  downloadExcelReport(customFilename: string = 'PolicyGPT_Analytics_Report.xlsx'): void {
    this.getExcelBlob().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = customFilename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 1000);
      },
      error: (err) => {
        console.error('Excel Report Download Error:', err);
      }
    });
  }
}
