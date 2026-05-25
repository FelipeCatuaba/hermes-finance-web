import { Component, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { UiButtonComponent } from '../../shared/ui/button/ui-button.component';
import { AuthSessionService } from '../../core/auth/auth-session.service';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [RouterLink, UiButtonComponent, ReactiveFormsModule, NgIf],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.css'
})
export class AuthPageComponent {
  readonly mode = signal<'sign-in' | 'sign-up'>('sign-in');
  readonly statusMessage = signal('');
  readonly isSignUp = computed(() => this.mode() === 'sign-up');

  readonly signInForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    remember: [true]
  });

  readonly signUpForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
    acceptTerms: [false, [Validators.requiredTrue]]
  });

  constructor(
    private readonly route: ActivatedRoute,
    private readonly fb: FormBuilder,
    private readonly auth: AuthSessionService
  ) {
    this.route.queryParamMap.subscribe((params) => {
      this.mode.set(params.get('mode') === 'sign-up' ? 'sign-up' : 'sign-in');
      this.statusMessage.set('');
    });

    void this.tryHandleOAuthCallback();
  }

  async submitSignIn() {
    this.signInForm.markAllAsTouched();
    if (this.signInForm.invalid) {
      this.statusMessage.set('Preencha os campos de login corretamente.');
      return;
    }

    try {
      const value = this.signInForm.getRawValue();
      const result = await this.auth.signInWithPassword(value.email ?? '', value.password ?? '');
      this.statusMessage.set(result.ok ? 'Login realizado com sucesso. Redirecionando...' : (result.message ?? 'Falha no login.'));
      if (result.ok) {
        window.location.href = '/dashboard';
      }
    } catch {
      this.statusMessage.set('Não foi possível realizar o login agora.');
    }
  }

  async submitSignUp() {
    this.signUpForm.markAllAsTouched();
    const values = this.signUpForm.getRawValue();
    if (this.signUpForm.invalid) {
      this.statusMessage.set('Preencha os campos de cadastro corretamente.');
      return;
    }

    if (values.password !== values.confirmPassword) {
      this.statusMessage.set('As senhas de cadastro não conferem.');
      return;
    }

    try {
      const result = await this.auth.signUpWithPassword(values.name ?? '', values.email ?? '', values.password ?? '');
      this.statusMessage.set(result.ok ? 'Cadastro concluído com sucesso. Redirecionando...' : (result.message ?? 'Falha no cadastro.'));
      if (result.ok) {
        window.location.href = '/dashboard';
      }
    } catch {
      this.statusMessage.set('Não foi possível concluir o cadastro agora.');
    }
  }

  async signInWithSso(provider: 'google' | 'apple') {
    try {
      await this.auth.startSocialSignIn(provider, this.mode());
    } catch {
      this.statusMessage.set(`Não foi possível iniciar o SSO com ${provider === 'google' ? 'Google' : 'Apple'}.`);
    }
  }

  private async tryHandleOAuthCallback() {
    try {
      const handled = await this.auth.handleRedirectCallbackIfPresent();
      if (handled) {
        window.location.href = '/dashboard';
      }
    } catch {
      this.statusMessage.set('Falha ao concluir autenticação social.');
    }
  }
}
