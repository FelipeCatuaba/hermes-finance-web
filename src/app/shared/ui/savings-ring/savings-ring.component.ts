import { Component, Input } from '@angular/core';

@Component({
  selector: 'ui-savings-ring',
  standalone: true,
  template: `
    <div class="savings-ring" [style.--progress]="progress" [attr.aria-label]="ariaLabel" role="img">
      <div>
        <strong>{{ displayValue }}</strong>
        <span>{{ label }}</span>
      </div>
    </div>
  `,
  styles: [`
    .savings-ring {
      --progress: 0%;
      width: 116px;
      aspect-ratio: 1;
      display: grid;
      place-items: center;
      border-radius: 50%;
      background:
        radial-gradient(circle at center, var(--color-canvas) 58%, transparent 59%),
        conic-gradient(var(--color-accent-teal) var(--progress), var(--color-hairline-soft) 0);
    }

    div {
      display: grid;
      place-items: center;
      gap: 0.15rem;
      text-align: center;
    }

    strong {
      font-family: var(--font-mono);
      font-size: 1rem;
    }

    span {
      color: var(--color-muted);
      font-size: 0.68rem;
      font-weight: 800;
      text-transform: uppercase;
    }
  `]
})
export class SavingsRingComponent {
  @Input() value: number | null = null;
  @Input() label = 'economia';

  get progress(): string {
    const value = Math.max(0, Math.min(100, this.value ?? 0));
    return `${value}%`;
  }

  get displayValue(): string {
    return this.value === null ? '--' : `${Number(this.value).toFixed(1)}%`;
  }

  get ariaLabel(): string {
    return this.value === null ? 'Taxa de economia indisponivel' : `Taxa de economia ${this.displayValue}`;
  }
}
