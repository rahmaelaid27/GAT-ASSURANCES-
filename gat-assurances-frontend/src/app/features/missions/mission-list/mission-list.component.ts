import { Component } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { Mission } from '@core/models/mission.model';

@Component({
  selector: 'app-mission-list',
  standalone: true,
  imports: [ RouterLink, NgForOf, NgIf],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Missions</h1>
          <p class="text-gray-500">Gestion des missions</p>
        </div>
        <a routerLink="/missions/new" class="btn-primary">+ Nouvelle mission</a>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr><th>Type</th><th>Sinistre</th><th>Statut</th><th>Affecté à</th><th>Actions</th></tr>
          </thead>
          <tbody>
            <ng-container *ngFor="let m of missions">
              <tr>
                <td class="font-medium">{{ m.typeMission }}</td>
                <td>{{ m.sinistreReference }}</td>
                <td><span class="badge" [class]="getStatusClass(m.statut)">{{ m.statut }}</span></td>
                <td>{{ m.garageNom || m.expertNom || '-' }}</td>
                <td><a [routerLink]="['/missions', m.id]" class="text-primary-600">Détails</a></td>
              </tr>
            </ng-container>
            <ng-container *ngIf="!missions?.length">
              <tr><td colspan="5" class="text-center py-8 text-gray-400">Aucune mission</td></tr>
            </ng-container>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class MissionListComponent {
  missions: Mission[] = [];
  constructor(private api: ApiService) {
    this.api.get<Mission[]>('missions').subscribe({
      next: (data) => this.missions = data,
      error: () => this.missions = []
    });
  }

  getStatusClass(statut: string): string {
    const map: Record<string, string> = {
      'EN_ATTENTE': 'badge-warning', 'EN_COURS': 'badge-info',
      'TERMINEE': 'badge-success', 'ANNULEE': 'badge-danger'
    };
    return map[statut] || 'badge-info';
  }
}