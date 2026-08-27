import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Empêche l'accès aux pages auth (login/register) si déjà connecté. */
export const noAuthGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  if (!auth.isAuthenticated()) return true;
  auth.redirectToDashboard();
  return false;
};
