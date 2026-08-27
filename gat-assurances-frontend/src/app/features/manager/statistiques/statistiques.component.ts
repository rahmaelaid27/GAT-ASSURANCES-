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
        <div class="grid gap-6 xl:grid-cols-2">
          <article class="rounded-2xl border border-[#E8E2F0] bg-white p-5 shadow-sm sm:p-6">
            <div class="flex items-start justify-between">
              <div>
                <h2 class="text-lg font-bold text-[#1A0830]">Répartition des sinistres</h2>
                <p class="mt-1 text-sm text-gray-500">Vue globale par état du dossier</p>
              </div>
              <span class="rounded-full bg-[#F8F7FB] px-3 py-1 text-xs font-semibold text-gray-500">{{ data()!.totalSinistres }} total</span>
            </div>
            <div class="mt-7 flex flex-col items-center gap-7 sm:flex-row sm:justify-center">
              <div class="relative h-44 w-44 shrink-0 rounded-full" [style.background]="donutGradient()">
                <div class="absolute inset-7 flex flex-col items-center justify-center rounded-full bg-white">
                  <span class="text-3xl font-extrabold text-[#1A0830]">{{ data()!.totalSinistres }}</span>
                  <span class="text-xs text-gray-400">sinistres</span>
                </div>
              </div>
              <div class="w-full max-w-xs space-y-3">
                @for (item of statusChart(); track item.label) {
                  <div class="flex items-center justify-between gap-4 text-sm">
                    <span class="flex items-center gap-2 text-gray-600"><i class="h-3 w-3 rounded-full" [style.background-color]="item.color"></i>{{ item.label }}</span>
                    <strong class="text-[#1A0830]">{{ item.value }} <span class="font-normal text-gray-400">({{ item.percent }}%)</span></strong>
                  </div>
                }
              </div>
            </div>
          </article>

          <article class="rounded-2xl border border-[#E8E2F0] bg-white p-5 shadow-sm sm:p-6">
            <div>
              <h2 class="text-lg font-bold text-[#1A0830]">Capacité du réseau</h2>
              <p class="mt-1 text-sm text-gray-500">Partenaires disponibles dans la plateforme</p>
            </div>
            <div class="mt-7 flex h-52 items-end justify-around gap-4 border-b border-l border-[#E8E2F0] px-4 pb-0 pt-5">
              @for (item of networkChart(); track item.label) {
                <div class="flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <span class="text-sm font-bold text-[#1A0830]">{{ item.value }}</span>
                  <div class="flex w-full max-w-16 items-end" [style.height.%]="item.height">
                    <div class="w-full rounded-t-lg transition-all duration-500" [style.height.%]="100" [style.background-color]="item.color"></div>
                  </div>
                  <span class="text-center text-xs text-gray-500">{{ item.label }}</span>
                </div>
              }
            </div>
          </article>
        </div>

        <article class="rounded-2xl border border-[#E8E2F0] bg-white p-5 shadow-sm sm:p-6">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 class="text-lg font-bold text-[#1A0830]">État du portefeuille</h2>
              <p class="mt-1 text-sm text-gray-500">Comparaison des volumes traités et à traiter</p>
            </div>
            <div class="flex items-center gap-4 text-xs text-gray-500"><span class="flex items-center gap-1.5"><i class="h-2.5 w-2.5 rounded-full bg-[#6B2D8B]"></i>En cours</span><span class="flex items-center gap-1.5"><i class="h-2.5 w-2.5 rounded-full bg-[#16A34A]"></i>Clôturés</span><span class="flex items-center gap-1.5"><i class="h-2.5 w-2.5 rounded-full bg-[#E5162A]"></i>Refusés</span></div>
          </div>
          <div class="mt-7 overflow-x-auto">
            <div class="min-w-[560px]">
              <svg viewBox="0 0 760 220" class="h-56 w-full" role="img" aria-label="Graphique de comparaison des sinistres">
                <line x1="50" y1="20" x2="50" y2="185" stroke="#E8E2F0" />
                <line x1="50" y1="185" x2="735" y2="185" stroke="#E8E2F0" />
                @for (line of [20, 75, 130]; track line) { <line x1="50" [attr.y1]="line" x2="735" [attr.y2]="line" stroke="#F3F0F8" /> }
                @for (item of portfolioChart(); track item.label; let i = $index) {
                  <rect [attr.x]="95 + i * 215" [attr.y]="185 - item.enCoursHeight" width="38" [attr.height]="item.enCoursHeight" rx="6" fill="#6B2D8B" />
                  <rect [attr.x]="140 + i * 215" [attr.y]="185 - item.cloturesHeight" width="38" [attr.height]="item.cloturesHeight" rx="6" fill="#16A34A" />
                  <rect [attr.x]="185 + i * 215" [attr.y]="185 - item.refusesHeight" width="38" [attr.height]="item.refusesHeight" rx="6" fill="#E5162A" />
                  <text [attr.x]="160 + i * 215" y="210" text-anchor="middle" fill="#6B7280" font-size="12">{{ item.label }}</text>
                }
              </svg>
            </div>
          </div>
        </article>
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

  statusChart() {
    const d = this.data();
    if (!d) return [];
    const total = Math.max(d.totalSinistres, 1);
    return [
      { label: 'En cours', value: d.sinistresEnCours, percent: Math.round(d.sinistresEnCours / total * 100), color: '#6B2D8B' },
      { label: 'Clôturés', value: d.sinistresClotures, percent: Math.round(d.sinistresClotures / total * 100), color: '#16A34A' },
      { label: 'Refusés', value: d.sinistresRefuses, percent: Math.round(d.sinistresRefuses / total * 100), color: '#E5162A' }
    ];
  }

  donutGradient(): string {
    const items = this.statusChart();
    let start = 0;
    const stops = items.map(item => {
      const end = start + item.percent;
      const stop = `${item.color} ${start}% ${end}%`;
      start = end;
      return stop;
    });
    return `conic-gradient(${stops.join(', ')})`;
  }

  networkChart() {
    const d = this.data();
    if (!d) return [];
    const max = Math.max(d.totalGarages, d.totalExperts, d.totalClients, 1);
    return [
      { label: 'Garages', value: d.totalGarages, height: d.totalGarages / max * 100, color: '#F5A623' },
      { label: 'Experts', value: d.totalExperts, height: d.totalExperts / max * 100, color: '#0EA5E9' },
      { label: 'Clients', value: d.totalClients, height: d.totalClients / max * 100, color: '#6B2D8B' }
    ];
  }

  portfolioChart() {
    const d = this.data();
    if (!d) return [];
    const scale = Math.max(d.totalSinistres, 1);
    return [
      { label: 'Portefeuille', enCoursHeight: d.sinistresEnCours / scale * 150, cloturesHeight: d.sinistresClotures / scale * 150, refusesHeight: d.sinistresRefuses / scale * 150 }
    ];
  }

  ngOnInit(): void {
    interval(30000).pipe(
      startWith(0),
      switchMap(() => this.dashboardService.getManager())
    ).subscribe(d => this.data.set(d));
  }
}
