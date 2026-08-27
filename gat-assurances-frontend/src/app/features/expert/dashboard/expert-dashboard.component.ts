import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../../core/services/dashboard.service';
import { DashboardExpert } from '../../../core/models/dashboard.model';

@Component({
  selector: 'app-expert-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6 space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Dashboard Expert</h1>
        <p class="text-gray-500 text-sm mt-1">Vos expertises et rapports</p>
      </div>

      @if (data()) {
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p class="text-sm text-gray-500">Expertises ce mois</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">{{ data()!.totalExpertisesMois }}</p>
          </div>
          <div class="bg-white rounded-xl border border-amber-100 shadow-sm p-5">
            <p class="text-sm text-amber-600">À planifier</p>
            <p class="text-3xl font-bold text-amber-700 mt-1">{{ data()!.aPlanifier }}</p>
          </div>
          <div class="bg-white rounded-xl border border-green-100 shadow-sm p-5">
            <p class="text-sm text-green-600">Rapports déposés</p>
            <p class="text-3xl font-bold text-green-700 mt-1">{{ data()!.rapportsDeposes }}</p>
          </div>
          <div class="bg-white rounded-xl border border-yellow-100 shadow-sm p-5">
            <p class="text-sm text-yellow-600">Note moyenne</p>
            <p class="text-3xl font-bold text-yellow-700 mt-1">{{ data()!.noteMoyenne | number:'1.1-1' }} ⭐</p>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-800">Expertises récentes</h2>
            <a routerLink="/expert/expertises" class="text-sm text-blue-600 hover:underline">Voir tout</a>
          </div>
          @if (data()!.missionsRecentes.length === 0) {
            <p class="text-gray-400 text-sm text-center py-6">Aucune expertise récente.</p>
          } @else {
            <div class="space-y-3">
              @for (m of data()!.missionsRecentes; track m.id) {
                <div class="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div>
                    <p class="font-medium text-gray-900">{{ m.sinistreReference }}</p>
                    <p class="text-xs text-gray-500">
                      {{ m.statut }}
                      @if (m.dateExpertisePrevue) {
                        — Prévu le {{ m.dateExpertisePrevue | date:'dd/MM/yyyy HH:mm' }}
                      }
                    </p>
                  </div>
                  <div class="flex gap-2">
                    <a [routerLink]="['/expert/expertises', m.id]"
                       class="text-blue-600 text-sm hover:underline">Gérer</a>
                    <a [routerLink]="['/expert/expertises', m.id, 'forum']"
                       class="text-indigo-600 text-sm hover:underline">Forum</a>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      } @else {
        <div class="flex justify-center py-20">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      }
    </div>
  `
})
export class ExpertDashboardComponent implements OnInit {
  data = signal<DashboardExpert | null>(null);
  constructor(private dashboardService: DashboardService) {}
  ngOnInit(): void { this.dashboardService.getExpert().subscribe(d => this.data.set(d)); }
}
