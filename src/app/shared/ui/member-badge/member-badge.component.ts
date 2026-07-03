import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'ui-member-badge',
  standalone: true,
  imports: [NgClass],
  template: `
    <span class="member-badge" [ngClass]="scope" [attr.aria-label]="ariaLabel">
      <span class="dot" aria-hidden="true"></span>
      {{ label }}
    </span>
  `,
  styles: [`
    .member-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      width: fit-content;
      max-width: 100%;
      border: 1px solid var(--color-hairline-soft);
      border-radius: var(--radius-pill);
      padding: 0.22rem 0.5rem;
      background: var(--color-surface-strong);
      color: var(--color-ink);
      font-size: 0.72rem;
      font-weight: 800;
      white-space: nowrap;
    }

    .dot {
      width: 0.44rem;
      height: 0.44rem;
      border-radius: 50%;
      background: currentColor;
    }

    .owner {
      color: var(--color-primary);
    }

    .family {
      color: var(--color-accent-amber);
    }
  `]
})
export class MemberBadgeComponent {
  @Input() label = 'Meu';
  @Input() scope: 'owner' | 'family' = 'owner';

  get ariaLabel(): string {
    return this.scope === 'family' ? `Gasto familiar de ${this.label}` : 'Gasto proprio';
  }
}
