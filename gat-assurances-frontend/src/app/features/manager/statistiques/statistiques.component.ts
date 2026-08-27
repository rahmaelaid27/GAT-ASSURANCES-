import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnInit, signal } from '@angular/core';
import { DashboardService } from '../../../core/services/dashboard.service';
import { DashboardManager } from '../../../core/models/dashboard.model';
import { interval, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-statistiques',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 space-y-6">
      <div>
        <h1 class="text-xl font-bold text-gray-900">Statistiques globales</h1>
        <p class="text-gray-500 text-sm mt-1">Indicateurs actualisés automatiquement.</p>
      </div>
      @if (data()) {
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          @for (item of kpis(); track item.label) {
            <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p class="text-sm text-gray-500">{{ item.label }}</p>
              <p class="text-3xl font-bold text-gray-900 mt-1">{{ item.value }}</p>
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
export class StatistiquesComponent implements OnInit {
  data = signal<DashboardManager | null>(null);

  constructor(private dashboardService: DashboardService) {}

  kpis() {
    const d = this.data();
    return d ? [
      { label: 'Sinistres total', value: d.totalSinistres },
      { label: 'Sinistres en cours', value: d.sinistresEnCours },
      { label: 'Sinistres clôturés', value: d.sinistresClotures },
      { label: 'Sinistres refusés', value: d.sinistresRefuses },
      { label: 'Taux de résolution', value: `${d.tauxResolutionGlobal}%` },
      { label: 'Garages', value: d.totalGarages },
      { label: 'Experts', value: d.totalExperts },
      { label: 'Clients', value: d.totalClients },
      { label: 'Satisfaction moyenne', value: d.satisfactionMoyenne || 'N/A' }
    ] : [];
  }

  ngOnInit(): void {
    interval(30000).pipe(
      startWith(0),
      switchMap(() => this.dashboardService.getManager())
    ).subscribe(d => this.data.set(d));
  }
}
