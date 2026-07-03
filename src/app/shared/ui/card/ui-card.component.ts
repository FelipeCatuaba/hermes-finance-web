import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'ui-card',
  standalone: true,
  imports: [NgClass],
  template: `<article class="ui-card" [ngClass]="variant"><ng-content /></article>`,
  styles: [`
    .ui-card {
      border-radius: var(--radius-xl);
      padding: 24px;
      border: 1px solid var(--color-hairline);
      background: var(--color-canvas);
    }
    .dark {
      background: var(--color-surface-dark-elevated);
      border-color: transparent;
      color: var(--color-white);
    }
    .soft {
      background: var(--color-surface-soft);
    }
  `]
})
export class UiCardComponent {
  @Input() variant: 'default' | 'dark' | 'soft' = 'default';
}
