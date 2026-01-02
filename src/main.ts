import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';

import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

import { MatSnackBarModule } from '@angular/material/snack-bar';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { jwtInterceptor } from './app/core/auth/jwt.interceptor';
import { authErrorInterceptor } from './app/core/auth/auth-error.interceptor';

registerLocaleData(localePt);

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideAnimations(),

    // ✅ SnackBar disponível globalmente (interceptor usa)
    importProvidersFrom(MatSnackBarModule),

    // ✅ interceptors: JWT + tratamento global 401/403
    provideHttpClient(withInterceptors([jwtInterceptor, authErrorInterceptor])),
  ],
}).catch(err => console.error(err));
