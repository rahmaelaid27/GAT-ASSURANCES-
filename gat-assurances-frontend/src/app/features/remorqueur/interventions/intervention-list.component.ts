import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DemandeRemorquage } from '../../../core/models/remorqueur.model';
import { interval, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-intervention-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 space-y-4">
      <h1 class="text-xl font-bold text-gray-900">Mes interventions</h1>

      <!-- Demandes disponibles -->
      <div class="bg-white rounded-xl border border-amber-200 shadow-sm p-5">
        <h2 class="font-semibold text-amber-700 mb-3">🔔 Demandes disponibles</h2>
        @if (pending().length === 0) {
          <p class="text-gray-400 text-sm">Aucune demande disponible pour le moment.</p>
        } @else {
          <div class="space-y-3">
            @for (d of pending(); track d.id) {
              <div class="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <div>
                  <p class="font-medium text-gray-900">{{ d.sinistreReference }}</p>
                  <p class="text-sm text-gray-600">De : {{ d.localisationDepart }}</p>
                  <p class="text-sm text-gray-600">Vers : {{ d.localisationDestination }}</p>
                </div>
                <button (click)="accepter(d.id)"
                        class="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition">
                  Accepter
                </button>
              </div>
            }
          </div>
        }
      </div>

      <!-- Missions actives -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 class="font-semibold text-gray-800 mb-3">Mes missions actives</h2>
        @if (missions().length === 0) {
          <p class="text-gray-400 text-sm">Aucune mission active.</p>
        } @else {
          <div class="space-y-3">
            @for (m of missions(); track m.id) {
              <div class="p-4 bg-gray-50 rounded-lg space-y-4">
                <div class="flex items-center justify-between gap-3">
                  <div>
                  <p class="font-medium text-gray-900">{{ m.sinistreReference }}</p>
                  <p class="text-xs text-gray-500 mt-1">{{ statutLabel(m.statut) }}</p>
                  </div>
                  <span class="px-3 py-1 rounded-full text-xs font-semibold" [class]="statutClass(m.statut)">
                    {{ statutLabel(m.statut) }}
                  </span>
                </div>
                <div class="flex items-center gap-1">
                  @for (etape of etapes; track etape.value; let i = $index) {
                    <div class="h-2 flex-1 rounded-full" [class]="isEtapeAtteinte(m.statut, etape.value) ? 'bg-green-500' : 'bg-gray-200'"></div>
                  }
                </div>
                <div class="flex flex-wrap gap-2">
                  @if (nextStatus(m.statut); as next) {
                    <button (click)="avancer(m.id, next)"
                          class="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-blue-700 transition">
                      {{ actionLabel(next) }}
                    </button>
                  }
                  @if (m.statut === 'EN_ATTENTE') {
                    <button (click)="accepter(m.id)"
                            class="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-green-700 transition">
                      Accepter la demande
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class InterventionListComponent implements OnInit {
  pending  = signal<DemandeRemorquage[]>([]);
  missions = signal<DemandeRemorquage[]>([]);
  etapes = [
    { value: 'ACCEPTE', label: 'Acceptée' },
    { value: 'EN_ROUTE', label: 'En route' },
    { value: 'ARRIVE_SUR_PLACE', label: 'Sur place' },
    { value: 'VEHICULE_CHARGE', label: 'Chargé' },
    { value: 'EN_TRANSIT', label: 'En transit' },
    { value: 'LIVRE', label: 'Livrée' }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    interval(30000).pipe(
      startWith(0),
      switchMap(() => this.http.get<DemandeRemorquage[]>('http://localhost:8081/api/remorquages/en-attente'))
    ).subscribe({ next: (r) => this.pending.set(Array.isArray(r) ? r : []), error: () => this.pending.set([]) });

    interval(30000).pipe(
      startWith(0),
      switchMap(() => this.http.get<DemandeRemorquage[]>('http://localhost:8081/api/remorquages/mes-missions'))
    ).subscribe({ next: (r) => this.missions.set(Array.isArray(r) ? r : []), error: () => this.missions.set([]) });
  }

  accepter(id: number): void {
    this.http.put<DemandeRemorquage>(`http://localhost:8081/api/remorquages/${id}/accepter`, {}).subscribe({
      next: () => this.ngOnInit(),
      error: () => this.ngOnInit()
    });
  }

  avancer(id: number, statut: string): void {
    this.http.put<DemandeRemorquage>(
      `http://localhost:8081/api/remorquages/${id}/avancer`,
      null, { params: { statut } }
    ).subscribe({
      next: () => this.ngOnInit(),
      error: () => this.ngOnInit()
    });
  }

  statutLabel(statut: string): string {
    return this.etapes.find(e => e.value === statut)?.label ?? (statut === 'ANNULE' ? 'Annulée' : 'En attente');
  }

  statutClass(statut: string): string {
    if (statut === 'LIVRE') return 'bg-green-100 text-green-700';
    if (statut === 'ANNULE') return 'bg-red-100 text-red-700';
    if (statut === 'EN_ATTENTE') return 'bg-amber-100 text-amber-700';
    return 'bg-blue-100 text-blue-700';
  }

  isEtapeAtteinte(statut: string, etape: string): boolean {
    const current = this.etapes.findIndex(e => e.value === statut);
    const target = this.etapes.findIndex(e => e.value === etape);
    return current >= target && current >= 0;
  }

  nextStatus(statut: string): string | null {
    const index = this.etapes.findIndex(e => e.value === statut);
    if (index < 0 || index >= this.etapes.length - 1) return null;
    return this.etapes[index + 1].value;
  }

  actionLabel(statut: string): string {
    return `Marquer : ${this.statutLabel(statut)}`;
  }
}
