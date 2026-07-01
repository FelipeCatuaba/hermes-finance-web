import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthSessionService } from './auth-session.service';

export const publicAuthResetGuard: CanActivateFn = async () => {
  const auth = inject(AuthSessionService);
  await auth.signOut();
  return true;
};
