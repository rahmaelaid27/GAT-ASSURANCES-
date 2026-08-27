import { Component } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '@core/services/api.service';
import { TypeVehicule } from '@core/models/vehicule.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-vehicule-form',
  standalone: true,
  imports: [ ReactiveFormsModule, RouterLink, NgForOf, NgIf],
  template: `
    <div class="max-w-xl mx-auto space-y-6">
      <div class="flex items-center gap-3">
        <a routerLink="/vehicules" class="p-2 rounded-lg hover:bg-gray-100 text-gray-600">←</a>
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Nouveau véhicule</h1>
        </div>
      </div>
      <div class="card">
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Marque</label>
              <input type="text" formControlName="marque" class="form-input">
            </div>
            <div>
              <label class="form-label">Modèle</label>
              <input type="text" formControlName="modele" class="form-input">
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Année</label>
              <input type="number" formControlName="annee" class="form-input">
            </div>
            <div>
              <label class="form-label">Immatriculation</label>
              <input type="text" formControlName="immatriculation" class="form-input" placeholder="123 TU 456">
            </div>
          </div>
          <div>
            <label class="form-label">Type</label>
            <select formControlName="typeVehicule" class="form-input">
              <ng-container *ngFor="let t of typeVehicules">
                <option [value]="t">{{ t }}</option>
              </ng-container>
            </select>
          </div>
          <div>
            <label class="form-label">ID Client</label>
            <input type="number" formControlName="clientId" class="form-input">
          </div>
          <div class="flex justify-end gap-3">
            <a routerLink="/vehicules" class="btn-outline">Annuler</a>
            <button type="submit" class="btn-primary" [disabled]="form.invalid">Créer</button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class VehiculeFormComponent {
  form: FormGroup;
  typeVehicules = Object.values(TypeVehicule);

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router
  ) {
    this.form = this.fb.group({
      marque: ['', Validators.required],
      modele: ['', Validators.required],
      annee: [new Date().getFullYear(), Validators.required],
      immatriculation: ['', Validators.required],
      couleur: [''],
      typeVehicule: [TypeVehicule.VOITURE, Validators.required],
      clientId: [null, Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.api.post('vehicules', this.form.value).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Véhicule créé', confirmButtonColor: '#1a3a5c' })
          .then(() => this.router.navigate(['/vehicules']));
      }
    });
  }
}
