import { Component, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { UiButtonComponent } from '../../shared/ui/button/ui-button.component';
import { AuthSessionService } from '../../core/auth/auth-session.service';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_LOWER = /[a-z]/;
const PASSWORD_UPPER = /[A-Z]/;
const PASSWORD_SYMBOL = /[^A-Za-z0-9]/;
const PASSWORD_DIGIT = /\d/;
const PASSWORD_STRONG = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [RouterLink, UiButtonComponent, ReactiveFormsModule, NgIf, NgClass],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.css'
})
export class AuthPageComponent {
  readonly mode = signal<'sign-in' | 'sign-up'>('sign-in');
  readonly statusMessage = signal('');
  readonly isSubmitting = signal(false);
  readonly popupMessage = signal('');
  readonly showSignInPassword = signal(false);
  readonly showSignUpPassword = signal(false);
  readonly showConfirmPassword = signal(false);
  private readonly genericAuthError = 'Nao foi possivel concluir a autenticacao. Tente novamente.';

  readonly signInForm = this.fb.group({
    email: ['', [Validators.required, Validators.pattern(EMAIL_PATTERN)]],
    password: ['', [Validators.required]],
    remember: [true]
  });

  readonly signUpForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.pattern(EMAIL_PATTERN)]],
    password: ['', [Validators.required, Validators.pattern(PASSWORD_STRONG)]],
    confirmPassword: ['', [Validators.required]],
    acceptTerms: [false, [Validators.requiredTrue]]
  });

  get isSignUp(): boolean {
    return this.mode() === 'sign-up';
  }

  get passwordChecks() {
    const pwd = this.signUpForm.controls.password.value ?? '';
    return {
      minLen: pwd.length >= 8,
      upper: PASSWORD_UPPER.test(pwd),
      lower: PASSWORD_LOWER.test(pwd),
      digit: PASSWORD_DIGIT.test(pwd),
      symbol: PASSWORD_SYMBOL.test(pwd)
    };
  }

  get passwordComplete(): boolean {
    const checks = this.passwordChecks;
    return checks.minLen && checks.upper && checks.lower && checks.digit && checks.symbol;
  }

  get confirmMatches(): boolean {
    const pwd = this.signUpForm.controls.password.value ?? '';
    const confirm = this.signUpForm.controls.confirmPassword.value ?? '';
    return confirm.length > 0 && pwd === confirm;
  }

  get signInEmailValid(): boolean {
    const value = this.signInForm.controls.email.value ?? '';
    return EMAIL_PATTERN.test(value);
  }

  get signUpEmailValid(): boolean {
    const value = this.signUpForm.controls.email.value ?? '';
    return EMAIL_PATTERN.test(value);
  }

  get signInPasswordValid(): boolean {
    const value = this.signInForm.controls.password.value ?? '';
    return value.length > 0;
  }

  get canSubmitSignIn(): boolean {
    return this.signInForm.valid && this.signInEmailValid && this.signInPasswordValid && !this.isSubmitting();
  }

  get canSubmitSignUp(): boolean {
    return this.signUpForm.valid && this.passwordComplete && this.confirmMatches && !this.isSubmitting();
  }

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly auth: AuthSessionService
  ) {
    this.route.queryParamMap.subscribe((params) => {
      this.mode.set(params.get('mode') === 'sign-up' ? 'sign-up' : 'sign-in');
      this.statusMessage.set('');
    });
  }

  async submitSignIn() {
    this.signInForm.markAllAsTouched();
    if (this.signInForm.invalid) {
      this.statusMessage.set('Email ou senha invalidos.');
      return;
    }

    this.isSubmitting.set(true);
    try {
      const value = this.signInForm.getRawValue();
      const result = await this.auth.signInWithPassword(value.email ?? '', value.password ?? '', Boolean(value.remember));
      this.statusMessage.set(result.ok ? 'Login realizado com sucesso. Redirecionando...' : result.message ?? this.genericAuthError);
      if (result.ok) {
        await this.router.navigateByUrl('/dashboard');
        return;
      }
      this.openPopup(result.message ?? this.genericAuthError);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async submitSignUp() {
    this.signUpForm.markAllAsTouched();
    const values = this.signUpForm.getRawValue();
    if (this.signUpForm.invalid) {
      this.statusMessage.set('Preencha os campos de cadastro corretamente.');
      return;
    }

    if (!this.passwordComplete) {
      this.statusMessage.set('Senha nao atende aos criterios minimos.');
      return;
    }

    if (!this.confirmMatches) {
      this.statusMessage.set('As senhas de cadastro nao conferem.');
      return;
    }

    this.isSubmitting.set(true);
    try {
      const result = await this.auth.signUpWithPassword(values.name ?? '', values.email ?? '', values.password ?? '');
      this.statusMessage.set(result.ok ? 'Cadastro concluido com sucesso. Redirecionando...' : result.message ?? this.genericAuthError);
      if (result.ok) {
        await this.router.navigateByUrl('/dashboard');
        return;
      }
      this.openPopup(result.message ?? this.genericAuthError);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  closePopup() {
    this.popupMessage.set('');
  }

  toggleSignInPasswordVisibility() {
    this.showSignInPassword.set(!this.showSignInPassword());
  }

  toggleSignUpPasswordVisibility() {
    this.showSignUpPassword.set(!this.showSignUpPassword());
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  private openPopup(message: string) {
    this.popupMessage.set(message);
  }
}
