import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class AuthErrorInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        
        if (req.url.includes('/auth/login')) {
          return throwError(() => error);
        }

        if (error.status === 401 && this.authService.isLoggedIn()) {
          this.authService.logout();
          this.router.navigate(['/login'], {
            queryParams: { reason: 'expired' }
          });
        }

        if (error.status === 403) {
          alert('Acesso negado.');
        }

        return throwError(() => error);
      })
    );
  }
}
