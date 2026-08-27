import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../../core/services/dashboard.service';
import { DashboardGestionnaire } from '../../../core/models/dashboard.model';
import { STATUT_LABELS, STATUT_COLORS } from '../../../core/models/sinistre.model';
import { interval, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-gestionnaire-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6 space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Dashboard Gestionnaire</h1>
        <p class="text-gray-500 text-sm mt-1">Suivi de vos dossiers en cours</p>
      </div>

      @if (data()) {
        <!-- KPI -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p class="text-sm text-gray-500">Dossiers actifs</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">{{ data()!.dossiersActifs }}</p>
          </div>
          <div class="bg-white rounded-xl border border-amber-100 shadow-sm p-5">
            <p class="text-sm text-amber-600">À valider</p>
            <p class="text-3xl font-bold text-amber-700 mt-1">{{ data()!.dossiersAValider }}</p>
          </div>
          <div class="bg-white rounded-xl border border-red-100 shadow-sm p-5">
            <p class="text-sm text-red-500">Urgents (&gt;7j)</p>
            <p class="text-3xl font-bold text-red-600 mt-1">{{ data()!.dossiersUrgents }}</p>
          </div>
          <div class="bg-white rounded-xl border border-green-100 shadow-sm p-5">
            <p class="text-sm text-green-600">Taux résolution</p>
            <p class="text-3xl font-bold text-green-700 mt-1">{{ data()!.tauxResolution }}%</p>
          </div>
        </div>

        <!-- Dossiers prioritaires -->
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">Dossiers prioritaires</h2>
          @if (data()!.dossiersPrioritaires.length === 0) {
            <p class="text-gray-400 text-sm text-center py-6">Aucun dossier urgent.</p>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-left text-gray-500 border-b">
                    <th class="pb-2 font-medium">Référence</th>
                    <th class="pb-2 font-medium">Type</th>
                    <th class="pb-2 font-medium">Statut</th>
                    <th class="pb-2 font-medium">Client</th>
                    <th class="pb-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (s of data()!.dossiersPrioritaires; track s.id) {
                    <tr class="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td class="py-3 font-medium text-gray-900">{{ s.reference }}</td>
                      <td class="py-3 text-gray-600">{{ s.typeSinistre }}</td>
                      <td class="py-3">
                        <span class="text-xs px-2 py-1 rounded-full {{ statusColor(s.statut) }}">
                          {{ statusLabel(s.statut) }}
                        </span>
                      </td>
                      <td class="py-3 text-gray-600">{{ s.clientNom }}</td>
                      <td class="py-3 flex gap-2">
                        <a [routerLink]="['/gestionnaire/dossiers', s.id]"
                           class="text-blue-600 hover:underline">Gérer</a>
                        <a [routerLink]="['/gestionnaire/dossiers', s.id, 'forum']"
                           class="text-indigo-600 hover:underline">Forum</a>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>

        <!-- Actions rapides -->
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">Actions rapides</h2>
          <div class="flex flex-wrap gap-3">
            <a routerLink="/gestionnaire/dossiers"
               class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
              Tous les dossiers
            </a>
            <a routerLink="/gestionnaire/dossiers" [queryParams]="{statut:'EN_ATTENTE_VALIDATION'}"
               class="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-600 transition">
              En attente de validation ({{ data()!.dossiersAValider }})
            </a>
          </div>
        </div>
      } @else {
        <div class="flex justify-center py-20">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      }
    </div>
  `
})
export class GestionnaireDashboardComponent implements OnInit {
  data = signal<DashboardGestionnaire | null>(null);
  error = signal(false);
  constructor(private dashboardService: DashboardService) {}
  ngOnInit(): void {
    interval(30000).pipe(
      startWith(0),
      switchMap(() => this.dashboardService.getGestionnaire())
    ).subscribe({
      next: d => this.data.set(d),
      error: () => {
        this.error.set(true);
        this.data.set({
          dossiersActifs: 0, dossiersAValider: 0, dossiersUrgents: 0,
          tauxResolution: 0, notificationsNonLues: 0,
          dossiersPrioritaires: [], dossiersRecents: []
        });
      }
    });
  }
  statusLabel(s: string): string { return (STATUT_LABELS as any)[s] ?? s; }
  statusColor(s: string): string { return (STATUT_COLORS as any)[s] ?? ''; }
}
