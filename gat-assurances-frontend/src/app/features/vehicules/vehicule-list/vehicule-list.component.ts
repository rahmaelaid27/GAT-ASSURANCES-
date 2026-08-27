import { Component } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { Vehicule } from '@core/models/vehicule.model';

@Component({
  selector: 'app-vehicule-list',
  standalone: true,
  imports: [ RouterLink, NgForOf, NgIf],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Véhicules</h1>
          <p class="text-gray-500">Gestion des véhicules assurés</p>
        </div>
        <a routerLink="/vehicules/new" class="btn-primary flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Nouveau véhicule
        </a>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Immatriculation</th>
              <th>Marque</th>
              <th>Modèle</th>
              <th>Année</th>
              <th>Propriétaire</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <ng-container *ngFor="let v of vehicules">
              <tr>
                <td class="font-medium">{{ v.immatriculation }}</td>
                <td>{{ v.marque }}</td>
                <td>{{ v.modele }}</td>
                <td>{{ v.annee }}</td>
                <td>{{ v.clientNom }}</td>
                <td>
                  <a [routerLink]="['/clients', v.clientId]" class="text-primary-600 hover:text-primary-700">Client</a>
                </td>
              </tr>
            </ng-container>
            <ng-container *ngIf="!vehicules?.length">
              <tr><td colspan="6" class="text-center py-8 text-gray-400">Aucun véhicule</td></tr>
            </ng-container>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class VehiculeListComponent {
  vehicules: Vehicule[] = [];
  constructor(private api: ApiService) {
    this.api.get<Vehicule[]>('vehicules').subscribe({
      next: (data) => this.vehicules = data,
      error: () => this.vehicules = []
    });
  }
}