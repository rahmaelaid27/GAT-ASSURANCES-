import { Component, OnInit } from '@angular/core';
import { NgIf, NgForOf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '@core/services/api.service';
import { AuthService } from '@core/services/auth.service';
import { AuthResponse } from '@core/models/user.model';
import { TypeVehicule } from '@core/models/vehicule.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sinistre-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf, NgForOf],
  templateUrl: './sinistre-form.component.html'
})
export class SinistreFormComponent implements OnInit {
  form: FormGroup;
  today = new Date().toISOString().split('T')[0];
  submitting = false;
  errorMessage = '';
  currentUser: AuthResponse | null = null;
  showVehicleForm = true;
  typeVehicules = Object.values(TypeVehicule);

  gouvernorats = [
    'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Zaghouan', 'Bizerte',
    'Beja', 'Jendouba', 'Le Kef', 'Siliana', 'Sousse', 'Monastir', 'Mahdia',
    'Kairouan', 'Kasserine', 'Sidi Bouzid', 'Sfax', 'Gabes', 'Medenine',
    'Tataouine', 'Gafsa', 'Tozeur', 'Kebili'
  ];

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      cin: ['', Validators.pattern(/^\d{8}$/)],
      immatriculation: ['', Validators.required],
      dateSinistre: ['', Validators.required],
      gouvernorat: ['', Validators.required],
      localite: [''],
      typeSinistre: ['', Validators.required],
      description: [''],
      vehiculeMarque: [''],
      vehiculeModele: [''],
      vehiculeAnnee: [new Date().getFullYear()],
      vehiculeCouleur: [''],
      vehiculeType: [TypeVehicule.VOITURE]
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if ((this.currentUser as any)?.cin) {
      this.form.patchValue({ cin: (this.currentUser as any).cin });
    }
    if (this.currentUserRole !== 'CLIENT') {
      this.form.get('cin')?.addValidators(Validators.required);
      this.form.get('cin')?.updateValueAndValidity();
    } else {
      this.form.get('vehiculeMarque')?.addValidators(Validators.required);
      this.form.get('vehiculeModele')?.addValidators(Validators.required);
      this.form.get('vehiculeAnnee')?.addValidators(Validators.required);
      this.form.get('vehiculeType')?.addValidators(Validators.required);
      this.form.get('vehiculeMarque')?.updateValueAndValidity();
      this.form.get('vehiculeModele')?.updateValueAndValidity();
      this.form.get('vehiculeAnnee')?.updateValueAndValidity();
      this.form.get('vehiculeType')?.updateValueAndValidity();
    }
  }

  get currentUserRole(): string | undefined {
    return (this.currentUser as any)?.user?.role ?? (this.currentUser as any)?.role;
  }
  onPhotosSelected(_event: any): void {}
  onDocumentsSelected(_event: any): void {}
  removeDocument(_doc: any): void {}
  getLocation(): void {}

  onSubmit(): void {
    this.errorMessage = '';
    if (this.form.invalid) return;

    const value = this.form.getRawValue();
    this.submitting = true;

    const sinistrePayload = {
      ...(value.cin ? { cin: value.cin } : {}),
      immatriculation: value.immatriculation,
      dateSinistre: value.dateSinistre,
      gouvernorat: value.gouvernorat,
      localite: value.localite,
      lieu: value.localite ? `${value.gouvernorat}, ${value.localite}` : value.gouvernorat,
      typeSinistre: value.typeSinistre,
      description: value.description
    };

    if (this.currentUser?.user?.role === 'CLIENT') {
      const vehiculePayload = {
        marque: value.vehiculeMarque,
        modele: value.vehiculeModele,
        annee: value.vehiculeAnnee,
        immatriculation: value.immatriculation,
        couleur: value.vehiculeCouleur || '',
        typeVehicule: value.vehiculeType
      };

      this.api.post('vehicules', vehiculePayload).subscribe({
        next: () => { this.postSinistre(sinistrePayload); },
        error: (err: any) => {
          if (err.status === 400 || err.status === 409) {
            this.postSinistre(sinistrePayload);
          } else {
            this.submitting = false;
            this.errorMessage = err.error?.message || 'Impossible de creer le vehicule. Verifiez les informations.';
          }
        }
      });
    } else {
      this.postSinistre(sinistrePayload);
    }
  }

  private postSinistre(payload: any): void {
    this.api.post('sinistres', payload).subscribe({
      next: () => {
        this.submitting = false;
        Swal.fire({
          icon: 'success',
          title: 'Sinistre declare',
          text: 'Votre sinistre a ete declare avec succes.',
          confirmButtonColor: '#5E2B8A',
          timer: 2000,
          showConfirmButton: false
        }).then(() => this.router.navigate(['/sinistres']));
      },
      error: (error) => {
        this.submitting = false;
        this.errorMessage = error.error?.message || 'Impossible de declarer le sinistre.';
      }
    });
  }
}
