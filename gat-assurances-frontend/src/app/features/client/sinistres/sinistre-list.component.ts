import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SinistreService } from '../../../core/services/sinistre.service';
import { Sinistre, STATUT_LABELS, STATUT_COLORS } from '../../../core/models/sinistre.model';

@Component({
  selector: 'app-sinistre-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6 space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold text-gray-900">Mes sinistres</h1>
        <a routerLink="/client/sinistres/nouveau"
           class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
          + Nouveau sinistre
        </a>
      </div>
      @for (s of sinistres(); track s.id) {
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5
                    flex items-center justify-between hover:shadow transition">
          <div class="space-y-1">
            <p class="font-semibold text-gray-900">{{ s.reference }}</p>
            <p class="text-sm text-gray-500">{{ s.vehiculeImmatriculation }} — {{ s.typeSinistre }}</p>
            <p class="text-xs text-gray-400">{{ s.dateSinistre | date:'dd/MM/yyyy' }}</p>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs px-2 py-1 rounded-full {{ statusColor(s.statut) }}">
              {{ statusLabel(s.statut) }}
            </span>
            <a [routerLink]="['/client/sinistres', s.id]"
               class="text-blue-600 hover:underline text-sm">Détails</a>
            <a [routerLink]="['/client/sinistres', s.id, 'forum']"
               class="text-indigo-600 hover:underline text-sm">Forum</a>
          </div>
        </div>
      }
      @if (sinistres().length === 0) {
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center">
          <p class="text-gray-400">Aucun sinistre déclaré.</p>
          <a routerLink="/client/sinistres/nouveau"
             class="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
            Déclarer mon premier sinistre
          </a>
        </div>
      }
    </div>
  `
})
export class SinistreListComponent implements OnInit {
  sinistres = signal<Sinistre[]>([]);
  constructor(private sinistreService: SinistreService) {}
  ngOnInit(): void { this.sinistreService.mesSinistres().subscribe(s => this.sinistres.set(s)); }
  statusLabel(s: string): string { return (STATUT_LABELS as any)[s] ?? s; }
  statusColor(s: string): string { return (STATUT_COLORS as any)[s] ?? ''; }
}
