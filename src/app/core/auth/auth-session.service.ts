import { Injectable, signal } from '@angular/core';
import { Clerk } from '@clerk/clerk-js';
import { environment } from '../../../environments/environment';

interface AuthState {
  isLoaded: boolean;
  isAuthenticated: boolean;
  userId: string | null;
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

  async init(): Promise<void> {
    const key = environment.clerkPublishableKey;
    if (!key) {
      this.stateSignal.set({ isLoaded: true, isAuthenticated: false, userId: null });
      return;
    }

    if (!this.clerk) {
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

  async getToken(): Promise<string | null> {
    if (!this.state().isLoaded) {
      await this.init();
    }

    if (!this.clerk?.session) {
      return null;
    }

    return this.clerk.session.getToken();
  }

  async ensureAuthenticated(): Promise<boolean> {
    if (!this.state().isLoaded) {
      await this.init();
    }
    this.syncState();
    return this.state().isAuthenticated;
  }

  async signOut(): Promise<void> {
    if (this.clerk?.session) {
      await this.clerk.signOut();
    }
    this.syncState();
  }

  async signInWithPassword(email: string, password: string): Promise<{ ok: boolean; message?: string }> {
    await this.init();
    if (!this.clerk?.client) {
      return { ok: false, message: 'Serviço de autenticação indisponível.' };
    }

    const signIn = await this.clerk.client.signIn.create({
      identifier: email,
      password
    } as any);

    if (signIn.status === 'complete' && signIn.createdSessionId) {
      await this.clerk.setActive({ session: signIn.createdSessionId });
      this.syncState();
      return { ok: true };
    }

    return { ok: false, message: 'Não foi possível concluir o login agora.' };
  }

  async signUpWithPassword(name: string, email: string, password: string): Promise<{ ok: boolean; message?: string }> {
    await this.init();
    if (!this.clerk?.client) {
      return { ok: false, message: 'Serviço de autenticação indisponível.' };
    }

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
      return { ok: true };
    }

    return { ok: false, message: 'Cadastro iniciado. Verifique as próximas etapas de validação.' };
  }

  async startSocialSignIn(
    provider: 'google' | 'apple',
    mode: 'sign-in' | 'sign-up'
  ): Promise<void> {
    await this.init();
    if (!this.clerk?.client) {
      throw new Error('Serviço de autenticação indisponível.');
    }

    const strategy = provider === 'google' ? 'oauth_google' : 'oauth_apple';
    const redirectUrl = `${window.location.origin}/auth?mode=${mode}`;
    const redirectUrlComplete = `${window.location.origin}/dashboard`;

    if (mode === 'sign-up') {
      await this.clerk.client.signUp.authenticateWithRedirect({
        strategy,
        redirectUrl,
        redirectUrlComplete
      } as any);
      return;
    }

    await this.clerk.client.signIn.authenticateWithRedirect({
      strategy,
      redirectUrl,
      redirectUrlComplete
    } as any);
  }

  async handleRedirectCallbackIfPresent(): Promise<boolean> {
    await this.init();
    if (!this.clerk) {
      return false;
    }

    const search = window.location.search;
    const maybeOAuthReturn =
      search.includes('__clerk') ||
      search.includes('oauth') ||
      search.includes('rotating_token_nonce');

    if (!maybeOAuthReturn) {
      return false;
    }

    await this.clerk.handleRedirectCallback();
    this.syncState();
    return true;
  }

  async mountSignIn(element: HTMLDivElement): Promise<void> {
    if (!this.state().isLoaded) {
      await this.init();
    }

    if (!this.clerk) {
      return;
    }

    await this.clerk.mountSignIn(element, {
      appearance: {
        variables: {
          colorPrimary: '#3461f5',
          colorBackground: '#0f1320',
          colorText: '#f0f4ff',
          colorInputBackground: '#141928',
          colorInputText: '#f0f4ff',
          colorNeutral: '#a8b5d4',
          borderRadius: '12px'
        },
        elements: {
          card: 'shadow-none border border-slate-700 bg-transparent',
          headerTitle: 'text-white',
          headerSubtitle: 'text-slate-300',
          formFieldLabel: 'text-slate-200',
          socialButtonsBlockButton: 'border border-slate-600 bg-slate-900 text-slate-100',
          formFieldInput: 'border border-slate-700 bg-slate-900 text-slate-100',
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-500 text-white',
          dividerLine: 'bg-slate-700',
          dividerText: 'text-slate-400',
          footerActionText: 'text-slate-400',
          footerActionLink: 'text-blue-300'
        }
      },
      layout: {
        socialButtonsPlacement: 'bottom',
        socialButtonsVariant: 'blockButton'
      },
      signUpUrl: '/auth?mode=sign-up',
      afterSignInUrl: '/dashboard'
    } as any);
  }

  async mountSignUp(element: HTMLDivElement): Promise<void> {
    if (!this.state().isLoaded) {
      await this.init();
    }

    if (!this.clerk) {
      return;
    }

    await this.clerk.mountSignUp(element, {
      appearance: {
        variables: {
          colorPrimary: '#3461f5',
          colorBackground: '#0f1320',
          colorText: '#f0f4ff',
          colorInputBackground: '#141928',
          colorInputText: '#f0f4ff',
          colorNeutral: '#a8b5d4',
          borderRadius: '12px'
        },
        elements: {
          card: 'shadow-none border border-slate-700 bg-transparent',
          headerTitle: 'text-white',
          headerSubtitle: 'text-slate-300',
          formFieldLabel: 'text-slate-200',
          socialButtonsBlockButton: 'border border-slate-600 bg-slate-900 text-slate-100',
          formFieldInput: 'border border-slate-700 bg-slate-900 text-slate-100',
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-500 text-white',
          dividerLine: 'bg-slate-700',
          dividerText: 'text-slate-400',
          footerActionText: 'text-slate-400',
          footerActionLink: 'text-blue-300'
        }
      },
      layout: {
        socialButtonsPlacement: 'bottom',
        socialButtonsVariant: 'blockButton'
      },
      signInUrl: '/auth?mode=sign-in',
      afterSignUpUrl: '/dashboard'
    } as any);
  }

  unmountAuthWidget(element: HTMLDivElement): void {
    if (!this.clerk) {
      return;
    }

    this.clerk.unmountSignIn(element);
    this.clerk.unmountSignUp(element);
  }
}
