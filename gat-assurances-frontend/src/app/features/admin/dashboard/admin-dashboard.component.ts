import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../../core/services/dashboard.service';
import { DashboardAdmin } from '../../../core/models/dashboard.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6 space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Dashboard Administrateur</h1>
        <p class="text-gray-500 text-sm mt-1">Gestion du système</p>
      </div>

      @if (data()) {
        <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p class="text-sm text-gray-500">Utilisateurs</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">{{ data()!.totalUtilisateurs }}</p>
          </div>
          <div class="bg-white rounded-xl border border-blue-100 shadow-sm p-5">
            <p class="text-sm text-blue-600">Clients</p>
            <p class="text-3xl font-bold text-blue-700 mt-1">{{ data()!.totalClients }}</p>
          </div>
          <div class="bg-white rounded-xl border border-purple-100 shadow-sm p-5">
            <p class="text-sm text-purple-600">Garages</p>
            <p class="text-3xl font-bold text-purple-700 mt-1">{{ data()!.totalGarages }}</p>
          </div>
          <div class="bg-white rounded-xl border border-indigo-100 shadow-sm p-5">
            <p class="text-sm text-indigo-600">Experts</p>
            <p class="text-3xl font-bold text-indigo-700 mt-1">{{ data()!.totalExperts }}</p>
          </div>
          <div class="bg-white rounded-xl border border-cyan-100 shadow-sm p-5">
            <p class="text-sm text-cyan-600">Remorqueurs</p>
            <p class="text-3xl font-bold text-cyan-700 mt-1">{{ data()!.totalRemorqueurs }}</p>
          </div>
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p class="text-sm text-gray-500">Sinistres</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">{{ data()!.totalSinistres }}</p>
          </div>
        </div>

        <!-- Raccourcis admin -->
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">Gestion</h2>
          <div class="flex flex-wrap gap-3">
            <a routerLink="/admin/utilisateurs"
               class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
              Utilisateurs & Rôles
            </a>
            <a routerLink="/admin/partenaires"
               class="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition">
              Partenaires (Garages / Experts)
            </a>
            <a routerLink="/admin/audit"
               class="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition">
              Journal d'audit
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
export class AdminDashboardComponent implements OnInit {
  data = signal<DashboardAdmin | null>(null);
  error = signal(false);
  constructor(private dashboardService: DashboardService) {}
  ngOnInit(): void {
    this.dashboardService.getAdmin().subscribe({
      next: d => this.data.set(d),
      error: () => {
        this.error.set(true);
        // Afficher des zéros plutôt qu'un spinner infini
        this.data.set({
          totalUtilisateurs: 0, totalClients: 0, totalGarages: 0,
          totalExperts: 0, totalRemorqueurs: 0, totalSinistres: 0
        });
      }
    });
  }
}
