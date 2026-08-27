import { Component } from '@angular/core';
import { NgIf, NgForOf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { Expert } from '@core/models/expert.model';

@Component({
  selector: 'app-expert-list',
  standalone: true,
  imports: [RouterLink, NgIf, NgForOf],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Experts</h1>
          <p class="text-gray-500">Gestion des experts automobiles</p>
        </div>
        <a routerLink="/experts/new" class="btn-primary">+ Nouvel expert</a>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr><th>Nom & Prénom</th><th>Spécialité</th><th>Zone</th><th>Disponible</th><th>Missions</th><th>Note</th></tr>
          </thead>
          <tbody>
            <ng-container *ngFor="let e of experts">
              <tr>
                <td class="font-medium">{{ e.nom }} {{ e.prenom }}</td>
                <td>{{ e.specialite }}</td>
                <td>{{ e.zoneIntervention }}</td>
                <td>
                  <ng-container *ngIf="e.disponibilite">
                    <span class="text-green-600">● Disponible</span>
                  </ng-container><ng-container *ngIf="!(e.disponibilite)">
                    <span class="text-red-500">● Occupé</span>
                  </ng-container>
                </td>
                <td>{{ e.missionsActives }}/3</td>
                <td>{{ e.note }}/5</td>
              </tr>
            </ng-container>
            <ng-container *ngIf="!experts?.length">
              <tr><td colspan="6" class="text-center py-8 text-gray-400">Aucun expert</td></tr>
            </ng-container>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ExpertListComponent {
  experts: Expert[] = [];
  constructor(private api: ApiService) {
    this.api.get<Expert[]>('experts').subscribe({
      next: (data) => this.experts = data,
      error: () => this.experts = []
    });
  }
}