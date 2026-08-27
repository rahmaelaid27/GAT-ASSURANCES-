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
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p class="font-medium text-gray-900">{{ m.sinistreReference }}</p>
                  <p class="text-xs text-gray-500">{{ m.statut }}</p>
                </div>
                <div class="flex gap-2">
                  <button (click)="avancer(m.id, 'EN_ROUTE')"
                          class="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-blue-700 transition">
                    En route
                  </button>
                  <button (click)="avancer(m.id, 'ARRIVE_SUR_PLACE')"
                          class="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-indigo-700 transition">
                    Sur place
                  </button>
                  <button (click)="avancer(m.id, 'LIVRE')"
                          class="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-green-700 transition">
                    Livré
                  </button>
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
}
