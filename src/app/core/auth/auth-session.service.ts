import { Injectable, signal } from '@angular/core';
import type { Clerk } from '@clerk/clerk-js';
import { environment } from '../../../environments/environment';

interface AuthState {
  isLoaded: boolean;
  isAuthenticated: boolean;
  userId: string | null;
}

export interface AuthActionResult {
  ok: boolean;
  requiresEmailVerification?: boolean;
  message?: string;
}

export type AuthProfileSection = 'profile' | 'email' | 'password' | 'sessions';

export interface AuthAccountSummary {
  userId: string;
  name: string;
  email: string;
  passwordEnabled: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private clerk: Clerk | null = null;
  private readonly stateSignal = signal<AuthState>({
    isLoaded: false,
    isAuthenticated: false,
    userId: null
  });

  readonly state = this.stateSignal.asReadonly();

  isConfigured(): boolean {
    return Boolean(environment.clerkPublishableKey);
  }

  hasSessionHint(): boolean {
    if (this.state().isAuthenticated) {
      return true;
    }

    if (!this.isConfigured() || typeof window === 'undefined') {
      return false;
    }

    return this.hasClerkStorageHint(window.localStorage)
      || this.hasClerkStorageHint(window.sessionStorage)
      || document.cookie.split(';').some((cookie) => cookie.trim().startsWith('__session='));
  }

  async init(): Promise<void> {
    const key = environment.clerkPublishableKey;
    if (!key) {
      this.stateSignal.set({ isLoaded: true, isAuthenticated: false, userId: null });
      return;
    }

    if (!this.clerk) {
      const { Clerk } = await import('@clerk/clerk-js');
      this.clerk = new Clerk(key);
      await this.clerk.load();
    }

    this.syncState();
  }

  private syncState(): void {
    const session = this.clerk?.session ?? null;
    const user = this.clerk?.user ?? null;
    this.stateSignal.set({
      isLoaded: true,
      isAuthenticated: Boolean(session),
      userId: user?.id ?? null
    });
  }

  async ensureAuthenticated(): Promise<boolean> {
    if (!this.state().isLoaded) {
      await this.init();
    }
    this.syncState();
    return this.state().isAuthenticated;
  }

  async getToken(): Promise<string | null> {
    if (!this.state().isLoaded) {
      await this.init();
    }
    if (!this.clerk?.session) {
      return null;
    }
    return this.clerk.session.getToken();
  }

  async signOut(): Promise<void> {
    if (this.clerk?.session) {
      await this.clerk.signOut();
    }
    this.syncState();
  }

  getAccountSummary(): AuthAccountSummary | null {
    const user = this.clerk?.user;
    if (!user) {
      return null;
    }

    return {
      userId: user.id,
      name: user.fullName || user.firstName || 'Conta HERMES',
      email: user.primaryEmailAddress?.emailAddress ?? 'Email nao informado',
      passwordEnabled: user.passwordEnabled
    };
  }

  async refreshAccountSummary(): Promise<AuthAccountSummary | null> {
    await this.init();
    const user = this.clerk?.user;
    if (user) {
      await (user as any).reload?.();
    }
    this.syncState();
    return this.getAccountSummary();
  }

  async openUserProfile(section: AuthProfileSection = 'profile'): Promise<AuthActionResult> {
    await this.init();
    if (!this.clerk) {
      return { ok: false, message: 'Clerk nao esta configurado neste ambiente.' };
    }
    if (!this.clerk.session || !this.clerk.user) {
      return { ok: false, message: 'Entre novamente para gerenciar sua conta.' };
    }

    const startPathBySection: Record<AuthProfileSection, string> = {
      profile: '/account',
      email: '/account/email-addresses',
      password: '/security',
      sessions: '/security/active-devices'
    };
    this.clerk.openUserProfile({
      __experimental_startPath: startPathBySection[section]
    } as any);
    this.syncState();
    return { ok: true };
  }

  async signInWithPassword(email: string, password: string): Promise<AuthActionResult> {
    await this.init();
    if (!this.clerk?.client) {
      return { ok: false, message: 'Não foi possível autenticar agora.' };
    }

    try {
      const signIn = await this.clerk.client.signIn.create({
        identifier: email,
        password
      } as any);

      if (signIn.status === 'complete' && signIn.createdSessionId) {
        await this.clerk.setActive({ session: signIn.createdSessionId });
        this.syncState();
        const synced = await this.ensureBackendAccess();
        if (!synced) {
          await this.signOut();
          return { ok: false, message: 'Não foi possível concluir seu acesso agora. Tente novamente em instantes.' };
        }
        return { ok: true };
      }

      return { ok: false, message: 'Não foi possível concluir seu acesso agora.' };
    } catch (error: any) {
      return { ok: false, message: this.extractClerkError(error, 'Não foi possível concluir seu acesso agora.') };
    }
  }

