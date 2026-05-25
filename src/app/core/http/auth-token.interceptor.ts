import { HttpInterceptorFn } from '@angular/common/http';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { inject } from '@angular/core';
import { AuthSessionService } from '../auth/auth-session.service';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthSessionService);

  return from(auth.getToken()).pipe(
    switchMap((token) => {
      if (!token) {
        return next(req);
      }

      return next(
        req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        })
      );
    })
  );
};