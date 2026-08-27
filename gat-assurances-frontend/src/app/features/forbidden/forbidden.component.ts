import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div class="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 text-red-600 mb-6">
        <span class="text-3xl font-bold">403</span>
      </div>
      <h1 class="text-3xl font-bold text-gray-900 mb-3">Accès interdit</h1>
      <p class="text-gray-600 max-w-xl mb-6">
        Vous n'avez pas la permission d'accéder à cette page. Si vous pensez que c'est une erreur,
        contactez l'administrateur ou revenez à votre espace.
      </p>
      <a routerLink="/dashboard" class="btn-primary px-6 py-3">Retour au tableau de bord</a>
    </div>
  `
})
export class ForbiddenComponent {}
