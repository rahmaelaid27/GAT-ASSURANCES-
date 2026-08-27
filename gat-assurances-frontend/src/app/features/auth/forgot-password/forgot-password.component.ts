import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '@core/services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Mot de passe oublié</h2>
      <p class="text-gray-500 mb-6">Saisissez votre email pour réinitialiser votre mot de passe</p>

      <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()" class="space-y-4">
        <div>
          <label class="form-label">Email</label>
          <input type="email" formControlName="email" class="form-input" placeholder="votre@email.com">
        </div>

        <button type="submit" [disabled]="forgotForm.invalid || isLoading"
                class="btn-primary w-full">
          {{ isLoading ? 'Envoi...' : 'Réinitialiser' }}
        </button>
      </form>

      <p class="text-center text-sm text-gray-500 mt-6">
        <a routerLink="/auth/login" class="text-primary-600 font-medium hover:text-primary-700">
          Retour à la connexion
        </a>
      </p>
    </div>
  `
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotForm.invalid) return;

    this.isLoading = true;
    this.api.post('auth/forgot-password', this.forgotForm.value).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Email envoyé',
          text: 'Vérifiez votre boîte de réception',
          confirmButtonColor: '#1a3a5c'
        });
        this.forgotForm.reset();
      },
      error: () => {
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}

