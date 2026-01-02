import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

function extractApiMessage(body: any): string | null {
  if (!body) return null;

  if (typeof body === 'string') return body;
  if (typeof body.message === 'string') return body.message;
  if (typeof body.error === 'string') return body.error;

  const fieldErrors = body?.details?.fieldErrors;
  if (Array.isArray(fieldErrors) && fieldErrors.length) {
    const msgs = fieldErrors
      .map((e: any) => e?.message)
      .filter((m: any) => typeof m === 'string' && m.trim().length > 0);

    if (msgs.length) return Array.from(new Set(msgs)).join(' ');
  }

  return null;
}

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const snack = inject(MatSnackBar);
  const auth = inject(AuthService);

  const isAuthEndpoint =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/refresh') ||
    req.url.includes('/auth/logout');

  return next(req).pipe(
    catchError((err: any) => {
      if (!(err instanceof HttpErrorResponse)) {
        return throwError(() => err);
      }

      // não “atropelar” fluxo de login/register/refresh/logout
      if (isAuthEndpoint) {
        return throwError(() => err);
      }

      const status = err.status;
      const msgFromApi = extractApiMessage(err.error);

      if (status === 401) {
        auth.logout();
        if (!router.url.startsWith('/login')) {
          snack.open(msgFromApi || 'Sessão expirada. Faça login novamente.', 'OK', { duration: 4000 });
          router.navigateByUrl('/login');
        }
      } else if (status === 403) {
        snack.open(msgFromApi || 'Acesso negado.', 'OK', { duration: 4000 });
      }

      return throwError(() => err);
    })
  );
};
