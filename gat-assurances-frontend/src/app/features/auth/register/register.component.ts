import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

const ROLES = [
  { value: 'CLIENT',     label: '👤 Client',           desc: 'Propriétaire de véhicule' },
  { value: 'GARAGE',     label: '🔧 Garage',            desc: 'Prestataire de réparation' },
  { value: 'EXPERT',     label: '🔍 Expert automobile', desc: 'Évaluateur de sinistres' },
  { value: 'REMORQUEUR', label: '🚛 Remorqueur',        desc: 'Service de remorquage' },
];

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
<div class="bg-white rounded-2xl shadow-2xl p-8">
  <h2 class="text-xl font-bold text-gray-900 mb-1">Créer un compte</h2>
  <p class="text-gray-500 text-sm mb-6">Rejoignez la plateforme GAT Assurances</p>

  @if (error()) {
    <div class="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4 flex items-start gap-2">
      <span class="shrink-0 mt-0.5">⚠️</span>
      <span>{{ error() }}</span>
    </div>
  }
  @if (success()) {
    <div class="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-4">
      ✅ Compte créé avec succès !
      <a routerLink="/auth/login" class="underline font-medium ml-1">Se connecter</a>
    </div>
  }

  <form (ngSubmit)="$event.preventDefault(); register()" class="space-y-4">

    <!-- Sélection du rôle -->
    <div>
      <label class="block text-sm font-semibold text-gray-700 mb-2">
        Vous êtes <span class="text-red-500">*</span>
      </label>
      <div class="grid grid-cols-2 gap-2">
        @for (r of roles; track r.value) {
          <button type="button" (click)="form.role = r.value"
                  class="flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all"
                  [style.border-color]="form.role === r.value ? '#6B2D8B' : '#E5E7EB'"
                  [style.background]="form.role === r.value ? 'rgba(107,45,139,0.06)' : 'white'">
            <span class="text-lg leading-none">{{ r.label.split(' ')[0] }}</span>
            <div>
              <p class="text-xs font-semibold leading-tight"
                 [style.color]="form.role === r.value ? '#6B2D8B' : '#374151'">
                {{ r.label.substring(2) }}
              </p>
              <p class="text-[10px] text-gray-400 leading-tight mt-0.5">{{ r.desc }}</p>
            </div>
          </button>
        }
      </div>
    </div>

    <!-- Prénom + Nom -->
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Prénom <span class="text-red-500">*</span></label>
        <input type="text" [(ngModel)]="form.prenom" name="prenom" required
               class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B2D8B]/30 focus:border-[#6B2D8B]"/>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Nom <span class="text-red-500">*</span></label>
        <input type="text" [(ngModel)]="form.nom" name="nom" required
               class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B2D8B]/30 focus:border-[#6B2D8B]"/>
      </div>
    </div>

    <!-- Email -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Email <span class="text-red-500">*</span></label>
      <input type="email" [(ngModel)]="form.email" name="email" required
             class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B2D8B]/30 focus:border-[#6B2D8B]"/>
    </div>

    <!-- Téléphone + CIN -->
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
        <input type="tel" [(ngModel)]="form.telephone" name="telephone"
               placeholder="+216 XX XXX XXX"
               class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B2D8B]/30 focus:border-[#6B2D8B]"/>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          CIN <span class="text-xs text-gray-400 font-normal">(8 chiffres)</span>
        </label>
        <input type="text" [(ngModel)]="form.cin" name="cin" maxlength="8" pattern="[0-9]*"
               placeholder="12345678"
               class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B2D8B]/30 focus:border-[#6B2D8B]"/>
      </div>
    </div>

    <!-- Mot de passe -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe <span class="text-red-500">*</span></label>
      <input type="password" [(ngModel)]="form.password" name="password" required minlength="6"
             class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B2D8B]/30 focus:border-[#6B2D8B]"/>
      <p class="text-xs text-gray-400 mt-1">Minimum 6 caractères</p>
    </div>

    <button type="button" (click)="register()" [disabled]="loading() || !form.role"
            class="w-full text-white font-semibold py-3 rounded-xl text-sm transition-all
                   disabled:opacity-50 hover:-translate-y-0.5"
            style="background:linear-gradient(135deg,#6B2D8B,#E5162A);box-shadow:0 4px 14px rgba(107,45,139,0.35)">
      {{ loading() ? 'Création en cours…' : 'Créer mon compte' }}
    </button>

    <p class="text-center text-sm text-gray-500">
      Déjà un compte ?
      <a routerLink="/auth/login" style="color:#6B2D8B" class="hover:underline font-semibold">Se connecter</a>
    </p>
  </form>
</div>
  `
})
export class RegisterComponent {
  roles = ROLES;
  form  = { nom: '', prenom: '', email: '', telephone: '', cin: '', password: '', role: 'CLIENT' };
  loading = signal(false);
  error   = signal<string | null>(null);
  success = signal(false);

  constructor(private http: HttpClient, private router: Router) {}

  register(): void {
    if (!this.form.role) { this.error.set('Veuillez choisir votre rôle.'); return; }
    this.loading.set(true);
    this.error.set(null);
    const payload: any = { ...this.form };
    if (!payload.cin) delete payload.cin;
    this.http.post('http://localhost:8081/api/auth/register', payload)
      .subscribe({
        next: () => { this.loading.set(false); this.success.set(true); },
        error: (e) => {
          this.loading.set(false);
          const msg = e.error?.message
            ?? e.error?.errors?.[0]?.defaultMessage
            ?? 'Erreur lors de la création du compte.';
          this.error.set(msg);
        }
      });
  }
}
