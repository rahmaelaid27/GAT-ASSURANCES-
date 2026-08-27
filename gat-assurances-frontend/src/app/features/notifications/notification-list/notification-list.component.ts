import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { ApiService } from '@core/services/api.service';
import { NotificationService } from '@core/services/notification.service';
import { Notification } from '@core/models/notification.model';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [ RouterLink, DatePipe, NgForOf, NgIf],
  template: `
    <div class="max-w-3xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Notifications</h1>
          <p class="text-gray-500">Centre de notifications</p>
        </div>
        <button (click)="markAllRead()" class="btn-secondary text-sm">Tout marquer comme lu</button>
      </div>

      <div class="space-y-3">
        <ng-container *ngFor="let n of notifications">
          <div class="card flex items-start gap-4 cursor-pointer" [class.bg-primary-50]="!n.lu" (click)="markRead(n.id)">
            <div class="w-2 h-2 mt-2 rounded-full flex-shrink-0" [class.bg-primary-600]="!n.lu" [class.bg-transparent]="n.lu"></div>
            <div class="flex-1">
              <h4 class="font-medium text-sm">{{ n.titre }}</h4>
              <p class="text-sm text-gray-600">{{ n.message }}</p>
              <p class="text-xs text-gray-400 mt-1">{{ n.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
            </div>
          </div>
        </ng-container>
        <ng-container *ngIf="!notifications?.length">
          <div class="text-center py-12 text-gray-400">
            <svg class="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            <p>Aucune notification</p>
          </div>
        </ng-container>
      </div>
    </div>
  `
})
export class NotificationListComponent {
  notifications: Notification[] = [];

  constructor(
    private notificationService: NotificationService,
    private api: ApiService
  ) {
    this.api.get<Notification[]>('notifications').subscribe({
      next: (data) => this.notifications = data,
      error: () => this.notifications = []
    });
  }

  markRead(id: number): void {
    this.notificationService.markAsRead(id).subscribe(() => {
      const notif = this.notifications.find(n => n.id === id);
      if (notif) notif.lu = true;
      this.notificationService.refreshCount();
    });
  }

  markAllRead(): void {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.notifications.forEach(n => n.lu = true);
      this.notificationService.refreshCount();
    });
  }
}
