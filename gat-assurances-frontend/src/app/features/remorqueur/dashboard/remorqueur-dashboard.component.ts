import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../../core/services/dashboard.service';
import { DashboardRemorqueur } from '../../../core/models/dashboard.model';
import { interval, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-remorqueur-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Dashboard Remorqueur</h1>
          <p class="text-gray-500 text-sm mt-1">Vos interventions et disponibilité</p>
        </div>
        <span [class]="data()?.disponible
            ? 'bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium'
            : 'bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium'">
          {{ data()?.disponible ? '● Disponible' : '● Indisponible' }}
        </span>
      </div>

      @if (data()) {
        <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p class="text-sm text-gray-500">Missions ce mois</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">{{ data()!.missionsCeMois }}</p>
          </div>
          <div class="bg-white rounded-xl border border-blue-100 shadow-sm p-5">
            <p class="text-sm text-blue-600">En cours</p>
            <p class="text-3xl font-bold text-blue-700 mt-1">{{ data()!.missionsEnCours }}</p>
          </div>
          <div class="bg-white rounded-xl border border-purple-100 shadow-sm p-5">
            <p class="text-sm text-purple-600">Notifications</p>
            <p class="text-3xl font-bold text-purple-700 mt-1">{{ data()!.notificationsNonLues }}</p>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">Actions</h2>
          <div class="flex flex-wrap gap-3">
            <a routerLink="/remorqueur/interventions"
               class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
              Mes interventions
            </a>
            <a routerLink="/remorqueur/interventions" [queryParams]="{statut:'EN_ATTENTE'}"
               class="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition">
              Demandes disponibles
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
export class RemorqueurDashboardComponent implements OnInit {
  data = signal<DashboardRemorqueur | null>(null);

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    interval(30000).pipe(
      startWith(0),
      switchMap(() => this.dashboardService.getRemorqueur())
    ).subscribe({
      next: (d) => this.data.set(d),
      error: () => this.data.set({
        missionsCeMois: 0,
        missionsEnCours: 0,
        disponible: true,
        notificationsNonLues: 0
      })
    });
  }
}
