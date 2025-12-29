import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType?: string;          // "Bearer"
  expiresInSeconds?: number;   // 7200
}

export interface RegisterRequest {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // padrão único
  private readonly TOKEN_KEY = 'token';

  // legado (pra não herdar token antigo de outros testes)
  private readonly LEGACY_KEYS = ['bndes_token'];

  constructor(private http: HttpClient) {
    this.migrateLegacyTokenIfNeeded();
  }

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/auth/login', payload).pipe(
      tap(res => this.setToken(res.token))
    );
  }

  register(payload: RegisterRequest): Observable<any> {
    return this.http.post('/auth/register', payload);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.LEGACY_KEYS.forEach(k => localStorage.removeItem(k));
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
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
