import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Notification {
  id: number;
  user_id: number;
  message: string;
  type?: string;
  is_read: boolean;
  created_at: string;
}

export interface UnreadCount {
  unread_count: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private API_URL = '/api/notifications';

  constructor(private http: HttpClient) { }

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.API_URL + '/');
  }

  getUnreadCount(): Observable<UnreadCount> {
    return this.http.get<UnreadCount>(this.API_URL + '/unread-count');
  }

  markAsRead(notificationId: number): Observable<Notification> {
    return this.http.put<Notification>(`${this.API_URL}/${notificationId}/read`, {});
  }

  markAllAsRead(): Observable<any> {
    return this.http.put(`${this.API_URL}/read-all`, {});
  }
}
