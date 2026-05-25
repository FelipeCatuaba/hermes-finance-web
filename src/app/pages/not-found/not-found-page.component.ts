import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiButtonComponent } from '../../shared/ui/button/ui-button.component';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, UiButtonComponent],
  template: `
    <section class="not-found">
      <h1>404</h1>
      <p>Página não encontrada.</p>
      <ui-button routerLink="/">Voltar para início</ui-button>
    </section>
  `,
  styles: [`
    .not-found {
      min-height: 70vh;
      display: grid;
      place-content: center;
      gap: 12px;
      text-align: center;
    }
    h1 {
      margin: 0;
      font-family: var(--font-display);
      font-size: 5rem;
    }
    p {
      margin: 0;
      color: var(--color-body);
    }
  `]
})
export class NotFoundPageComponent {}