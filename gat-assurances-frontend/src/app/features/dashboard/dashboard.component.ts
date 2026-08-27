import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, NgIf, NgForOf } from '@angular/common';
import { AuthService } from '@core/services/auth.service';
import { AuthResponse, Role } from '@core/models/user.model';
import { ApiService } from '@core/services/api.service';
import { StatutSinistre } from '@core/models/sinistre.model';

export interface SinistreStats {
  total: number;
  declares: number;
  enCours: number;
  enExpertise: number;
  acceptes: number;
  refuses: number;
  rembourses: number;
  clotures: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe, NgIf, NgForOf],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Tableau de bord</h1>
<p class="text-gray-500">Bienvenue, {{ currentUser?.user?.prenom }} {{ currentUser?.user?.nom }}</p>
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <span class="w-2 h-2 bg-green-500 rounded-full"></span>
          {{ currentDate | date:'EEEE d MMMM yyyy' }}
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="card border-l-4 border-l-gat-blue">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 font-medium">Total Sinistres</p>
              <p class="text-2xl font-bold text-gat-blue mt-1">{{ stats?.total || 0 }}</p>
            </div>
            <div class="w-12 h-12 bg-gat-blue/10 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-gat-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
          </div>
          <div class="mt-3 flex items-center text-xs text-gray-500">
            <span class="text-gat-orange font-medium">{{ stats?.enCours || 0 }}</span>
            <span class="ml-1">en cours de traitement</span>
          </div>
        </div>

        <div class="card border-l-4 border-l-purple-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 font-medium">En Expertise</p>
              <p class="text-2xl font-bold text-purple-600 mt-1">{{ stats?.enExpertise || 0 }}</p>
            </div>
            <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
          </div>
          <div class="mt-3 flex items-center text-xs text-gray-500">
            <span class="text-purple-500 font-medium">{{ stats?.enExpertise || 0 }}</span>
            <span class="ml-1">dossiers en expertise</span>
          </div>
        </div>

        <div class="card border-l-4 border-l-green-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 font-medium">Acceptés</p>
              <p class="text-2xl font-bold text-green-600 mt-1">{{ stats?.acceptes || 0 }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
          <div class="mt-3 flex items-center text-xs text-gray-500">
            <span class="text-green-500 font-medium">{{ stats?.rembourses || 0 }}</span>
            <span class="ml-1">dossiers remboursés</span>
          </div>
        </div>

        <div class="card border-l-4 border-l-gray-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 font-medium">Clôturés</p>
              <p class="text-2xl font-bold text-gray-800 mt-1">{{ stats?.clotures || 0 }}</p>
            </div>
            <div class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
          </div>
          <div class="mt-3 flex items-center text-xs text-gray-500">
            <span class="text-gray-500 font-medium">{{ stats?.clotures || 0 }}</span>
            <span class="ml-1">dossiers terminés</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions & Recent -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Quick Actions -->
        <div class="lg:col-span-1 card">
          <h3 class="font-semibold text-gray-800 mb-4">Actions rapides</h3>
          <div class="space-y-3">
            <a routerLink="/sinistres/new" class="flex items-center gap-3 p-3 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              <span class="text-sm font-medium">Nouveau sinistre</span>
            </a>
            <a routerLink="/clients/new" class="flex items-center gap-3 p-3 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
              </svg>
              <span class="text-sm font-medium">Nouveau client</span>
            </a>
            <a routerLink="/missions/new" class="flex items-center gap-3 p-3 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              <span class="text-sm font-medium">Nouvelle mission</span>
            </a>
          </div>

          <!-- Stats by status -->
          <div class="mt-6">
            <h4 class="text-sm font-semibold text-gray-700 mb-3">Répartition par statut</h4>
            <div class="space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Déclarés</span>
                <span class="font-medium text-gray-800">{{ stats?.declares || 0 }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">En cours</span>
                <span class="font-medium text-orange-600">{{ stats?.enCours || 0 }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Expertise</span>
                <span class="font-medium text-purple-600">{{ stats?.enExpertise || 0 }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Acceptés</span>
                <span class="font-medium text-green-600">{{ stats?.acceptes || 0 }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Refusés</span>
                <span class="font-medium text-red-600">{{ stats?.refuses || 0 }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Remboursés</span>
                <span class="font-medium text-blue-600">{{ stats?.rembourses || 0 }}</span>
              </div>
              <div class="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
                <span class="font-medium text-gray-700">Clôturés</span>
                <span class="font-medium text-gray-800">{{ stats?.clotures || 0 }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent claims -->
        <div class="lg:col-span-2 card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-800">Derniers sinistres</h3>
            <a routerLink="/sinistres" class="text-sm text-primary-600 hover:text-primary-700 font-medium">Voir tout</a>
          </div>

          <ng-container *ngIf="recentSinistres.length === 0">
            <div class="text-center py-8 text-gray-400">
              <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <p>Aucun sinistre récent</p>
            </div>
          </ng-container><ng-container *ngIf="!(recentSinistres.length === 0)">
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Référence</th>
                    <th>Client</th>
                    <th>Statut</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  <ng-container *ngFor="let sin of recentSinistres">
                    <tr class="cursor-pointer" (click)="viewSinistre(sin.id)">
                      <td class="font-medium text-primary-600">{{ sin.reference }}</td>
                      <td>{{ sin.clientNom }}</td>
                      <td>
                        <span class="badge" [class]="getStatusClass(sin.statut)">{{ sin.statut }}</span>
                      </td>
                      <td class="text-gray-500">{{ sin.dateDeclaration | date:'dd/MM/yyyy' }}</td>
                    </tr>
                  </ng-container>
                </tbody>
              </table>
            </div>
          </ng-container>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  currentUser: AuthResponse | null;
  currentDate = new Date();
  stats: SinistreStats | null = null;
  recentSinistres: any[] = [];

  constructor(
    private authService: AuthService,
    private api: ApiService
  ) {
    this.currentUser = this.authService.getCurrentUser();
    this.loadData();
  }
  private loadData(): void {
    this.api.get<SinistreStats>('sinistres/stats').subscribe({
      next: (data) => this.stats = data,
      error: () => {
        // Fallback pour l'instant (pas de backend)
        this.stats = {
          total: 0, declares: 0, enCours: 0, enExpertise: 0,
          acceptes: 0, refuses: 0, rembourses: 0, clotures: 0
        };
      }
    });

    // Fallback data for demo
    this.loadMockData();
  }

  private loadMockData(): void {
    // Données de démonstration GAT
    this.stats = {
      total: 128,
      declares: 32,
      enCours: 28,
      enExpertise: 15,
      acceptes: 22,
      refuses: 8,
      rembourses: 18,
      clotures: 45
    };

    this.recentSinistres = [
      { id: 1, reference: 'SIN-2025-001', clientNom: 'Trabelsi Mohamed', statut: 'EN_EXPERTISE', dateDeclaration: '2025-02-20' },
      { id: 2, reference: 'SIN-2025-002', clientNom: 'Ben Ali Sami', statut: 'EN_COURS', dateDeclaration: '2025-02-19' },
      { id: 3, reference: 'SIN-2025-003', clientNom: 'Mabrouk Ahmed', statut: 'ACCEPTE', dateDeclaration: '2025-02-18' },
      { id: 4, reference: 'SIN-2025-004', clientNom: 'Khalil Mehdi', statut: 'DECLARE', dateDeclaration: '2025-02-17' },
      { id: 5, reference: 'SIN-2025-005', clientNom: 'Sfaxi Hichem', statut: 'CLOTURE', dateDeclaration: '2025-02-16' },
    ];
  }

  getStatusClass(statut: string): string {
    const map: Record<string, string> = {
      'DECLARE': 'badge-info',
      'EN_COURS': 'badge-warning',
      'EN_EXPERTISE': 'bg-purple-100 text-purple-800',
      'ACCEPTE': 'badge-success',
      'REFUSE': 'badge-danger',
      'REMBOURSE': 'bg-blue-100 text-blue-800',
      'CLOTURE': 'bg-gray-100 text-gray-800'
    };
    return map[statut] || 'badge-info';
  }

  viewSinistre(id: number): void {
    window.location.href = `/sinistres/${id}`;
  }
}

