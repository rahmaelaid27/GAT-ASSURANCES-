import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="animate-fade-in">

      @if (error()) {
        <div class="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700
                    text-sm px-4 py-3 rounded-xl mb-6">
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          {{ error() }}
        </div>
      }

      <form (ngSubmit)="login()" class="space-y-5">

        <!-- Email -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Adresse email
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
              </svg>
            </div>
            <input type="email" [(ngModel)]="email" name="email" required
                   placeholder="votre@email.com"
                   class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm
                          bg-gray-50 focus:bg-white transition-all duration-200
                          focus:outline-none focus:border-[#6B2D8B] focus:ring-2 focus:ring-[#6B2D8B]/15
                          placeholder:text-gray-400" />
          </div>
        </div>

        <!-- Mot de passe -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="text-sm font-semibold text-gray-700">Mot de passe</label>
            <a href="#" class="text-xs font-medium" style="color:#6B2D8B">Mot de passe oublié ?</a>
          </div>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
            <input [type]="showPwd ? 'text' : 'password'"
                   [(ngModel)]="password" name="password" required
                   placeholder="••••••••"
                   class="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl text-sm
                          bg-gray-50 focus:bg-white transition-all duration-200
                          focus:outline-none focus:border-[#6B2D8B] focus:ring-2 focus:ring-[#6B2D8B]/15
                          placeholder:text-gray-400" />
            <button type="button" (click)="showPwd = !showPwd"
                    class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition">
              @if (showPwd) {
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                </svg>
              } @else {
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              }
            </button>
          </div>
        </div>

        <!-- Bouton connexion — Rouge GAT -->
        <button type="submit"
                [disabled]="loading() || !email || !password"
                class="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200
                       flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed
                       hover:-translate-y-0.5 active:translate-y-0"
                style="background: linear-gradient(135deg, #6B2D8B 0%, #E5162A 100%);
                       box-shadow: 0 4px 15px rgba(107,45,139,0.35);">
          @if (loading()) {
            <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Connexion en cours...</span>
          } @else {
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
            </svg>
            <span>Se connecter</span>
          }
        </button>

        <!-- Divider -->
        <div class="flex items-center gap-3">
          <div class="flex-1 h-px bg-gray-200"></div>
          <span class="text-xs text-gray-400 font-medium">ou</span>
          <div class="flex-1 h-px bg-gray-200"></div>
        </div>

        <!-- Lien register -->
        <a routerLink="/auth/register"
           class="block w-full py-3 text-center text-sm font-semibold rounded-xl border-2
                  transition-all duration-200 hover:bg-[#6B2D8B] hover:text-white"
           style="border-color: #6B2D8B; color: #6B2D8B;">
          Créer un compte client
        </a>
      </form>
    </div>
  `
})
export class LoginComponent {
  email    = '';
  password = '';
  showPwd  = false;
  loading  = signal(false);
  error    = signal<string | null>(null);

  constructor(private authService: AuthService) {}

  login(): void {
    if (!this.email || !this.password) return;
    this.loading.set(true);
    this.error.set(null);
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => { this.loading.set(false); this.authService.redirectToDashboard(); },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.status === 401 ? 'Email ou mot de passe incorrect.' : 'Erreur de connexion.');
      }
    });
  }
}
