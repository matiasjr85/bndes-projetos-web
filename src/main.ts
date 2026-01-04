import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { importProvidersFrom, LOCALE_ID } from '@angular/core';

import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';

import { MatSnackBarModule } from '@angular/material/snack-bar';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { jwtInterceptor } from './app/core/auth/jwt.interceptor';
import { authErrorInterceptor } from './app/core/auth/auth-error.interceptor';

import { PtBrDateAdapter } from './app/shared/date-adapters/pt-br-date-adapter';

registerLocaleData(localePt);

export const PT_BR_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {    
    dateInput: { day: '2-digit', month: '2-digit', year: 'numeric' },
    monthYearLabel: { month: 'short', year: 'numeric' },
    dateA11yLabel: { day: '2-digit', month: '2-digit', year: 'numeric' },
    monthYearA11yLabel: { month: 'long', year: 'numeric' },
  },
};

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideAnimations(),

    { provide: LOCALE_ID, useValue: 'pt-BR' },
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    
    { provide: DateAdapter, useClass: PtBrDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: PT_BR_DATE_FORMATS },

    importProvidersFrom(MatSnackBarModule),

    provideHttpClient(withInterceptors([jwtInterceptor, authErrorInterceptor])),
  ],
}).catch(err => console.error(err));
