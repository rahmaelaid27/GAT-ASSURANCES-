import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { AuthService } from '@core/services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Skip popup for auth endpoints (login/register) - components handle inline
      if (req.url.includes('/auth/')) {
        return throwError(() => error);
      }

      let errorMessage = 'Une erreur est survenue';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = error.error.message;
      } else {
        // Server-side error
        const serverError = error.error;
        let serverMessage = '';

        if (serverError?.message) {
          serverMessage = serverError.message;
        } else if (serverError?.errors) {
          const errorsList = Object.values(serverError.errors);
          if (errorsList.length > 0) {
            serverMessage = errorsList.join('. ');
          }
        }

        switch (error.status) {
          case 400:
            errorMessage = serverMessage || 'Requête invalide';
            break;
          case 401:
            errorMessage = serverMessage || 'Session expirée. Veuillez vous reconnecter.';
            router.navigate(['/auth/login']);
            break;
          case 403:
            errorMessage = serverMessage || 'Accès non autorisé';
            break;
          case 404:
            errorMessage = serverMessage || 'Ressource non trouvée';
            break;
          case 409:
            errorMessage = serverMessage || 'Conflit de données';
            break;
          case 500:
            errorMessage = serverMessage || 'Erreur interne du serveur';
            break;
          default:
            errorMessage = serverMessage || 'Erreur inattendue';
        }
      }

      if (authService.isLoggedIn()) {        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: errorMessage,
          confirmButtonColor: '#1a3a5c'
        });
      }

      return throwError(() => error);
    })
  );
};

