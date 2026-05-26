import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthSessionService } from './auth-session.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthSessionService);
  const router = inject(Router);
  const isAuthenticated = await auth.ensureAuthenticated();

  if (isAuthenticated) {
    return true;
  }

  return router.createUrlTree(['/auth'], {
    queryParams: { mode: 'sign-in' }
  });
};