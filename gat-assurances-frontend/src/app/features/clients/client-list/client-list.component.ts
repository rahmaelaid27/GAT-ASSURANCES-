import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { ApiService } from '@core/services/api.service';
import { Client } from '@core/models/client.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [ RouterLink, DatePipe, NgForOf, NgIf],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Clients</h1>
          <p class="text-gray-500">Gestion des clients assurés</p>
        </div>
        <a routerLink="/clients/new" class="btn-primary flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Nouveau client
        </a>
      </div>

      <div class="card">
        <div class="flex gap-4 mb-4">
          <input type="text" placeholder="Rechercher un client..." class="form-input flex-1" #searchInput>
          <button class="btn-secondary" (click)="search(searchInput.value)">Rechercher</button>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Nom & Prénom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>N° Police</th>
                <th>Date création</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <ng-container *ngFor="let client of clients">
                <tr>
                  <td>
                    <div class="flex items-center gap-2">
                      <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-xs font-medium">
                        {{ client.user.nom.charAt(0) }}{{ client.user.prenom.charAt(0) }}
                      </div>
                      <span class="font-medium">{{ client.user.nom }} {{ client.user.prenom }}</span>
                    </div>
                  </td>
                  <td>{{ client.user.email }}</td>
                  <td>{{ client.user.telephone }}</td>
                  <td>{{ client.numeroPolice }}</td>
                  <td>{{ client.createdAt | date:'dd/MM/yyyy' }}</td>
                  <td>
                    <div class="flex gap-2">
                      <a [routerLink]="['/clients', client.id]" class="text-primary-600 hover:text-primary-700">Détails</a>
                      <a [routerLink]="['/clients', client.id, 'edit']" class="text-orange-600 hover:text-orange-700">Modifier</a>
                    </div>
                  </td>
                </tr>
              </ng-container>
              <ng-container *ngIf="!clients?.length">
                <tr>
                  <td colspan="6" class="text-center py-8 text-gray-400">Aucun client trouvé</td>
                </tr>
              </ng-container>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class ClientListComponent {
  clients: Client[] = [];

  constructor(private api: ApiService) {
    this.loadClients();
  }

  private loadClients(): void {
    this.api.get<Client[]>('clients').subscribe({
      next: (data) => this.clients = data,
      error: () => this.clients = []
    });
  }

  search(term: string): void {
    if (!term) {
      this.loadClients();
      return;
    }
    this.api.get<Client[]>('clients', { search: term }).subscribe({
      next: (data) => this.clients = data
    });
  }
}
