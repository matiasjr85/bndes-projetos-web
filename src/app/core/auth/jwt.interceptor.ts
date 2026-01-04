import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  // não adiciona token nos endpoints de auth
  const isAuthEndpoint = req.url.includes('/auth/login')
    || req.url.includes('/auth/register')
    || req.url.includes('/auth/refresh');

  if (!token || isAuthEndpoint) {
    return next(req);
  }

  const cloned = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  });

  return next(cloned);
};
