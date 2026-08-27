import { Component, OnInit } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { Client } from '@core/models/client.model';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [ RouterLink, NgForOf, NgIf],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="flex items-center gap-3">
        <a routerLink="/clients" class="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
        </a>
        <div>
          <h1 class="text-2xl font-bold text-gray-800">{{ client?.user?.nom }} {{ client?.user?.prenom }}</h1>
          <p class="text-gray-500">Fiche client</p>
        </div>
        <div class="ml-auto">
          <a [routerLink]="['/clients', client?.id, 'edit']" class="btn-secondary">Modifier</a>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <div class="card">
            <h3 class="font-semibold text-gray-800 mb-4">Informations personnelles</h3>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div><span class="text-gray-500">Nom:</span> <span class="font-medium">{{ client?.user?.nom }}</span></div>
              <div><span class="text-gray-500">Prénom:</span> <span class="font-medium">{{ client?.user?.prenom }}</span></div>
              <div><span class="text-gray-500">Email:</span> <span class="font-medium">{{ client?.user?.email }}</span></div>
              <div><span class="text-gray-500">Téléphone:</span> <span class="font-medium">{{ client?.user?.telephone }}</span></div>
              <div class="col-span-2"><span class="text-gray-500">Adresse:</span> <span class="font-medium">{{ client?.adresse }}, {{ client?.ville }}</span></div>
              <div><span class="text-gray-500">N° Police:</span> <span class="font-medium text-primary-600">{{ client?.numeroPolice }}</span></div>
            </div>
          </div>

          <div class="card">
            <h3 class="font-semibold text-gray-800 mb-4">Véhicules</h3>
            <ng-container *ngFor="let v of client?.vehicules">
              <div class="flex items-center justify-between p-3 border-b last:border-0">
                <div>
                  <p class="font-medium">{{ v.marque }} {{ v.modele }}</p>
                  <p class="text-sm text-gray-500">{{ v.immatriculation }} - {{ v.annee }}</p>
                </div>
              </div>
            </ng-container>
            <ng-container *ngIf="!client?.vehicules?.length">
              <p class="text-gray-400 text-center py-4">Aucun véhicule</p>
            </ng-container>
          </div>
        </div>

        <div class="space-y-6">
          <div class="card">
            <h3 class="font-semibold text-gray-800 mb-4">Statistiques</h3>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">Sinistres</span>
                <span class="font-medium">{{ client?.sinistres?.length || 0 }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Véhicules</span>
                <span class="font-medium">{{ client?.vehicules?.length || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ClientDetailComponent implements OnInit {
  client?: Client;

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.api.getById<Client>('clients', +id).subscribe(data => this.client = data);
    }
  }
}