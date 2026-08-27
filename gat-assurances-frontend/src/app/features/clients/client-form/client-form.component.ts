import { Component, OnInit } from '@angular/core';
import { NgIf, NgForOf } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '@core/services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [ ReactiveFormsModule, RouterLink, NgIf, NgForOf],
  template: `
    <div class="max-w-2xl mx-auto space-y-6">
      <div class="flex items-center gap-3">
        <a routerLink="/clients" class="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
        </a>
        <div>
          <h1 class="text-2xl font-bold text-gray-800">{{ isEdit ? 'Modifier' : 'Nouveau' }} client</h1>
          <p class="text-gray-500">{{ isEdit ? 'Modifier les informations du client' : 'Créer un nouveau client' }}</p>
        </div>
      </div>

      <div class="card">
        <form [formGroup]="clientForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Nom</label>
              <input type="text" formControlName="nom" class="form-input">
            </div>
            <div>
              <label class="form-label">Prénom</label>
              <input type="text" formControlName="prenom" class="form-input">
            </div>
          </div>
          <div>
            <label class="form-label">Email</label>
            <input type="email" formControlName="email" class="form-input">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Téléphone</label>
              <input type="tel" formControlName="telephone" class="form-input">
            </div>
            <div>
              <label class="form-label">N° Police</label>
              <input type="text" formControlName="numeroPolice" class="form-input">
            </div>
          </div>
          <div>
            <label class="form-label">Adresse</label>
            <input type="text" formControlName="adresse" class="form-input">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Ville</label>
              <input type="text" formControlName="ville" class="form-input">
            </div>
            <div>
              <label class="form-label">Code postal</label>
              <input type="text" formControlName="codePostal" class="form-input">
            </div>
          </div>
          <ng-container *ngIf="!isEdit">
            <div>
              <label class="form-label">Mot de passe</label>
              <input type="password" formControlName="password" class="form-input">
            </div>
          </ng-container>
          <div class="flex justify-end gap-3 pt-4">
            <a routerLink="/clients" class="btn-outline">Annuler</a>
            <button type="submit" class="btn-primary" [disabled]="clientForm.invalid">
              {{ isEdit ? 'Enregistrer' : 'Créer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ClientFormComponent implements OnInit {
  clientForm: FormGroup;
  isEdit = false;
  clientId?: number;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.clientForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      adresse: ['', Validators.required],
      ville: ['', Validators.required],
      codePostal: [''],
      numeroPolice: ['', Validators.required],
      dateNaissance: [''],
      password: ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.clientId = +id;
      this.loadClient(this.clientId);
    }
  }

  private loadClient(id: number): void {
    this.api.getById<any>('clients', id).subscribe(data => {
      this.clientForm.patchValue({
        nom: data.user.nom,
        prenom: data.user.prenom,
        email: data.user.email,
        telephone: data.user.telephone,
        adresse: data.adresse,
        ville: data.ville,
        codePostal: data.codePostal,
        numeroPolice: data.numeroPolice
      });
    });
  }

  onSubmit(): void {
    if (this.clientForm.invalid) return;

    const request = this.isEdit
      ? this.api.put('clients', this.clientId!, this.clientForm.value)
      : this.api.post('clients', this.clientForm.value);

    request.subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: `Client ${this.isEdit ? 'modifié' : 'créé'} avec succès`,
          confirmButtonColor: '#1a3a5c'
        }).then(() => this.router.navigate(['/clients']));
      }
    });
  }
}
