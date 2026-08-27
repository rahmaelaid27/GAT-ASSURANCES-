import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Notification } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly API = 'http://localhost:8081/api/notifications';

  /** Signal réactif — badge Navbar */
  unreadCount = signal<number>(0);

  constructor(private http: HttpClient) {}

  findAll(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.API).pipe(
      catchError(() => of([]))
    );
  }

  refreshCount(): void {
    this.http.get<{ count?: number }>(`${this.API}/count-unread`).pipe(
      catchError(() => of({ count: 0 }))
    ).subscribe(res => {
      this.unreadCount.set(Number(res?.count ?? 0));
    });
  }

  markAsRead(id: number): Observable<void> {
    return this.http.put<void>(`${this.API}/${id}/read`, {}).pipe(
      tap(() => this.refreshCount()),
      catchError(() => of(undefined))
    );
  }

  markAllAsRead(): Observable<void> {
    return this.http.put<void>(`${this.API}/read-all`, {}).pipe(
      tap(() => this.unreadCount.set(0)),
      catchError(() => of(undefined))
    );
  }

  deleteRead(): Observable<void> {
    return this.http.delete<void>(`${this.API}/delete-read`).pipe(
      catchError(() => of(undefined))
    );
  }
}
