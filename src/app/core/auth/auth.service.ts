import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, finalize, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType?: string;
  expiresInSeconds?: number;
  
  refreshToken?: string;
  refreshExpiresInSeconds?: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'bndes_token';
  private readonly LEGACY_KEYS = ['token', 'accessToken', 'jwt'];

  constructor(private http: HttpClient) {
    this.migrateLegacyTokenIfNeeded();
  }

  private api(path: string): string {
    const base = (environment.apiBaseUrl || '').replace(/\/$/, '');
    return base ? `${base}${path}` : path;
  }

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.api('/auth/login'), payload).pipe(
      map((res) => {
        const normalized = this.normalizeToken(res.token, res.tokenType);
        this.setToken(normalized);
        return res;
      })
    );
  }

  register(payload: RegisterRequest): Observable<any> {
    return this.http.post(this.api('/auth/register'), payload);
  }

  logoutRemote(): Observable<void> {
    return this.http.post<void>(this.api('/auth/logout'), {}).pipe(
      catchError(() => of(void 0)),
      finalize(() => this.logout())
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private normalizeToken(token: string, tokenType?: string): string {
    const t = String(token || '').trim();
    const type = String(tokenType || '').trim();

    if (!t) return '';

    if (t.toLowerCase().startsWith('bearer ')) return t;

    if (type && type.toLowerCase() === 'bearer') return `Bearer ${t}`;

    return t;
  }

  private migrateLegacyTokenIfNeeded(): void {
    const current = localStorage.getItem(this.TOKEN_KEY);
    if (current) return;

    for (const key of this.LEGACY_KEYS) {
      const legacy = localStorage.getItem(key);
      if (legacy) {
        localStorage.setItem(this.TOKEN_KEY, legacy);
        localStorage.removeItem(key);
        break;
      }
    }
  }
}
