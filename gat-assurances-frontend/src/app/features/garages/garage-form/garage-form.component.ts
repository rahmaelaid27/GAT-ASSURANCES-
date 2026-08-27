import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '@core/services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-garage-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="max-w-xl mx-auto space-y-6">
      <div class="flex items-center gap-3">
        <a routerLink="/garages" class="p-2 rounded-lg hover:bg-gray-100 text-gray-600">←</a>
        <h1 class="text-2xl font-bold text-gray-800">Nouveau garage</h1>
      </div>
      <div class="card">
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="form-label">Nom</label>
            <input type="text" formControlName="nom" class="form-input">
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
              <label class="form-label">Téléphone</label>
              <input type="tel" formControlName="telephone" class="form-input">
            </div>
          </div>
          <div>
            <label class="form-label">Email</label>
            <input type="email" formControlName="email" class="form-input">
          </div>
          <div>
            <label class="form-label">Capacité maximale</label>
            <input type="number" formControlName="capaciteMax" class="form-input">
          </div>
          <div>
            <label class="form-label">Spécialités</label>
            <input type="text" formControlName="specialites" class="form-input" placeholder="Ex: Carrosserie, Mécanique">
          </div>
          <div class="flex justify-end gap-3">
            <a routerLink="/garages" class="btn-outline">Annuler</a>
            <button type="submit" class="btn-primary">Créer</button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class GarageFormComponent {
  form: FormGroup;
  constructor(
    private fb: FormBuilder, private api: ApiService, private router: Router
  ) {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      adresse: ['', Validators.required],
      ville: ['', Validators.required],
      codePostal: [''],
      telephone: ['', Validators.required],
      email: ['', Validators.email],
      capaciteMax: [10, Validators.required],
      specialites: ['']
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.api.post('garages', this.form.value).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Garage créé', confirmButtonColor: '#1a3a5c' })
          .then(() => this.router.navigate(['/garages']));
      }
    });
  }
}

