import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SinistreService } from '../../../core/services/sinistre.service';
import { Sinistre, STATUT_LABELS, STATUT_COLORS } from '../../../core/models/sinistre.model';

@Component({
  selector: 'app-sinistre-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6 max-w-3xl mx-auto space-y-6">
      <div class="flex items-center gap-3">
        <a routerLink="/client/sinistres" class="text-gray-400 hover:text-gray-600">← Mes sinistres</a>
        @if (sinistre()) {
          <h1 class="text-xl font-bold text-gray-900">{{ sinistre()!.reference }}</h1>
          <span class="text-xs px-2 py-1 rounded-full {{ statusColor(sinistre()!.statut) }}">
            {{ statusLabel(sinistre()!.statut) }}
          </span>
        }
      </div>

      @if (sinistre()) {
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5 grid grid-cols-2 gap-4">
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wide">Type</p>
            <p class="text-sm font-medium text-gray-900 mt-1">{{ sinistre()!.typeSinistre }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wide">Date</p>
            <p class="text-sm font-medium text-gray-900 mt-1">{{ sinistre()!.dateSinistre | date:'dd/MM/yyyy' }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wide">Véhicule</p>
            <p class="text-sm font-medium text-gray-900 mt-1">{{ sinistre()!.vehiculeImmatriculation }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wide">Gouvernorat</p>
            <p class="text-sm font-medium text-gray-900 mt-1">{{ sinistre()!.gouvernorat }}</p>
          </div>
          @if (sinistre()!.garageNom) {
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-wide">Garage</p>
              <p class="text-sm font-medium text-gray-900 mt-1">{{ sinistre()!.garageNom }}</p>
            </div>
          }
          @if (sinistre()!.expertNom) {
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-wide">Expert</p>
              <p class="text-sm font-medium text-gray-900 mt-1">{{ sinistre()!.expertNom }}</p>
            </div>
          }
          <div class="col-span-2">
            <p class="text-xs text-gray-400 uppercase tracking-wide">Description</p>
            <p class="text-sm text-gray-700 mt-1">{{ sinistre()!.description }}</p>
          </div>
          @if (sinistre()!.motifRejet) {
            <div class="col-span-2 bg-red-50 rounded-lg p-3">
              <p class="text-xs text-red-500 font-medium">Motif :</p>
              <p class="text-sm text-red-700 mt-1">{{ sinistre()!.motifRejet }}</p>
            </div>
          }
        </div>

        <div class="flex gap-3">
          @if (!sinistre()!.garageId) {
            <a [routerLink]="['/client/sinistres', sinistre()!.id, 'garages']"
               class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
              Choisir un garage
            </a>
          }
          <a [routerLink]="['/client/sinistres', sinistre()!.id, 'forum']"
             class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition">
            💬 Forum
          </a>
        </div>
      } @else {
        <div class="flex justify-center py-20">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      }
    </div>
  `
})
export class SinistreDetailComponent implements OnInit {
  sinistre = signal<Sinistre | null>(null);
  constructor(private route: ActivatedRoute, private sinistreService: SinistreService) {}
  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.sinistreService.findById(id).subscribe(s => this.sinistre.set(s));
  }
  statusLabel(s: string): string { return (STATUT_LABELS as any)[s] ?? s; }
  statusColor(s: string): string { return (STATUT_COLORS as any)[s] ?? ''; }
}
