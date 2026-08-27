import { Component } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { Garage } from '@core/models/garage.model';

@Component({
  selector: 'app-garage-list',
  standalone: true,
  imports: [ RouterLink, NgForOf, NgIf],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Garages</h1>
          <p class="text-gray-500">Gestion des garages partenaires</p>
        </div>
        <a routerLink="/garages/new" class="btn-primary">+ Nouveau garage</a>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr><th>Nom</th><th>Ville</th><th>Téléphone</th><th>Capacité</th><th>Note</th><th>Statut</th></tr>
          </thead>
          <tbody>
            <ng-container *ngFor="let g of garages">
              <tr>
                <td class="font-medium">{{ g.nom }}</td>
                <td>{{ g.ville }}</td>
                <td>{{ g.telephone }}</td>
                <td>{{ g.capaciteActuelle }}/{{ g.capaciteMax }}</td>
                <td>{{ g.note }}/5</td>
                <td><span class="badge" [class]="g.statut === 'ACTIF' ? 'badge-success' : 'badge-danger'">{{ g.statut }}</span></td>
              </tr>
            </ng-container>
            <ng-container *ngIf="!garages?.length">
              <tr><td colspan="6" class="text-center py-8 text-gray-400">Aucun garage</td></tr>
            </ng-container>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class GarageListComponent {
  garages: Garage[] = [];
  constructor(private api: ApiService) {
    this.api.get<Garage[]>('garages').subscribe({
      next: (data) => this.garages = data,
      error: () => this.garages = []
    });
  }
}