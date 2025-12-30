import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {  
  if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
    return next(req);
  }

  const auth = inject(AuthService);
  const token = auth.getToken();

  if (!token) return next(req);
  
  const cleanToken = token.toLowerCase().startsWith('bearer ')
    ? token.slice(7).trim()
    : token.trim();

  const cloned = req.clone({
    setHeaders: { Authorization: `Bearer ${cleanToken}` },
  });

  return next(cloned);
};