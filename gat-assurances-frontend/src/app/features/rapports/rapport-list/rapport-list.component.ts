import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { ApiService } from '@core/services/api.service';
import { Rapport } from '@core/models/rapport.model';

@Component({
  selector: 'app-rapport-list',
  standalone: true,
  imports: [ RouterLink, DatePipe, NgForOf, NgIf],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Rapports</h1>
          <p class="text-gray-500">Rapports d'expertise</p>
        </div>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr><th>Expert</th><th>Mission</th><th>Statut</th><th>Date</th></tr>
          </thead>
          <tbody>
            <ng-container *ngFor="let r of rapports">
              <tr>
                <td class="font-medium">{{ r.expertNom }}</td>
                <td>{{ r.missionDescription }}</td>
                <td><span class="badge" [class]="getStatusClass(r.statut)">{{ r.statut }}</span></td>
                <td>{{ r.dateDepot | date:'dd/MM/yyyy' }}</td>
              </tr>
            </ng-container>
            <ng-container *ngIf="!rapports?.length">
              <tr><td colspan="4" class="text-center py-8 text-gray-400">Aucun rapport</td></tr>
            </ng-container>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class RapportListComponent {
  rapports: Rapport[] = [];
  constructor(private api: ApiService) {
    this.api.get<Rapport[]>('rapports').subscribe({
      next: (data) => this.rapports = data,
      error: () => this.rapports = []
    });
  }

  getStatusClass(statut: string): string {
    const map: Record<string, string> = {
      'DEPOSE': 'badge-info', 'EN_REVISION': 'badge-warning',
      'VALIDE': 'badge-success', 'REJETE': 'badge-danger'
    };
    return map[statut] || 'badge-info';
  }
}
