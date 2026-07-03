import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [NgClass],
  template: `
    <button [type]="type" [disabled]="disabled" [ngClass]="buttonClass" class="ui-button">
      <ng-content />
    </button>
  `,
  styles: [`
    .ui-button {
      border: none;
      border-radius: var(--radius-pill);
      padding: 12px 20px;
      font-family: var(--font-body);
      font-size: 16px;
      font-weight: 600;
      line-height: 1.15;
      cursor: pointer;
      transition: background-color 160ms ease, transform 160ms ease;
    }
    .ui-button:hover { transform: translateY(-1px); }
    .primary { background: var(--color-primary); color: var(--color-white); }
    .primary:hover { background: var(--color-primary-active); }
    .secondary { background: var(--color-surface-strong); color: var(--color-ink); }
    .dark { background: var(--color-surface-dark-elevated); color: var(--color-white); }
    .ui-button:disabled {
      opacity: 0.55;
      cursor: not-allowed;
      transform: none;
    }
  `]
})
export class UiButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'dark' = 'primary';
  @Input() type: 'button' | 'submit' = 'button';
  @Input() disabled = false;

  get buttonClass() {
    return this.variant;
  }
}
