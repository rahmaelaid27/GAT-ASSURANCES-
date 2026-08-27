import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SinistreService } from '../../../core/services/sinistre.service';
import { GarageRecommandation } from '../../../core/models/garage.model';

@Component({
  selector: 'app-garage-selection',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 class="text-xl font-bold text-gray-900">Choisir un garage</h1>
        <p class="text-gray-500 text-sm mt-1">Garages recommandés par le système selon votre localisation</p>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-10">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      } @else {
        <div class="space-y-4">
          @for (g of garages(); track g.id; let i = $index) {
            <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5
                        hover:shadow-md transition cursor-pointer"
                 (click)="choisir(g)">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <h3 class="font-semibold text-gray-900">{{ g.nom }}</h3>
                    @if (g.conventionGat) {
                      <span class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        ✓ Partenaire GAT
                      </span>
                    }
                    @if (i === 0) {
                      <span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        ⭐ Recommandé
                      </span>
                    }
                  </div>
                  <p class="text-sm text-gray-500 mt-1">{{ g.adresse }}</p>
                  <div class="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span>📍 {{ g.distanceKm }} km</span>
                    <span>⭐ {{ g.note | number:'1.1-1' }}/5</span>
                    @if (g.delaiMoyenJours) {
                      <span>⏱ ~{{ g.delaiMoyenJours | number:'1.0-0' }} jours</span>
                    }
                    <span class="text-blue-600 font-medium">{{ g.slotsDisponibles }} slots dispo</span>
                  </div>
                  @if (g.specialites) {
                    <p class="text-xs text-gray-400 mt-1">Spécialités: {{ g.specialites }}</p>
                  }
                </div>
                <div class="text-right ml-4">
                  <div class="text-2xl font-bold text-blue-700">{{ g.score | number:'1.0-0' }}</div>
                  <div class="text-xs text-gray-400">/ 100</div>
                </div>
              </div>
              <div class="mt-4 flex justify-end">
                <button (click)="choisir(g); $event.stopPropagation()"
                        [disabled]="selecting()"
                        class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white
                               px-4 py-2 rounded-lg text-sm font-medium transition">
                  Choisir ce garage
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class GarageSelectionComponent implements OnInit {
  sinistreId = signal(0);
  garages    = signal<GarageRecommandation[]>([]);
  loading    = signal(true);
  selecting  = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sinistreService: SinistreService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.sinistreId.set(id);
    this.sinistreService.garagesRecommandes(id).subscribe({
      next: g => { this.garages.set(g); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  choisir(g: GarageRecommandation): void {
    if (this.selecting()) return;
    this.selecting.set(true);
    this.sinistreService.affecterGarage(this.sinistreId(), g.id).subscribe({
      next: (s) => {
        this.selecting.set(false);
        this.router.navigate(['/client/sinistres', s.id]);
      },
      error: () => this.selecting.set(false)
    });
  }
}
