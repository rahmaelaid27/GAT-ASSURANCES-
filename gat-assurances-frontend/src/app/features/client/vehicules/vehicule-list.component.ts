import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehiculeService, Vehicule } from '../../../core/services/vehicule.service';

@Component({
  selector: 'app-vehicule-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 space-y-4">
      <h1 class="text-xl font-bold text-gray-900">Mes véhicules</h1>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (v of vehicules(); track v.id) {
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div class="flex items-center gap-3 mb-3">
              <span class="text-2xl">🚗</span>
              <div>
                <p class="font-semibold text-gray-900">{{ v.immatriculation }}</p>
                <p class="text-sm text-gray-500">{{ v.marque }} {{ v.modele }} {{ v.annee }}</p>
              </div>
            </div>
            <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {{ v.typeVehicule }}
            </span>
          </div>
        }
        @if (vehicules().length === 0) {
          <div class="col-span-3 bg-white rounded-xl border border-gray-100 p-10 text-center">
            <p class="text-gray-400 text-sm">Aucun véhicule enregistré.</p>
          </div>
        }
      </div>
    </div>
  `
})
export class VehiculeListComponent implements OnInit {
  vehicules = signal<Vehicule[]>([]);
  constructor(private vehiculeService: VehiculeService) {}
  ngOnInit(): void { this.vehiculeService.mesVehicules().subscribe(v => this.vehicules.set(v)); }
}
