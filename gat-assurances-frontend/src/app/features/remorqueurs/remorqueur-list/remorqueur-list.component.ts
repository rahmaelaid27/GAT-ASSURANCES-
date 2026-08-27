import { Component } from '@angular/core';
import { NgIf, NgForOf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { Remorqueur } from '@core/models/remorqueur.model';

@Component({
  selector: 'app-remorqueur-list',
  standalone: true,
  imports: [RouterLink, NgIf, NgForOf],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Remorqueurs</h1>
          <p class="text-gray-500">Gestion des remorqueurs partenaires</p>
        </div>
        <a routerLink="/remorqueurs/new" class="btn-primary">+ Nouveau remorqueur</a>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr><th>Nom & Prénom</th><th>Téléphone</th><th>Localisation</th><th>Capacité</th><th>Disponible</th></tr>
          </thead>
          <tbody>
            <ng-container *ngFor="let r of remorqueurs">
              <tr>
                <td class="font-medium">{{ r.nom }} {{ r.prenom }}</td>
                <td>{{ r.telephone }}</td>
                <td>{{ r.localisation }}</td>
                <td>{{ r.capacite }}</td>
                <td>
                  <ng-container *ngIf="r.disponibilite">
                    <span class="text-green-600">● Disponible</span>
                  </ng-container><ng-container *ngIf="!(r.disponibilite)">
                    <span class="text-red-500">● Occupé</span>
                  </ng-container>
                </td>
              </tr>
            </ng-container>
            <ng-container *ngIf="!remorqueurs?.length">
              <tr><td colspan="5" class="text-center py-8 text-gray-400">Aucun remorqueur</td></tr>
            </ng-container>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class RemorqueurListComponent {
  remorqueurs: Remorqueur[] = [];
  constructor(private api: ApiService) {
    this.api.get<Remorqueur[]>('remorqueurs').subscribe({
      next: (data) => this.remorqueurs = data,
      error: () => this.remorqueurs = []
    });
  }
}