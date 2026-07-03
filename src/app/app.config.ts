import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { authTokenInterceptor } from './core/http/auth-token.interceptor';
import { AuthSessionService } from './core/auth/auth-session.service';

function initializeAuth(auth: AuthSessionService) {
  return async () => {
    if (auth.hasSessionHint()) {
      await auth.init();
    }
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authTokenInterceptor])),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      deps: [AuthSessionService],
      multi: true
    }
  ]
};
