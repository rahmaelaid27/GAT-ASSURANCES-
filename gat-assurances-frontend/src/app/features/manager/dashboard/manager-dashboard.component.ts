import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../core/services/dashboard.service';
import { DashboardManager } from '../../../core/models/dashboard.model';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Dashboard Manager</h1>
        <p class="text-gray-500 text-sm mt-1">KPI globaux — lecture seule</p>
      </div>

      @if (data()) {
        <!-- KPI Row 1 -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p class="text-sm text-gray-500">Total sinistres</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">{{ data()!.totalSinistres }}</p>
          </div>
          <div class="bg-white rounded-xl border border-blue-100 shadow-sm p-5">
            <p class="text-sm text-blue-600">En cours</p>
            <p class="text-3xl font-bold text-blue-700 mt-1">{{ data()!.sinistresEnCours }}</p>
          </div>
          <div class="bg-white rounded-xl border border-green-100 shadow-sm p-5">
            <p class="text-sm text-green-600">Clôturés</p>
            <p class="text-3xl font-bold text-green-700 mt-1">{{ data()!.sinistresClotures }}</p>
          </div>
          <div class="bg-white rounded-xl border border-red-100 shadow-sm p-5">
            <p class="text-sm text-red-500">Refusés</p>
            <p class="text-3xl font-bold text-red-600 mt-1">{{ data()!.sinistresRefuses }}</p>
          </div>
        </div>
        <!-- KPI Row 2 -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white rounded-xl border border-emerald-100 shadow-sm p-5">
            <p class="text-sm text-emerald-600">Taux résolution</p>
            <p class="text-3xl font-bold text-emerald-700 mt-1">{{ data()!.tauxResolutionGlobal }}%</p>
          </div>
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p class="text-sm text-gray-500">Garages</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">{{ data()!.totalGarages }}</p>
          </div>
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p class="text-sm text-gray-500">Experts</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">{{ data()!.totalExperts }}</p>
          </div>
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p class="text-sm text-gray-500">Clients</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">{{ data()!.totalClients }}</p>
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
export class ManagerDashboardComponent implements OnInit {
  data = signal<DashboardManager | null>(null);
  constructor(private dashboardService: DashboardService) {}
  ngOnInit(): void { this.dashboardService.getManager().subscribe(d => this.data.set(d)); }
}
