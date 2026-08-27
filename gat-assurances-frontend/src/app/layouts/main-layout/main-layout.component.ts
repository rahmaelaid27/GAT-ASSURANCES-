import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../../core/services/auth.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { Role } from '../../core/models';

interface NavItem { label: string; icon: string; route: string; }

const NAV_ITEMS: Record<Role, NavItem[]> = {
  CLIENT: [
    { label: 'Dashboard',        icon: 'home',      route: '/client/dashboard' },
    { label: 'Déclarer sinistre',icon: 'plus',      route: '/client/sinistres/nouveau' },
    { label: 'Mes dossiers',     icon: 'folder',    route: '/client/sinistres' },
    { label: 'Mes véhicules',    icon: 'car',       route: '/client/vehicules' },
    { label: 'Forum',            icon: 'chat',      route: '/client/forum' },
    { label: 'Profil',           icon: 'user',      route: '/client/profil' },
  ],
  GESTIONNAIRE: [
    { label: 'Dashboard',        icon: 'home',      route: '/gestionnaire/dashboard' },
    { label: 'Mes dossiers',     icon: 'folder',    route: '/gestionnaire/dossiers' },
  ],
  GARAGE: [
    { label: 'Dashboard',        icon: 'home',      route: '/garage/dashboard' },
    { label: 'Mes missions',     icon: 'wrench',    route: '/garage/missions' },
    { label: 'Forum',            icon: 'chat',      route: '/garage/forum' },
  ],
  EXPERT: [
    { label: 'Dashboard',        icon: 'home',      route: '/expert/dashboard' },
    { label: 'Mes expertises',   icon: 'search',    route: '/expert/expertises' },
  ],
  REMORQUEUR: [
    { label: 'Dashboard',        icon: 'home',      route: '/remorqueur/dashboard' },
    { label: 'Interventions',    icon: 'truck',     route: '/remorqueur/interventions' },
  ],
  MANAGER: [
    { label: 'Dashboard',        icon: 'home',      route: '/manager/dashboard' },
    { label: 'Statistiques',     icon: 'chart',     route: '/manager/statistiques' },
  ],
  ADMIN: [
    { label: 'Dashboard',        icon: 'home',      route: '/admin/dashboard' },
    { label: 'Utilisateurs',     icon: 'users',     route: '/admin/utilisateurs' },
    { label: 'Partenaires',      icon: 'handshake', route: '/admin/partenaires' },
    { label: 'Audit',            icon: 'scroll',    route: '/admin/audit' },
  ],
};

