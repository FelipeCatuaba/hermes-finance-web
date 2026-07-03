import { CurrencyPipe, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ExpenseListItem } from '../../../core/models/expense.model';
import { BudgetStatusItem } from '../../../core/models/budget.model';
import { budgetPercentLabel, budgetProgressWidth, budgetUsageTone } from '../../../core/utils/budget-indicator.util';
import { MemberBadgeComponent } from '../member-badge/member-badge.component';

@Component({
  selector: 'ui-expense-item',
  standalone: true,
  imports: [CurrencyPipe, MemberBadgeComponent, NgIf],
  template: `
    <article class="expense-item" [class.family]="expense.scope === 'family'">
      <div class="expense-main">
        <span class="category-dot" aria-hidden="true">{{ expense.category?.icon || '#' }}</span>
        <div>
          <strong>{{ expense.description }}</strong>
          <p>
            {{ expense.category?.name || 'Sem categoria' }}
            <span class="separator">/</span>
            {{ expense.paymentMethod || 'Sem forma' }}
          </p>
          @if (budget; as item) {
            <div
              class="budget-inline"
              [class.ok]="budgetTone(item) === 'ok'"
              [class.warning]="budgetTone(item) === 'warning'"
              [class.danger]="budgetTone(item) === 'danger'"
            >
              <div class="budget-inline-head">
                <span>{{ budgetLabel(item) }}</span>
                <b *ngIf="item.overBudget">Acima do orcamento</b>
              </div>
              <div class="budget-meter" aria-hidden="true">
                <span [style.width]="budgetWidth(item)"></span>
              </div>
            </div>
          }
        </div>
      </div>

      <div class="expense-meta">
        <ui-member-badge [label]="expense.familyMember?.name || 'Meu'" [scope]="expense.scope" />
        <span class="installment-badge" *ngIf="expense.installmentNumber && expense.totalInstallments">
          {{ expense.installmentNumber }}/{{ expense.totalInstallments }}
        </span>
        <strong>{{ expense.amount | currency:'BRL':'symbol':'1.2-2' }}</strong>
        <div class="item-actions">
          <button type="button" (click)="edit.emit(expense)">Editar</button>
          <button type="button" (click)="remove.emit(expense)">Excluir esta</button>
          <button type="button" *ngIf="expense.installmentGroupId" (click)="removeGroup.emit(expense)">Excluir todas</button>
        </div>
      </div>
    </article>
  `,
  styles: [`
    .expense-item {
      display: flex;
      justify-content: space-between;
      gap: 0.8rem;
      border-bottom: 1px solid var(--color-hairline-soft);
      padding-bottom: 0.65rem;
      min-width: 0;
    }

    .expense-main {
      display: flex;
      gap: 0.65rem;
      align-items: flex-start;
      min-width: 0;
    }

    .expense-main strong {
      display: block;
      overflow-wrap: anywhere;
    }

    .expense-main p {
      margin: 0.2rem 0 0;
      font-size: 0.75rem;
      color: var(--color-muted);
      overflow-wrap: anywhere;
    }

    .separator {
      color: var(--color-hairline);
      padding: 0 0.25rem;
    }

    .category-dot {
      width: 32px;
      height: 32px;
      display: grid;
      place-items: center;
      flex: 0 0 auto;
      border: 1px solid var(--color-hairline-soft);
      border-radius: 50%;
      background: var(--color-surface-strong);
      font-size: 0.75rem;
      font-weight: 800;
    }

    .family .category-dot {
      color: var(--color-accent-amber);
    }

    .expense-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
      justify-content: flex-end;
      min-width: 170px;
    }

    .expense-meta strong {
      color: var(--color-semantic-down);
      font-family: var(--font-mono);
      white-space: nowrap;
    }

    .family .expense-meta strong {
      color: var(--color-accent-amber);
    }

    .installment-badge {
      border: 1px solid var(--color-hairline-soft);
      border-radius: var(--radius-pill);
      padding: 0.2rem 0.5rem;
      background: var(--color-surface-strong);
      color: var(--color-ink);
      font-size: 0.72rem;
      font-weight: 800;
      white-space: nowrap;
    }

    .item-actions {
      display: flex;
      gap: 0.4rem;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .item-actions button {
      border: 1px solid var(--color-hairline-soft);
      border-radius: var(--radius-pill);
      background: var(--color-surface-strong);
      color: var(--color-ink);
      cursor: pointer;
      font: inherit;
      font-size: 0.76rem;
      font-weight: 800;
      padding: 0.35rem 0.55rem;
    }

    .budget-inline {
      display: grid;
      gap: 0.28rem;
      width: min(220px, 100%);
      margin-top: 0.45rem;
      color: var(--color-muted);
    }

    .budget-inline.ok { color: var(--color-semantic-up); }
    .budget-inline.warning { color: var(--color-accent-amber); }
    .budget-inline.danger { color: var(--color-semantic-down); }

    .budget-inline-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.45rem;
      font-size: 0.68rem;
      font-weight: 800;
    }

    .budget-inline-head b {
      min-width: 0;
      border: 1px solid currentColor;
      border-radius: var(--radius-pill);
      padding: 0.12rem 0.38rem;
      overflow-wrap: anywhere;
    }

    .budget-meter {
      width: 100%;
      height: 7px;
      overflow: hidden;
      border-radius: var(--radius-pill);
      background: var(--color-hairline-soft);
    }

    .budget-meter span {
      display: block;
      height: 100%;
      border-radius: inherit;
      background: currentColor;
    }

    @media (max-width: 680px) {
      .expense-item {
        flex-direction: column;
      }

      .expense-meta,
      .item-actions {
        justify-content: flex-start;
        min-width: 0;
      }
    }
  `]
})
export class ExpenseItemComponent {
  @Input({ required: true }) expense!: ExpenseListItem;
  @Input() budget: BudgetStatusItem | null = null;
  @Output() edit = new EventEmitter<ExpenseListItem>();
  @Output() remove = new EventEmitter<ExpenseListItem>();
  @Output() removeGroup = new EventEmitter<ExpenseListItem>();

  budgetTone(item: BudgetStatusItem): string {
    return budgetUsageTone(item.pctUsed);
  }

  budgetWidth(item: BudgetStatusItem): string {
    return budgetProgressWidth(item.pctUsed);
  }

  budgetLabel(item: BudgetStatusItem): string {
    return budgetPercentLabel(item.pctUsed);
  }
}
