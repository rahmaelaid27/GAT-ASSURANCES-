import { Component, OnInit, signal, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification, NOTIF_ICON, NOTIF_COLOR } from '../../../core/models/notification.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center
                justify-between px-6 fixed top-0 left-0 right-0 z-50">

      <!-- Logo + Titre -->
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
          <span class="text-white font-bold text-sm">G</span>
        </div>
        <span class="font-bold text-gray-900 text-lg hidden sm:block">GAT Assurances</span>
      </div>

      <!-- Actions droite -->
      <div class="flex items-center gap-4">

        <!-- Cloche notifications -->
        <div class="relative" (clickOutside)="closeNotif()">
          <button (click)="toggleNotif()"
                  class="relative p-2 rounded-full hover:bg-gray-100 transition text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002
                       6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165
                       6 8.388 6 11v3.159c0 .538-.214 1.055-.595
                       1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            @if (notifService.unreadCount() > 0) {
              <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs
                           rounded-full min-w-[18px] h-[18px] flex items-center
                           justify-center px-1 font-bold animate-pulse">
                {{ notifService.unreadCount() > 99 ? '99+' : notifService.unreadCount() }}
              </span>
            }
          </button>

          <!-- Dropdown notifications -->
          @if (notifOpen()) {
            <div class="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border
                        border-gray-100 overflow-hidden z-50">

              <!-- Header dropdown -->
              <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span class="font-semibold text-gray-900 text-sm">
                  Notifications
                  @if (notifService.unreadCount() > 0) {
                    <span class="ml-2 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                      {{ notifService.unreadCount() }} non lues
                    </span>
                  }
                </span>
                <button (click)="markAllRead()"
                        class="text-xs text-blue-600 hover:underline">
                  Tout marquer lu
                </button>
              </div>

              <!-- Liste notifications -->
              <div class="max-h-96 overflow-y-auto">
                @if (notifications().length === 0) {
                  <div class="py-10 text-center text-gray-400 text-sm">
                    Aucune notification.
                  </div>
                } @else {
                  @for (n of notifications(); track n.id) {
                    <div (click)="readAndNavigate(n)"
                         class="flex gap-3 px-4 py-3 cursor-pointer transition border-b
                                border-gray-50 last:border-0
                                {{ n.lu ? 'bg-white hover:bg-gray-50' : 'bg-blue-50 hover:bg-blue-100' }}">
                      <span class="text-lg shrink-0">{{ notifIcon(n.type) }}</span>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900 truncate">{{ n.titre }}</p>
                        <p class="text-xs text-gray-500 mt-0.5 line-clamp-2">{{ n.message }}</p>
                        <p class="text-xs text-gray-400 mt-1">{{ n.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
                      </div>
                      @if (!n.lu) {
                        <div class="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                      }
                    </div>
                  }
                }
              </div>

              <!-- Footer -->
              <div class="px-4 py-2 border-t border-gray-100 flex justify-end">
                <button (click)="deleteRead()"
                        class="text-xs text-gray-400 hover:text-red-500 transition">
                  Supprimer les lues
                </button>
              </div>
            </div>
          }
        </div>

        <!-- Avatar utilisateur -->
        <div class="relative">
          <button (click)="toggleUser()"
                  class="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600
                        flex items-center justify-center text-white text-sm font-bold">
              {{ userInitial() }}
            </div>
            <div class="hidden sm:block text-left">
              <p class="text-sm font-medium text-gray-900 leading-none">{{ userName() }}</p>
              <p class="text-xs text-gray-400 mt-0.5">{{ roleBadge() }}</p>
            </div>
            <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          @if (userMenuOpen()) {
            <div class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border
                        border-gray-100 overflow-hidden z-50">
              <div class="px-4 py-3 border-b border-gray-100">
                <p class="text-sm font-medium text-gray-900">{{ userName() }}</p>
                <p class="text-xs text-gray-400">{{ authService.currentUser()?.email }}</p>
              </div>
              <button (click)="goDashboard()"
                      class="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                🏠 Mon dashboard
              </button>
              <button (click)="logout()"
                      class="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition">
                🚪 Déconnexion
              </button>
            </div>
          }
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent implements OnInit {
  authService     = inject(AuthService);
  notifService    = inject(NotificationService);
  private router  = inject(Router);

  notifOpen    = signal(false);
  userMenuOpen = signal(false);
  notifications = signal<Notification[]>([]);

  ngOnInit(): void {
    this.notifService.refreshCount();
    this.loadNotifications();
    // Polling toutes les 30 secondes
    setInterval(() => {
      this.notifService.refreshCount();
      if (this.notifOpen()) this.loadNotifications();
    }, 30_000);
  }

  loadNotifications(): void {
    this.notifService.findAll().subscribe(n => this.notifications.set(n));
  }

  toggleNotif(): void {
    this.notifOpen.update(v => !v);
    this.userMenuOpen.set(false);
    if (this.notifOpen()) this.loadNotifications();
  }

  toggleUser(): void {
    this.userMenuOpen.update(v => !v);
    this.notifOpen.set(false);
  }

  closeNotif(): void { this.notifOpen.set(false); }

  markAllRead(): void {
    this.notifService.markAllAsRead().subscribe(() => this.loadNotifications());
  }

  readAndNavigate(n: Notification): void {
    if (!n.lu) {
      this.notifService.markAsRead(n.id).subscribe(() => this.loadNotifications());
    }
    this.notifOpen.set(false);
    if (n.sinistreId) {
      const role = this.authService.getRole();
      const prefix: Record<string, string> = {
        CLIENT: '/client', GESTIONNAIRE: '/gestionnaire',
        GARAGE: '/garage', EXPERT: '/expert',
        REMORQUEUR: '/remorqueur', MANAGER: '/manager', ADMIN: '/admin'
      };
      const base = role ? prefix[role] : '/client';
      const path = role === 'GESTIONNAIRE' ? `${base}/dossiers/${n.sinistreId}`
                 : role === 'GARAGE'       ? `${base}/missions`
                 : role === 'EXPERT'       ? `${base}/expertises`
                 :                           `${base}/sinistres/${n.sinistreId}`;
      this.router.navigate([path]);
    }
  }

  deleteRead(): void {
    this.notifService.deleteRead().subscribe(() => this.loadNotifications());
  }

  goDashboard(): void {
    this.userMenuOpen.set(false);
    this.authService.redirectToDashboard();
  }

  logout(): void { this.authService.logout(); }

  userName(): string {
    const u = this.authService.currentUser();
    return u?.user ? `${u.user.prenom ?? ''} ${u.user.nom ?? ''}` : '';
  }

  userInitial(): string {
    const u = this.authService.currentUser();
    return u?.user?.prenom ? u.user.prenom.charAt(0).toUpperCase() : '?';
  }

  roleBadge(): string {
    const map: Record<string, string> = {
      CLIENT: 'Client', GESTIONNAIRE: 'Gestionnaire', GARAGE: 'Garage',
      EXPERT: 'Expert', REMORQUEUR: 'Remorqueur', MANAGER: 'Manager', ADMIN: 'Administrateur'
    };
    return this.authService.getRole() ? map[this.authService.getRole()!] ?? '' : '';
  }

  notifIcon(type: string): string { return (NOTIF_ICON as any)[type] ?? 'ℹ️'; }

  /** Ferme les dropdowns si clic hors -->  */
  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (!target.closest('app-navbar')) {
      this.notifOpen.set(false);
      this.userMenuOpen.set(false);
    }
  }
}