  async signUpWithPassword(name: string, email: string, password: string): Promise<AuthActionResult> {
    await this.init();
    if (!this.clerk?.client) {
      return { ok: false, message: 'Não foi possível iniciar o cadastro agora.' };
    }

    try {
      const [firstName, ...rest] = name.trim().split(' ');
      const lastName = rest.join(' ') || undefined;

      const signUp = await this.clerk.client.signUp.create({
        firstName,
        lastName,
        emailAddress: email,
        password
      } as any);

      if (signUp.status === 'complete' && signUp.createdSessionId) {
        await this.clerk.setActive({ session: signUp.createdSessionId });
        this.syncState();
        const synced = await this.ensureBackendAccess();
        if (!synced) {
          await this.signOut();
          return { ok: false, message: 'Cadastro realizado, mas ainda não foi possível liberar seu acesso. Tente novamente em instantes.' };
        }
        return { ok: true };
      }

      await this.prepareSignUpEmailCode();
      return { ok: false, requiresEmailVerification: true };
    } catch (error: any) {
      return { ok: false, message: this.extractClerkError(error, 'Não foi possível iniciar o cadastro agora.') };
    }
  }

  async verifySignUpEmailCode(code: string): Promise<AuthActionResult> {
    await this.init();
    if (!this.clerk?.client?.signUp) {
      return { ok: false, message: 'Sessão de cadastro expirada. Recomece o cadastro.' };
    }

    try {
      const result = await this.clerk.client.signUp.attemptEmailAddressVerification({ code } as any);
      if (result.status === 'complete' && result.createdSessionId) {
        await this.clerk.setActive({ session: result.createdSessionId });
        this.syncState();
        const synced = await this.ensureBackendAccess();
        if (!synced) {
          await this.signOut();
          return { ok: false, message: 'Código validado, mas seu acesso ainda não pôde ser liberado. Tente novamente em instantes.' };
        }
        return { ok: true };
      }

      return { ok: false, message: 'Código inválido ou expirado.' };
    } catch (error: any) {
      return { ok: false, message: this.extractClerkError(error, 'Código inválido ou expirado.') };
    }
  }

  async resendSignUpEmailCode(): Promise<AuthActionResult> {
    try {
      await this.prepareSignUpEmailCode();
      return { ok: true };
    } catch {
      return { ok: false, message: 'Não foi possível reenviar o código agora.' };
    }
  }

  private async prepareSignUpEmailCode(): Promise<void> {
    await this.init();
    if (!this.clerk?.client?.signUp) {
      throw new Error('Signup state unavailable');
    }
    await this.clerk.client.signUp.prepareEmailAddressVerification({
      strategy: 'email_code'
    } as any);
  }

  async startSocialSignIn(provider: 'google' | 'apple', mode: 'sign-in' | 'sign-up'): Promise<void> {
    await this.init();
    if (!this.clerk?.client) {
      throw new Error('Serviço de autenticação indisponível.');
    }

    const strategy = provider === 'google' ? 'oauth_google' : 'oauth_apple';
    const redirectUrl = `${window.location.origin}/auth?mode=${mode}`;
    const redirectUrlComplete = `${window.location.origin}/dashboard`;

    if (mode === 'sign-up') {
      await this.clerk.client.signUp.authenticateWithRedirect({ strategy, redirectUrl, redirectUrlComplete } as any);
      return;
    }
    await this.clerk.client.signIn.authenticateWithRedirect({ strategy, redirectUrl, redirectUrlComplete } as any);
  }

  async handleRedirectCallbackIfPresent(): Promise<boolean> {
    const search = window.location.search;
    const maybeOAuthReturn =
      search.includes('__clerk') ||
      search.includes('oauth') ||
      search.includes('rotating_token_nonce');
    if (!maybeOAuthReturn) {
      return false;
    }

    await this.init();
    if (!this.clerk) {
      return false;
    }

    await this.clerk.handleRedirectCallback();
    this.syncState();
    const synced = await this.ensureBackendAccess();
    if (!synced) {
      await this.signOut();
      return false;
    }
    return true;
  }

  private async ensureBackendAccess(): Promise<boolean> {
    const token = await this.getToken();
    if (!token) {
      return false;
    }

    const endpoint = `${environment.apiBaseUrl.replace(/\/$/, '')}/api/family-members?includeInactive=true`;
    const maxAttempts = 6;
    for (let i = 0; i < maxAttempts; i += 1) {
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        return true;
      }
      if (res.status !== 404) {
        return false;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    return false;
  }

  private extractClerkError(error: any, fallback: string): string {
    const firstMessage = error?.errors?.[0]?.longMessage
      || error?.errors?.[0]?.message
      || error?.message;
    if (!firstMessage || typeof firstMessage !== 'string') {
      return fallback;
    }
    return firstMessage;
  }

  private hasClerkStorageHint(storage: Storage): boolean {
    try {
      for (let i = 0; i < storage.length; i += 1) {
        const key = storage.key(i)?.toLowerCase() ?? '';
        if (key.startsWith('clerk-db-jwt') || key.startsWith('clerk-db-session')) {
          return true;
        }
      }
    } catch {
      return false;
    }

    return false;
  }
}
