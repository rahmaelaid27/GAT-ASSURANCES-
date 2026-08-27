import { Component, HostListener, inject } from '@angular/core';
import { NgIf, NgForOf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, NgIf, NgForOf],
  template: `
<div>
  <header [class]="'fixed top-0 left-0 right-0 z-50 transition-all duration-500 ' + (scrolled ? 'bg-white/80 backdrop-blur-xl shadow-sm' : 'bg-transparent')">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 lg:h-20">
        <a routerLink="/" class="flex items-center gap-3 group">
          <img src="assets/logo%20gat.png" alt="GAT Assurances" class="w-10 h-10 lg:w-12 lg:h-12 object-contain transition-transform duration-300 group-hover:scale-105">
        </a>
        <nav class="hidden lg:flex items-center gap-1">
          <ng-container *ngFor="let item of navItems">
            <a [href]="item.href" class="px-4 py-2 text-sm font-medium rounded-full transition-all duration-200"
               [class.text-primary-700]="activeSection === item.href"
               [class.text-gray-600]="activeSection !== item.href"
               [class.hover:text-primary-600]="activeSection !== item.href"
               [class.hover:bg-primary-50]="activeSection !== item.href">{{ item.label }}</a>
          </ng-container>
        </nav>
        <div class="flex items-center gap-3">
          <ng-container *ngIf="isLoggedIn">
            <a routerLink="/dashboard" class="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-full bg-gradient-to-r from-[#5E2B8A] via-[#C2173F] to-[#F35A22] hover:shadow-lg hover:shadow-purple-500/25 hover:-translate-y-0.5 transition-all duration-300">Tableau de bord</a>
          </ng-container>
          <ng-container *ngIf="!(isLoggedIn)">
            <button (click)="openLoginModal()" class="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-full bg-gradient-to-r from-[#5E2B8A] via-[#C2173F] to-[#F35A22] hover:shadow-lg hover:shadow-purple-500/25 hover:-translate-y-0.5 transition-all duration-300">Connexion</button>
          </ng-container>
          <button (click)="mobileMenuOpen = !mobileMenuOpen" class="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <ng-container *ngIf="mobileMenuOpen"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></ng-container>
              <ng-container *ngIf="!(mobileMenuOpen)"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></ng-container>
            </svg>
          </button>
        </div>
      </div>
      <ng-container *ngIf="mobileMenuOpen">
        <div class="lg:hidden pb-4 border-t border-gray-100 mt-2 pt-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg">
          <nav class="flex flex-col gap-1 px-2">
            <ng-container *ngFor="let item of navItems">
              <a [href]="item.href" class="px-4 py-3 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all" (click)="mobileMenuOpen = false">{{ item.label }}</a>
            </ng-container>
            <ng-container *ngIf="!isLoggedIn">
              <button (click)="openLoginModal(); mobileMenuOpen = false" class="px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#5E2B8A] to-[#C2173F] rounded-xl">Connexion</button>
            </ng-container>
          </nav>
        </div>
      </ng-container>
    </div>
  </header>

  <section id="hero" class="relative min-h-screen flex items-center overflow-hidden bg-white">
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#5E2B8A]/10 via-[#C2173F]/10 to-[#F35A22]/10 blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#F8B400]/10 via-[#F35A22]/10 to-[#5E2B8A]/10 blur-3xl"></div>
    </div>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 relative z-10">
      <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div class="text-center lg:text-left">
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6">
            <span class="text-gray-900">Accélérez la gestion<br>de vos sinistres et missions</span>
          </h1>
          <p class="text-lg sm:text-xl text-gray-500 leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">Optimisez la gestion des sinistres, la collaboration entre partenaires et le suivi des missions en temps réel.</p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <a href="#features" class="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white rounded-full bg-gradient-to-r from-[#5E2B8A] via-[#C2173F] to-[#F35A22] hover:shadow-xl hover:shadow-purple-500/25 hover:-translate-y-1 transition-all duration-300">Découvrir</a>
            <a routerLink="/suivi" class="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold rounded-full border-2 border-[#5E2B8A] text-[#5E2B8A] hover:bg-[#5E2B8A] hover:text-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300 bg-white/50 backdrop-blur-sm">Suivre mon sinistre</a>
            <button (click)="openLoginModal()" class="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold rounded-full border-2 border-gray-200 text-gray-700 hover:border-[#5E2B8A] hover:text-[#5E2B8A] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 bg-white/50 backdrop-blur-sm">Commencer maintenant</button>
          </div>
        </div>
        <div class="relative hidden lg:flex items-center justify-center">
          <div class="relative w-full max-w-lg">
            <div class="relative rounded-3xl overflow-hidden shadow-2xl">
              <div class="absolute inset-0 bg-gradient-to-tr from-[#5E2B8A]/20 via-transparent to-[#F35A22]/20 z-10"></div>
              <div class="absolute -inset-1 bg-gradient-to-r from-[#5E2B8A] via-[#C2173F] to-[#F35A22] rounded-3xl blur-2xl opacity-30 -z-10"></div>
              <img src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&q=80" alt="Véhicule premium" class="w-full h-auto object-cover">
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="features" class="py-20 lg:py-28 bg-gray-50/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Une solution complète pour la gestion automobile</h2>
        <p class="text-lg text-gray-500 max-w-2xl mx-auto">Tous les outils nécessaires pour gérer efficacement vos sinistres, partenaires et missions.</p>
      </div>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        <ng-container *ngFor="let feature of features">
          <div class="bg-white rounded-2xl p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl border border-gray-100">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#5E2B8A]/10 to-[#C2173F]/10 flex items-center justify-center mb-6"><span class="text-2xl">{{ feature.icon }}</span></div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">{{ feature.title }}</h3>
            <p class="text-gray-500 text-sm leading-relaxed mb-5">{{ feature.description }}</p>
          </div>
        </ng-container>
      </div>
    </div>
  </section>

  <footer class="bg-[#1a0533] text-white py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <p class="text-sm text-gray-400">&copy; 2025 GAT Assurances. Tous droits réservés.</p>
      <div class="flex items-center justify-center gap-6 mt-4">
        <a routerLink="/" class="text-sm text-gray-400 hover:text-white transition-colors">Accueil</a>
        <a routerLink="/suivi" class="text-sm text-gray-400 hover:text-white transition-colors">Suivre mon sinistre</a>
        <a routerLink="/auth/register" class="text-sm text-gray-400 hover:text-white transition-colors">Cr&eacute;er un compte</a>
      </div>
    </div>
  </footer>

  <ng-container *ngIf="showLoginModal">
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" (click)="closeLoginModal()">
      <div class="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8" (click)="$event.stopPropagation()">
        <button (click)="closeLoginModal()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        <h3 class="text-2xl font-bold text-gray-900 mb-2">Connexion</h3>
        <p class="text-sm text-gray-500 mb-6">Connectez-vous &agrave; votre espace partenaire</p>
        <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="space-y-4">
          <ng-container *ngIf="loginError"><div class="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">{{ loginError }}</div></ng-container>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" formControlName="email" class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-[#5E2B8A] focus:ring-2 focus:ring-[#5E2B8A]/20" placeholder="votre@email.com">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input type="password" formControlName="password" class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-[#5E2B8A] focus:ring-2 focus:ring-[#5E2B8A]/20" placeholder="Votre mot de passe">
          </div>
          <button type="submit" [disabled]="loginForm.invalid || loginLoading" class="w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#5E2B8A] via-[#C2173F] to-[#F35A22] hover:shadow-lg disabled:opacity-50 transition-all">{{ loginLoading ? 'Connexion...' : 'Connexion' }}</button>
          <a routerLink="/auth/register" (click)="closeLoginModal()" class="block w-full py-3 text-center text-sm font-semibold text-[#5E2B8A] border-2 border-[#5E2B8A]/20 rounded-xl hover:bg-[#5E2B8A]/5 transition-all">Cr&eacute;er un compte</a>
        </form>
      </div>
    </div>
  </ng-container>
</div>
  `
})
export class HomeComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  scrolled = false;
  mobileMenuOpen = false;
  activeSection = '';
  isLoggedIn = false;
  showLoginModal = false;
  modalVisible = false;
  loginLoading = false;
  loginError = '';
  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false]
  });

  navItems = [
    { label: 'Accueil', href: '#hero' },
    { label: 'Suivi sinistre', href: '/suivi' },
    { label: 'Contact', href: '#features' },
  ];

  features = [
    { icon: '🛡️', title: 'Gestion des sinistres', description: 'Déclarez, suivez et gérez l\'ensemble des sinistres en temps réel.' },
    { icon: '🔍', title: 'Suivi par immatriculation', description: 'Suivez l\'état de vos sinistres simplement avec votre plaque d\'immatriculation.' },
    { icon: '📋', title: 'Gestion des missions', description: 'Planifiez et suivez les missions d\'expertise et de remorquage.' },
    { icon: '📊', title: 'Rapports & Statistiques', description: 'Accédez à tous les rapports d\'expertise et indicateurs de performance.' },
    { icon: '💬', title: 'Forum collaboratif', description: 'Échangez avec les partenaires autour de chaque sinistre.' },
    { icon: '🔔', title: 'Notifications', description: 'Recevez des alertes personnalisées sur l\'évolution de vos dossiers.' },
  ];

  constructor() {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
    });
  }

  @HostListener('window:scroll', [])
  onScroll() { this.scrolled = window.scrollY > 50; }

  openLoginModal() {
    this.showLoginModal = true;
    this.loginError = '';
  }

  closeLoginModal() {
    this.showLoginModal = false;
  }

  onLogin() {
    if (this.loginForm.invalid) return;
    this.loginLoading = true;
    this.loginError = '';
    this.authService.login({ email: this.loginForm.value.email, password: this.loginForm.value.password }).subscribe({
      next: () => { this.loginLoading = false; this.closeLoginModal(); this.router.navigate(['/dashboard']); },
      error: (err) => { this.loginLoading = false; this.loginError = err.error?.message || 'Email ou mot de passe incorrect'; }
    });
  }
}
