import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;              // pode vir "eyJ..." ou "Bearer eyJ..."
  tokenType?: string;         // "Bearer"
  expiresInSeconds?: number;  // 7200
}

export interface RegisterRequest {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'token';
  private readonly LEGACY_KEYS = ['bndes_token'];

  constructor(private http: HttpClient) {
    this.migrateLegacyTokenIfNeeded();
  }

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/auth/login', payload).pipe(
      map((res) => {
        const normalized = this.normalizeToken(res.token, res.tokenType);
        this.setToken(normalized);
        return res;
      })
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

  private normalizeToken(token: string, tokenType?: string): string {
    if (!token) return token;

    // se já veio "Bearer xxx", guarda só o xxx
    if (token.toLowerCase().startsWith('bearer ')) {
      return token.slice(7).trim();
    }

    // se veio token puro e tokenType=Bearer, mantém token puro (interceptor adiciona "Bearer ")
    return token.trim();
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
