import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

// Ajuste os nomes se seu backend devolver diferente
export interface LoginResponseBody {
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string; // "Bearer"
  expiresInSeconds?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly ACCESS_TOKEN_KEY = 'bndes_token';
  private readonly REFRESH_TOKEN_KEY = 'bndes_refresh_token';

  constructor(private http: HttpClient) {}

  /** usado pelo interceptor */
  getToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /** limpa tokens (inclui chaves antigas que podem estar te sabotando) */
  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);

    // chaves antigas que vi no seu print (pra não confundir guard/interceptor)
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
  }

  login(payload: LoginRequest): Observable<void> {
    // Observe a response pra conseguir ler header Authorization se existir
    return this.http
      .post<LoginResponseBody>('/api/auth/login', payload, { observe: 'response' })
      .pipe(
        tap((res) => this.persistTokensFromLogin(res)),
        map(() => void 0)
      );
  }

  register(payload: RegisterRequest): Observable<void> {
    return this.http.post<void>('/api/auth/register', payload);
  }

  refresh(): Observable<void> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      // sem refresh token -> força relogar
      this.clearTokens();
      return new Observable<void>((sub) => {
        sub.error(new Error('Missing refresh token'));
      });
    }

    return this.http
      .post<LoginResponseBody>('/api/auth/refresh', { refreshToken }, { observe: 'response' })
      .pipe(
        tap((res) => this.persistTokensFromLogin(res)),
        map(() => void 0)
      );
  }

  /** logout local (UX) */
  logout(): void {
    this.clearTokens();
  }

  /** logout no backend (blacklist/revogação). Mantém UX mesmo se falhar */
  logoutRemote(): Observable<void> {
    const refreshToken = this.getRefreshToken();

    // alguns backends exigem refreshToken no body; outros só Authorization header
    return this.http.post<void>('/api/auth/logout', refreshToken ? { refreshToken } : {});
  }

  private persistTokensFromLogin(res: HttpResponse<LoginResponseBody>): void {
    // 1) tenta pegar do header Authorization: "Bearer <jwt>"
    const authHeader = res.headers.get('Authorization') || res.headers.get('authorization');

    let accessToken: string | undefined;

    if (authHeader) {
      accessToken = authHeader.startsWith('Bearer ')
        ? authHeader.substring('Bearer '.length).trim()
        : authHeader.trim();
    } else {
      // 2) ou do body (accessToken)
      accessToken = res.body?.accessToken;
    }

    const refreshToken = res.body?.refreshToken;

    if (accessToken) localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);

    // remove chaves antigas pra não te jogar de volta pro login
    localStorage.removeItem('token');
  }
}
