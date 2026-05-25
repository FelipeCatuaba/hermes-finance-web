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
          colorPrimary: '#0052ff'
        }
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
          colorPrimary: '#0052ff'
        }
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