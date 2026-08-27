import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface AuditLog {
  id: number; action: string; details: string | null;
  entity: string | null; result: string | null; createdAt: string;
}

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="p-6 space-y-5 animate-fade-in">

  <div>
    <h1 class="text-2xl font-bold text-gray-900">Journal d'audit</h1>
    <p class="text-gray-500 text-sm mt-1">Historique complet de toutes les actions système</p>
  </div>

  <!-- Légende -->
  <div class="flex gap-3 flex-wrap">
    @for (r of ['SUCCES','ECHEC','INFO']; track r) {
      <div class="flex items-center gap-1.5 text-xs text-gray-500">
        <span class="w-2.5 h-2.5 rounded-full" [style.background]="resultColor(r)"></span>
        {{ r }}
      </div>
    }
  </div>

  <!-- Table -->
  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <table class="w-full text-sm">
      <thead>
        <tr class="bg-gray-50 border-b border-gray-100">
          <th class="text-left px-5 py-3.5 font-semibold text-gray-600 w-36">Date</th>
          <th class="text-left px-5 py-3.5 font-semibold text-gray-600">Action</th>
          <th class="text-left px-5 py-3.5 font-semibold text-gray-600 hidden md:table-cell">Détails</th>
          <th class="text-left px-5 py-3.5 font-semibold text-gray-600 w-28">Résultat</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-50">
        @if (loading()) {
          @for (i of [1,2,3,4,5]; track i) {
            <tr>
              <td colspan="4" class="px-5 py-4">
                <div class="h-4 bg-gray-100 rounded animate-pulse w-full"></div>
              </td>
            </tr>
          }
        } @else if (logs().length === 0) {
          <tr>
            <td colspan="4" class="text-center py-14 text-gray-400">
              <div class="flex flex-col items-center gap-3">
                <svg class="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                <p class="font-semibold">Aucune entrée d'audit</p>
                <p class="text-xs">Les actions système seront enregistrées ici</p>
              </div>
            </td>
          </tr>
        } @else {
          @for (log of logs(); track log.id) {
            <tr class="hover:bg-gray-50 transition-colors">
              <td class="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                {{ log.createdAt | date:'dd/MM/yyyy HH:mm' }}
              </td>
              <td class="px-5 py-3.5 font-medium text-gray-900">{{ log.action }}</td>
              <td class="px-5 py-3.5 text-gray-500 hidden md:table-cell max-w-xs truncate">
                {{ log.details }}
              </td>
              <td class="px-5 py-3.5">
                <span class="text-xs px-2.5 py-1 rounded-full font-semibold"
                      [style.background]="resultBg(log.result)"
                      [style.color]="resultColor(log.result)">
                  {{ log.result ?? 'INFO' }}
                </span>
              </td>
            </tr>
          }
        }
      </tbody>
    </table>
  </div>

</div>
  `
})
export class AuditComponent implements OnInit {
  logs    = signal<AuditLog[]>([]);
  loading = signal(true);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<AuditLog[]>('http://localhost:8081/api/admin/audit')
      .subscribe({
        next: l => { this.logs.set(l); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
  }

  resultBg(r: string | null): string {
    return { SUCCES: 'rgba(34,197,94,0.1)', ECHEC: 'rgba(229,22,42,0.1)', INFO: 'rgba(107,45,139,0.1)' }[r ?? 'INFO'] ?? 'rgba(107,45,139,0.1)';
  }
  resultColor(r: string | null): string {
    return { SUCCES: '#16a34a', ECHEC: '#E5162A', INFO: '#6B2D8B' }[r ?? 'INFO'] ?? '#6B2D8B';
  }
}