const ICONS: Record<string, string> = {
  home:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`,
  plus:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>`,
  folder:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg>`,
  car:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 17H3v-5l2-5h14l2 5v5h-2M5 17a2 2 0 004 0M15 17a2 2 0 004 0"/></svg>`,
  chat:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>`,
  user:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>`,
  wrench:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
  search:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>`,
  truck:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 17H5a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3m0 0h2l3 4v3h-5m0 0a2 2 0 11-4 0 2 2 0 014 0zm-9 0a2 2 0 11-4 0 2 2 0 014 0z"/></svg>`,
  chart:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`,
  users:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`,
  handshake: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
  scroll:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`,
};

const ROLE_CONFIG: Record<Role, { label: string; color: string; bg: string }> = {
  CLIENT:       { label: 'Portail Client',  color: '#6B2D8B', bg: 'linear-gradient(180deg,#2E0F45 0%,#6B2D8B 60%,#9E1262 100%)' },
  GESTIONNAIRE: { label: 'Gestionnaire',    color: '#E5162A', bg: 'linear-gradient(180deg,#1A0830 0%,#6B2D8B 50%,#E5162A 100%)' },
  GARAGE:       { label: 'Espace Garage',   color: '#F5A623', bg: 'linear-gradient(180deg,#1A0830 0%,#4A1A6B 50%,#D4891A 100%)' },
  EXPERT:       { label: 'Espace Expert',   color: '#E5162A', bg: 'linear-gradient(180deg,#2E0F45 0%,#6B2D8B 50%,#B5101F 100%)' },
  REMORQUEUR:   { label: 'Remorqueur',      color: '#F5A623', bg: 'linear-gradient(180deg,#1A0830 0%,#6B2D8B 50%,#D4891A 100%)' },
  MANAGER:      { label: 'Manager',         color: '#C4187A', bg: 'linear-gradient(180deg,#1A0830 0%,#6B2D8B 50%,#9E1262 100%)' },
  ADMIN:        { label: 'Administration',  color: '#E5162A', bg: 'linear-gradient(180deg,#1A0830 0%,#3D1A5E 50%,#8B0D18 100%)' },
};

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, NavbarComponent],
  template: `
    <!-- Navbar fixe -->
    <app-navbar />

    <div class="flex h-screen pt-16" style="background:#F8F7FB">

      <!-- Sidebar GAT couleurs exactes -->
      <aside class="fixed top-16 left-0 h-[calc(100vh-4rem)] flex flex-col z-40 shadow-sidebar overflow-hidden sidebar-transition"
             [style.width]="collapsed() ? '68px' : '240px'"
             [style.background]="roleConfig().bg">

        <!-- Toggle -->
        <button (click)="toggleSidebar()"
                class="absolute -right-3 top-7 w-6 h-6 rounded-full flex items-center justify-center
                       text-white text-xs font-bold shadow-lg z-50 border border-white/20 transition-all hover:scale-110"
                style="background:rgba(107,45,139,0.9)">
          {{ collapsed() ? '›' : '‹' }}
        </button>

        <!-- Logo + Rôle -->
        <div class="px-3 py-5 border-b border-white/10">
          @if (!collapsed()) {
            <div class="flex items-center gap-2.5">
              <img src="assets/logo gat.png" alt="GAT" class="h-9 object-contain"
                   onerror="this.style.display='none'">
              <div>
                <p class="text-white text-xs font-bold leading-none">{{ roleConfig().label }}</p>
                <p class="text-white/50 text-[10px] mt-0.5">GAT Assurances</p>
              </div>
            </div>
          } @else {
            <div class="flex justify-center">
              <div class="w-9 h-9 rounded-full flex items-center justify-center font-black text-white text-sm"
                   style="background:rgba(255,255,255,0.15)">
                {{ roleInitial() }}
              </div>
            </div>
          }
        </div>

        <!-- Navigation -->
        <nav class="flex-1 py-3 overflow-y-auto scrollbar-hide space-y-0.5 px-2">
          @for (item of navItems(); track item.route) {
            <a [routerLink]="item.route"
               routerLinkActive="active-nav"
               class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70
                      hover:bg-white/12 hover:text-white transition-all duration-200 group"
               [class.!w-9]="collapsed()" [class.!px-2]="collapsed()" [class.!justify-center]="collapsed()">
              <span class="w-5 h-5 shrink-0 text-white/70 group-hover:text-white transition-colors [&_svg]:w-5 [&_svg]:h-5"
                    [innerHTML]="getIcon(item.icon)"></span>
              @if (!collapsed()) {
                <span class="text-sm font-medium truncate">{{ item.label }}</span>
              }
            </a>
          }
        </nav>

        <!-- Bas de sidebar -->
        @if (!collapsed()) {
          <div class="p-3 border-t border-white/10">
            <button (click)="logout()"
                    class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-white/50
                           hover:bg-white/10 hover:text-white transition-all text-xs font-medium">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              Déconnexion
            </button>
          </div>
        }
      </aside>

      <!-- Contenu -->
      <main class="flex-1 overflow-y-auto content-transition"
            [style.margin-left]="collapsed() ? '68px' : '240px'">
        <router-outlet />
      </main>
    </div>

    <style>
      .active-nav { background: rgba(255,255,255,0.20) !important; color: white !important; }
      .active-nav span { color: white !important; }
    </style>
  `
})
export class MainLayoutComponent {
  private authService = inject(AuthService);
  private sanitizer   = inject(DomSanitizer);
  collapsed = signal(false);

  navItems  = computed<NavItem[]>(() => {
    const r = this.authService.getRole();
    return r ? (NAV_ITEMS[r] ?? []) : [];
  });
  roleConfig = computed(() => {
    const r = this.authService.getRole() ?? 'CLIENT';
    return ROLE_CONFIG[r];
  });

  toggleSidebar(): void { this.collapsed.update(v => !v); }
  roleInitial(): string { return (this.authService.getRole() ?? 'G').charAt(0); }
  getIcon(name: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(ICONS[name] ?? ICONS['home']);
  }
  logout(): void { this.authService.logout(); }
}
