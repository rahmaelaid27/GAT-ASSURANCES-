import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    router.navigate(['/auth/login']);
    return false;
  }

  const allowed: Role[] = route.data['roles'] ?? [];
  if (allowed.length === 0) return true;

  if (auth.hasRole(...allowed)) return true;

  // Redirige vers son propre dashboard plutôt qu'une page 403 froide
  auth.redirectToDashboard();
  return false;
};
