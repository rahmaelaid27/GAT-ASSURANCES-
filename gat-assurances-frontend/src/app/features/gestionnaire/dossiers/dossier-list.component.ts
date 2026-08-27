import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { SinistreService } from '../../../core/services/sinistre.service';
import { Sinistre, STATUT_LABELS, STATUT_COLORS } from '../../../core/models/sinistre.model';

@Component({
  selector: 'app-dossier-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6 space-y-4">
      <h1 class="text-xl font-bold text-gray-900">Mes dossiers</h1>
      @if (dossiers().length > 0) {
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr class="text-left text-gray-500">
                <th class="px-4 py-3 font-medium">Référence</th>
                <th class="px-4 py-3 font-medium">Client</th>
                <th class="px-4 py-3 font-medium">Type</th>
                <th class="px-4 py-3 font-medium">Statut</th>
                <th class="px-4 py-3 font-medium">Date</th>
                <th class="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (s of dossiers(); track s.id) {
                <tr class="border-t border-gray-50 hover:bg-gray-50 transition">
                  <td class="px-4 py-3 font-medium text-gray-900">{{ s.reference }}</td>
                  <td class="px-4 py-3 text-gray-600">{{ s.clientNom }}</td>
                  <td class="px-4 py-3 text-gray-600">{{ s.typeSinistre }}</td>
                  <td class="px-4 py-3">
                    <span class="text-xs px-2 py-1 rounded-full {{ statusColor(s.statut) }}">
                      {{ statusLabel(s.statut) }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-gray-500">{{ s.dateSinistre | date:'dd/MM/yyyy' }}</td>
                  <td class="px-4 py-3 flex gap-2">
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
      } @else {
        <div class="flex justify-center py-10">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }
    </div>
  `
})
export class DossierListComponent implements OnInit {
  dossiers = signal<Sinistre[]>([]);
  constructor(private sinistreService: SinistreService) {}
  ngOnInit(): void { this.sinistreService.mesDossiers().subscribe(d => this.dossiers.set(d)); }
  statusLabel(s: string): string { return (STATUT_LABELS as any)[s] ?? s; }
  statusColor(s: string): string { return (STATUT_COLORS as any)[s] ?? ''; }
}
