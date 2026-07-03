import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FamilyMember } from '../../../core/models/family-member.model';

@Component({
  selector: 'ui-scope-toggle',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf],
  template: `
    <fieldset class="scope-toggle">
      <legend>{{ label }}</legend>
      <div class="segments" role="group" aria-label="Escopo do gasto">
        <button
          type="button"
          [class.active]="!familyMemberId"
          (click)="selectOwner()"
          aria-label="Gasto proprio"
        >
          Meu
        </button>
        <button
          type="button"
          [class.active]="!!familyMemberId"
          (click)="selectFamily()"
          aria-label="Gasto familiar"
        >
          Familia
        </button>
      </div>

      <label class="member-select" *ngIf="familyMemberId || showEmptyFamilySelect">
        <span>Membro</span>
        <select [ngModel]="familyMemberId" (ngModelChange)="changeMember($event)" name="scopeFamilyMemberId">
          <option value="" disabled>Selecione um membro</option>
          <option *ngFor="let member of familyMembers" [value]="member.id">{{ member.name }}</option>
        </select>
      </label>
    </fieldset>
  `,
  styles: [`
    .scope-toggle {
      min-width: 0;
      display: grid;
      gap: 0.55rem;
      border: 0;
      padding: 0;
      margin: 0;
    }

    legend,
    .member-select span {
      color: var(--color-body);
      font-size: 0.85rem;
      font-weight: 800;
    }

    .segments {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.35rem;
      border: 1px solid var(--color-hairline-soft);
      border-radius: var(--radius-sm);
      padding: 0.25rem;
      background: var(--color-surface-strong);
    }

    button {
      min-height: 40px;
      border: 0;
      border-radius: 6px;
      background: transparent;
      color: var(--color-body);
      cursor: pointer;
      font: inherit;
      font-weight: 800;
    }

    button.active {
      background: var(--color-canvas);
      color: var(--color-ink);
      box-shadow: 0 0 0 1px var(--color-hairline-soft);
    }

    button.active + button,
    button.active {
      color: var(--color-primary);
    }

    button:nth-child(2).active {
      color: var(--color-accent-amber);
    }

    .member-select {
      display: grid;
      gap: 0.4rem;
    }

    select {
      width: 100%;
      border: 1px solid var(--color-hairline);
      border-radius: var(--radius-sm);
      padding: 0.75rem 0.8rem;
      background: var(--color-surface-strong);
      color: var(--color-ink);
      font: inherit;
      font-weight: 600;
    }
  `]
})
export class ScopeToggleComponent {
  @Input() label = 'Escopo';
  @Input() familyMemberId = '';
  @Input() familyMembers: FamilyMember[] = [];
  @Output() familyMemberIdChange = new EventEmitter<string>();

  showEmptyFamilySelect = false;

  selectOwner(): void {
    this.showEmptyFamilySelect = false;
    this.familyMemberIdChange.emit('');
  }

  selectFamily(): void {
    this.showEmptyFamilySelect = true;
    this.familyMemberIdChange.emit(this.familyMemberId || this.familyMembers[0]?.id || '');
  }

  changeMember(memberId: string): void {
    this.familyMemberIdChange.emit(memberId);
  }
}
