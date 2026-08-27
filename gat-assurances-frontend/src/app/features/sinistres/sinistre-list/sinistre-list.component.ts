import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { ApiService } from '@core/services/api.service';
import { Sinistre, StatutSinistre } from '@core/models/sinistre.model';

@Component({
  selector: 'app-sinistre-list',
  standalone: true,
  imports: [ RouterLink, DatePipe, NgForOf, NgIf],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Sinistres</h1>
          <p class="text-gray-500">Gestion des déclarations de sinistres</p>
        </div>
        <a routerLink="/sinistres/new" class="btn-primary flex items-center gap-2">+ Nouveau sinistre</a>
      </div>

      <div class="card">
        <div class="flex gap-4 mb-4">
          <input type="text" class="form-input flex-1" placeholder="Rechercher par immatriculation ou référence..." #search>
          <button class="btn-secondary" (click)="searchSinistres(search.value)">Rechercher</button>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Immatriculation</th>
                <th>Client</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <ng-container *ngFor="let s of sinistres">
                <tr>
                  <td class="font-medium text-primary-600">{{ s.reference }}</td>
                  <td class="font-medium">{{ s.vehiculeImmatriculation || s.immatriculation }}</td>
                  <td>{{ s.clientNom }}</td>
                  <td>{{ s.dateDeclaration | date:'dd/MM/yyyy' }}</td>
                  <td><span class="badge" [class]="getStatusClass(s.statut)">{{ s.statut }}</span></td>
                  <td>
                    <a [routerLink]="['/sinistres', s.id]" class="text-primary-600 hover:text-primary-700">Détails</a>
                  </td>
                </tr>
              </ng-container>
              <ng-container *ngIf="!sinistres?.length">
                <tr><td colspan="6" class="text-center py-8 text-gray-400">Aucun sinistre pour cette recherche</td></tr>
              </ng-container>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class SinistreListComponent {
  sinistres: Sinistre[] = [];

  constructor(private api: ApiService) {
    this.loadSinistres();
  }

  private loadSinistres(): void {
    this.api.get<Sinistre[]>('sinistres').subscribe({
      next: (data) => this.sinistres = data,
      error: () => this.sinistres = []
    });
  }

  searchSinistres(term: string): void {
    if (!term) { this.loadSinistres(); return; }
    this.api.get<Sinistre[]>('sinistres', { search: term })
      .subscribe(data => this.sinistres = data);
  }

  getStatusClass(statut: string): string {
    const map: Record<string, string> = {
      'DECLARE': 'badge-info', 'EN_COURS': 'badge-warning',
      'EN_EXPERTISE': 'bg-purple-100 text-purple-800', 'ACCEPTE': 'badge-success',
      'REFUSE': 'badge-danger', 'REMBOURSE': 'bg-blue-100 text-blue-800',
      'CLOTURE': 'bg-gray-100 text-gray-800'
    };
    return map[statut] || 'badge-info';
  }
}
