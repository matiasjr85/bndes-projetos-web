import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { MatSnackBarModule } from '@angular/material/snack-bar';

import { routes } from './app.routes';
import { jwtInterceptor } from './core/auth/jwt.interceptor';
import { authErrorInterceptor } from './core/auth/auth-error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    // SnackBar precisa estar disponível no root (interceptor usa)
    importProvidersFrom(MatSnackBarModule),

    provideHttpClient(withInterceptors([jwtInterceptor, authErrorInterceptor])),
  ],
};
