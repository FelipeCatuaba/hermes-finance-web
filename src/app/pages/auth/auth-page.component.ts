import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthSessionService } from '../../core/auth/auth-session.service';
import { environment } from '../../../environments/environment';
import { UiButtonComponent } from '../../shared/ui/button/ui-button.component';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [RouterLink, UiButtonComponent],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.css'
})
export class AuthPageComponent implements AfterViewInit, OnDestroy {
  @ViewChild('authContainer', { static: true }) authContainer!: ElementRef<HTMLDivElement>;

  readonly mode = signal<'sign-in' | 'sign-up'>('sign-in');
  readonly hasClerkKey = computed(() => Boolean(environment.clerkPublishableKey));

  constructor(
    private readonly route: ActivatedRoute,
    private readonly auth: AuthSessionService
  ) {
    this.route.queryParamMap.subscribe((params) => {
      this.mode.set(params.get('mode') === 'sign-up' ? 'sign-up' : 'sign-in');
      void this.renderWidget();
    });
  }

  async ngAfterViewInit(): Promise<void> {
    await this.renderWidget();
  }

  async renderWidget(): Promise<void> {
    if (!this.authContainer) {
      return;
    }

    this.auth.unmountAuthWidget(this.authContainer.nativeElement);

    if (!this.hasClerkKey()) {
      return;
    }

    if (this.mode() === 'sign-up') {
      await this.auth.mountSignUp(this.authContainer.nativeElement);
      return;
    }

    await this.auth.mountSignIn(this.authContainer.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.authContainer) {
      this.auth.unmountAuthWidget(this.authContainer.nativeElement);
    }
  }
}