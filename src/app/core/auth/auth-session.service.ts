import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

interface AuthState {
  isLoaded: boolean;
  isAuthenticated: boolean;
  userId: string | null;
}

export interface AuthActionResult {
  ok: boolean;
  message?: string;
}

export interface AuthAccountSummary {
  userId: string;
  name: string;
  email: string;
  role: string;
  passwordEnabled: boolean;
}

interface AuthUserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
  user: AuthUserResponse;
}

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly baseUrl = environment.apiBaseUrl.replace(/\/$/, '');
  private readonly accessTokenKey = 'hermes.accessToken';
  private readonly refreshTokenKey = 'hermes.refreshToken';
  private account: AuthAccountSummary | null = null;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  private readonly stateSignal = signal<AuthState>({
    isLoaded: false,
    isAuthenticated: false,
    userId: null
  });

  readonly state = this.stateSignal.asReadonly();

  constructor(private readonly http: HttpClient) {}

  isConfigured(): boolean {
    return true;
  }

  hasSessionHint(): boolean {
    if (this.state().isAuthenticated) {
      return true;
    }
    if (typeof window === 'undefined') {
      return false;
    }
    return Boolean(window.localStorage.getItem(this.refreshTokenKey) || window.sessionStorage.getItem(this.refreshTokenKey));
  }

  async init(): Promise<void> {
    this.loadStoredTokens();
    if (!this.accessToken && !this.refreshToken) {
      this.clearSession();
      this.stateSignal.set({ isLoaded: true, isAuthenticated: false, userId: null });
      return;
    }

    try {
      await this.loadCurrentUser();
    } catch {
      const refreshed = await this.tryRefresh();
      if (!refreshed) {
        this.clearSession();
      }
    } finally {
      this.syncState();
    }
  }

  async ensureAuthenticated(): Promise<boolean> {
    if (!this.state().isLoaded) {
      await this.init();
    }
    if (this.state().isAuthenticated) {
      return true;
    }
    return this.tryRefresh();
  }

  async getToken(): Promise<string | null> {
    if (!this.state().isLoaded) {
      await this.init();
    }
    if (this.accessToken) {
      return this.accessToken;
    }
    const refreshed = await this.tryRefresh();
    return refreshed ? this.accessToken : null;
  }

  async signOut(): Promise<void> {
    const refreshToken = this.refreshToken;
    try {
      if (this.accessToken) {
        await firstValueFrom(this.http.post<void>(`${this.baseUrl}/api/auth/logout`, { refreshToken }));
      }
    } catch {
      // Logout local deve acontecer mesmo que a API esteja indisponivel.
    } finally {
      this.clearSession();
      this.syncState();
    }
  }

  getAccountSummary(): AuthAccountSummary | null {
    return this.account;
  }

  async refreshAccountSummary(): Promise<AuthAccountSummary | null> {
    if (!this.state().isLoaded) {
      await this.init();
    } else if (this.accessToken) {
      await this.loadCurrentUser();
      this.syncState();
    }
    return this.account;
  }

  async signInWithPassword(email: string, password: string, remember = true): Promise<AuthActionResult> {
    try {
      const response = await firstValueFrom(this.http.post<AuthResponse>(`${this.baseUrl}/api/auth/login`, {
        email,
        password,
        remember
      }));
      this.applySession(response, remember);
      return { ok: true };
    } catch (error: any) {
      return { ok: false, message: this.extractApiError(error, 'Nao foi possivel concluir seu acesso agora.') };
    }
  }

  async signUpWithPassword(name: string, email: string, password: string): Promise<AuthActionResult> {
    try {
      const response = await firstValueFrom(this.http.post<AuthResponse>(`${this.baseUrl}/api/auth/register`, {
        name,
        email,
        password
      }));
      this.applySession(response, true);
      return { ok: true };
    } catch (error: any) {
      return { ok: false, message: this.extractApiError(error, 'Nao foi possivel iniciar o cadastro agora.') };
    }
  }

  private async tryRefresh(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }
    try {
      const response = await firstValueFrom(this.http.post<AuthResponse>(`${this.baseUrl}/api/auth/refresh`, {
        refreshToken: this.refreshToken
      }));
      this.applySession(response, this.refreshStoredInLocalStorage());
      return true;
    } catch {
      this.clearSession();
      this.syncState();
      return false;
    }
  }

  private async loadCurrentUser(): Promise<void> {
    const user = await firstValueFrom(this.http.get<AuthUserResponse>(`${this.baseUrl}/api/auth/me`));
    this.account = this.toAccount(user);
  }

  private applySession(response: AuthResponse, remember: boolean): void {
    this.accessToken = response.accessToken;
    this.refreshToken = response.refreshToken;
    this.account = this.toAccount(response.user);
    this.storeTokens(remember);
    this.syncState();
  }

  private syncState(): void {
    this.stateSignal.set({
      isLoaded: true,
      isAuthenticated: Boolean(this.accessToken && this.account),
      userId: this.account?.userId ?? null
    });
  }

  private toAccount(user: AuthUserResponse): AuthAccountSummary {
    return {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      passwordEnabled: true
    };
  }

  private loadStoredTokens(): void {
    if (typeof window === 'undefined') {
      return;
    }
    this.accessToken = window.localStorage.getItem(this.accessTokenKey) ?? window.sessionStorage.getItem(this.accessTokenKey);
    this.refreshToken = window.localStorage.getItem(this.refreshTokenKey) ?? window.sessionStorage.getItem(this.refreshTokenKey);
  }

  private storeTokens(remember: boolean): void {
    if (typeof window === 'undefined' || !this.accessToken || !this.refreshToken) {
      return;
    }
    const persistent = remember ? window.localStorage : window.sessionStorage;
    const transient = remember ? window.sessionStorage : window.localStorage;
    transient.removeItem(this.accessTokenKey);
    transient.removeItem(this.refreshTokenKey);
    persistent.setItem(this.accessTokenKey, this.accessToken);
    persistent.setItem(this.refreshTokenKey, this.refreshToken);
  }

  private refreshStoredInLocalStorage(): boolean {
    return typeof window !== 'undefined' && window.localStorage.getItem(this.refreshTokenKey) === this.refreshToken;
  }

  private clearSession(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.account = null;
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.removeItem(this.accessTokenKey);
    window.localStorage.removeItem(this.refreshTokenKey);
    window.sessionStorage.removeItem(this.accessTokenKey);
    window.sessionStorage.removeItem(this.refreshTokenKey);
  }

  private extractApiError(error: any, fallback: string): string {
    const message = error?.error?.message || error?.error?.error || error?.message;
    return typeof message === 'string' && message.trim() ? message : fallback;
  }
}
