import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../../core/services/dashboard.service';
import { AuthService } from '../../../core/services/auth.service';
import { DashboardClient } from '../../../core/models/dashboard.model';
import { STATUT_LABELS, STATUT_COLORS } from '../../../core/models/sinistre.model';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
<div class="min-h-screen p-6 space-y-6 animate-fade-in">

  <!-- Header GAT -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <div class="flex items-center gap-2 mb-1">
        <div class="w-1 h-6 rounded-full" style="background:linear-gradient(#6B2D8B,#E5162A)"></div>
        <h1 class="text-2xl font-bold text-gray-900">Mon Espace Client</h1>
      </div>
      <p class="text-gray-500 text-sm ml-3">
        Bienvenue, <strong>{{ userName() }}</strong> — GAT Assurances
      </p>
    </div>
    <a routerLink="/client/sinistres/nouveau"
       class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm
              transition-all hover:-translate-y-0.5 shadow-lg"
       style="background:linear-gradient(135deg,#6B2D8B,#E5162A);box-shadow:0 4px 15px rgba(107,45,139,0.35)">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
      </svg>
      Déclarer un sinistre
    </a>
  </div>

  @if (!data()) {
    <!-- Skeleton loading -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      @for (i of [1,2,3,4]; track i) {
        <div class="bg-white rounded-2xl p-5 h-24 skeleton-loader border border-gray-100"></div>
      }
    </div>
  } @else {
    <!-- KPI Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">

      <!-- Total dossiers -->
      <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-card hover:shadow-card-hover transition-all count-up"
           style="border-left:4px solid #6B2D8B">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total dossiers</span>
          <div class="w-9 h-9 rounded-xl flex items-center justify-center"
               style="background:rgba(107,45,139,0.1)">
            <svg class="w-5 h-5" style="color:#6B2D8B" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
        </div>
        <p class="text-3xl font-black" style="color:#6B2D8B">{{ data()!.totalDossiers }}</p>
      </div>

      <!-- En cours -->
      <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-card hover:shadow-card-hover transition-all count-up"
           style="border-left:4px solid #F5A623">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide">En cours</span>
          <div class="w-9 h-9 rounded-xl flex items-center justify-center"
               style="background:rgba(245,166,35,0.1)">
            <svg class="w-5 h-5" style="color:#F5A623" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        </div>
        <p class="text-3xl font-black" style="color:#F5A623">{{ data()!.dossiersEnCours }}</p>
      </div>

      <!-- Clôturés -->
      <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-card hover:shadow-card-hover transition-all count-up"
           style="border-left:4px solid #22c55e">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Clôturés</span>
          <div class="w-9 h-9 rounded-xl flex items-center justify-center bg-green-50">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        </div>
        <p class="text-3xl font-black text-green-600">{{ data()!.dossiersClotures }}</p>
      </div>

      <!-- Véhicules -->
      <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-card hover:shadow-card-hover transition-all count-up"
           style="border-left:4px solid #C4187A">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Véhicules</span>
          <div class="w-9 h-9 rounded-xl flex items-center justify-center"
               style="background:rgba(196,24,122,0.1)">
            <svg class="w-5 h-5" style="color:#C4187A" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 17H3v-5l2-5h14l2 5v5h-2M5 17a2 2 0 004 0M15 17a2 2 0 004 0"/>
            </svg>
          </div>
        </div>
        <p class="text-3xl font-black" style="color:#C4187A">{{ data()!.totalVehicules }}</p>
      </div>
    </div>

    <!-- Dossiers en cours -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div class="flex items-center gap-2">
          <div class="w-1 h-5 rounded-full" style="background:linear-gradient(#6B2D8B,#E5162A)"></div>
          <h2 class="font-bold text-gray-900">Dossiers en cours</h2>
        </div>
        <a routerLink="/client/sinistres"
           class="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
           style="color:#6B2D8B; background:rgba(107,45,139,0.08)">
          Voir tout →
        </a>
      </div>

      @if (data()!.sinistresEnCours.length === 0) {
        <div class="flex flex-col items-center justify-center py-14 text-center">
          <div class="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
               style="background:rgba(107,45,139,0.08)">
            <svg class="w-8 h-8" style="color:#6B2D8B" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <p class="text-gray-600 font-semibold">Aucun dossier en cours</p>
          <p class="text-gray-400 text-sm mt-1 mb-4">Vous n'avez pas encore déclaré de sinistre</p>
          <a routerLink="/client/sinistres/nouveau"
             class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
             style="background:linear-gradient(135deg,#6B2D8B,#E5162A)">
            + Déclarer mon premier sinistre
          </a>
        </div>
      } @else {
        <div class="divide-y divide-gray-50">
          @for (s of data()!.sinistresEnCours; track s.id) {
            <div class="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                     style="background:rgba(107,45,139,0.1)">
                  <svg class="w-5 h-5" style="color:#6B2D8B" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 17H3v-5l2-5h14l2 5v5h-2M5 17a2 2 0 004 0M15 17a2 2 0 004 0"/>
                  </svg>
                </div>
                <div>
                  <p class="font-bold text-gray-900 text-sm">{{ s.reference }}</p>
                  <p class="text-xs text-gray-500 mt-0.5">
                    {{ s.vehiculeImmatriculation }} •
                    {{ s.typeSinistre ? s.typeSinistre.replace('_',' ') : '' }} •
                    {{ s.dateSinistre | date:'dd/MM/yyyy' }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <span class="badge text-xs" [ngClass]="statusColor(s.statut)">
                  {{ statusLabel(s.statut) }}
                </span>
                <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a [routerLink]="['/client/sinistres', s.id]"
                     class="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all"
                     style="background:#6B2D8B">
                    Voir
                  </a>
                  <a [routerLink]="['/client/sinistres', s.id, 'forum']"
                     class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border"
                     style="color:#E5162A; border-color:#E5162A">
                    Forum
                  </a>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>

    <!-- Accès rapides -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      @for (action of quickActions; track action.label) {
        <a [routerLink]="action.route"
           class="bg-white rounded-2xl p-5 border border-gray-100 shadow-card hover:shadow-card-hover
                  hover:-translate-y-1 transition-all group text-center cursor-pointer">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-transform group-hover:scale-110"
               [style.background]="action.bg">
            <span class="text-2xl">{{ action.icon }}</span>
          </div>
          <p class="text-sm font-semibold text-gray-800">{{ action.label }}</p>
          <p class="text-xs text-gray-400 mt-0.5">{{ action.sub }}</p>
        </a>
      }
    </div>
  }
</div>
  `
})
export class ClientDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  data = signal<DashboardClient | null>(null);

  quickActions = [
    { icon: '🚗', label: 'Déclarer', sub: 'Nouveau sinistre', route: '/client/sinistres/nouveau', bg: 'rgba(107,45,139,0.10)' },
    { icon: '📋', label: 'Mes dossiers', sub: 'Tous les sinistres', route: '/client/sinistres', bg: 'rgba(229,22,42,0.10)' },
    { icon: '🔧', label: 'Mes véhicules', sub: 'Gérer ma flotte', route: '/client/vehicules', bg: 'rgba(245,166,35,0.10)' },
    { icon: '💬', label: 'Forum', sub: 'Messagerie', route: '/client/sinistres', bg: 'rgba(196,24,122,0.10)' },
  ];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getClient().subscribe({
      next: d => this.data.set(d),
      error: () => this.data.set({ totalDossiers:0, dossiersEnCours:0, dossiersClotures:0, totalVehicules:0, notificationsNonLues:0, sinistresEnCours:[], sinistresRecents:[] })
    });
  }

  userName(): string {
    const u = this.authService.getUser();
    return u ? `${u.prenom} ${u.nom}` : '';
  }
  statusLabel(s: string): string { return (STATUT_LABELS as any)[s] ?? s; }
  statusColor(s: string): string {
    const map: Record<string,string> = {
      DECLARE:'badge-blue', EN_INSTRUCTION:'badge-gold', INCOMPLET:'badge-red',
      GARAGE_AFFECTE:'badge-violet', EXPERT_AFFECTE:'badge-violet',
      EN_EXPERTISE:'badge-violet', EN_REPARATION:'badge-gold',
      EN_ATTENTE_VALIDATION:'badge-gold', APPROUVE:'badge-green',
      CLOTURE:'badge-gray', REFUSE:'badge-red', REMORQUAGE_EN_COURS:'badge-magenta'
    };
    return map[s] ?? 'badge-gray';
  }
}
