import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { AuthResponse } from '@core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="flex items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Profil utilisateur</h1>
          <p class="text-gray-500">Consultez et modifiez vos informations de compte.</p>
        </div>
        <a routerLink="/dashboard" class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-full bg-primary-600 hover:bg-primary-700 transition-colors">
          Retour au Dashboard
        </a>
      </div>

      <div class="bg-white rounded-3xl shadow p-6">
        <div class="grid gap-6 sm:grid-cols-2">
          <div>
            <p class="text-xs uppercase tracking-wide text-gray-400">Nom</p>
<p class="mt-2 text-lg font-medium text-gray-900">{{ currentUser?.user?.nom || '-' }}</p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-wide text-gray-400">Prénom</p>
            <p class="mt-2 text-lg font-medium text-gray-900">{{ currentUser?.prenom || '-' }}</p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-wide text-gray-400">Email</p>
            <p class="mt-2 text-lg font-medium text-gray-900">{{ currentUser?.email || '-' }}</p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-wide text-gray-400">Rôle</p>
            <p class="mt-2 text-lg font-medium text-gray-900">{{ currentUser?.role || '-' }}</p>
          </div>
        </div>
      </div>

      <div class="grid gap-6 sm:grid-cols-2">
        <div class="bg-white rounded-3xl shadow p-6">
          <h2 class="text-sm font-semibold text-gray-500 uppercase">Sécurité</h2>
          <p class="mt-2 text-sm text-gray-600">Si vous souhaitez mettre à jour votre mot de passe ou vos préférences, rendez-vous dans les paramètres de votre compte.</p>
        </div>

        <div class="bg-white rounded-3xl shadow p-6">
          <h2 class="text-sm font-semibold text-gray-500 uppercase">Assistance</h2>
          <p class="mt-2 text-sm text-gray-600">Contactez support&#64;gat.com.tn pour toute question liée à votre compte.</p>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent {
  currentUser: AuthResponse | null;

  constructor(private authService: AuthService) {
    this.currentUser = this.authService.getCurrentUser();
  }}
