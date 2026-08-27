import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '@core/services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-remorqueur-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="max-w-xl mx-auto space-y-6">
      <div class="flex items-center gap-3">
        <a routerLink="/remorqueurs" class="p-2 rounded-lg hover:bg-gray-100 text-gray-600">←</a>
        <h1 class="text-2xl font-bold text-gray-800">Nouveau remorqueur</h1>
      </div>
      <div class="card">
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div><label class="form-label">Nom</label><input type="text" formControlName="nom" class="form-input"></div>
            <div><label class="form-label">Prénom</label><input type="text" formControlName="prenom" class="form-input"></div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div><label class="form-label">Email</label><input type="email" formControlName="email" class="form-input"></div>
            <div><label class="form-label">Téléphone</label><input type="tel" formControlName="telephone" class="form-input"></div>
          </div>
          <div><label class="form-label">Localisation</label><input type="text" formControlName="localisation" class="form-input" placeholder="Zone d'intervention"></div>
          <div><label class="form-label">Capacité (véhicules)</label><input type="number" formControlName="capacite" class="form-input"></div>
          <div class="flex justify-end gap-3">
            <a routerLink="/remorqueurs" class="btn-outline">Annuler</a>
            <button type="submit" class="btn-primary">Créer</button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class RemorqueurFormComponent {
  form: FormGroup;
  constructor(
    private fb: FormBuilder, private api: ApiService, private router: Router
  ) {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      localisation: ['', Validators.required],
      capacite: [1, Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.api.post('remorqueurs', this.form.value).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Remorqueur créé', confirmButtonColor: '#1a3a5c' })
          .then(() => this.router.navigate(['/remorqueurs']));
      }
    });
  }
}

