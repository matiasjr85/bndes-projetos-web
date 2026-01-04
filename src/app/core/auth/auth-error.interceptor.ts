import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const snack = inject(MatSnackBar);

  const isAuthEndpoint =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/refresh');

  return next(req).pipe(
    catchError((err: unknown) => {
      if (!(err instanceof HttpErrorResponse)) {
        return throwError(() => err);
      }

      const apiMessage =
        err.error?.message ||
        err.error?.error ||
        err.message ||
        'Erro inesperado.';

      // 401 fora dos endpoints de auth: expiração/revogação -> força login
      if (err.status === 401 && !isAuthEndpoint) {
        auth.logout();
        snack.open(apiMessage || 'Sessão expirada. Faça login novamente.', 'OK', { duration: 4000 });
        router.navigateByUrl('/login');
        return throwError(() => err);
      }

      // 403: acesso negado
      if (err.status === 403) {
        snack.open(apiMessage || 'Acesso negado.', 'OK', { duration: 4000 });
        return throwError(() => err);
      }

      // 400/409: validação / conflito (deixa o componente tratar também, mas já dá feedback)
      if (err.status === 400 || err.status === 409) {
        snack.open(apiMessage, 'OK', { duration: 4500 });
        return throwError(() => err);
      }

      return throwError(() => err);
    })
  );
};
