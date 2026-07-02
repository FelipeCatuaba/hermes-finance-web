import { Component } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AsyncPipe, CurrencyPipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { SettingsFacade } from '../../core/facades/settings.facade';
import { UiCardComponent } from '../../shared/ui/card/ui-card.component';
import { FamilyMembersFacade } from '../../core/facades/family-members.facade';
import { FamilyMember } from '../../core/models/family-member.model';
import { CategoriesFacade } from '../../core/facades/categories.facade';
import { ExpenseCategory } from '../../core/models/expense-category.model';
import { BudgetsFacade } from '../../core/facades/budgets.facade';
import { BudgetStatusItem, BudgetUpsertRequest } from '../../core/models/budget.model';
import { MonthService } from '../../core/services/month.service';
import { budgetProgressWidth, budgetUsageTone } from '../../core/utils/budget-indicator.util';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [AsyncPipe, CurrencyPipe, DecimalPipe, NgFor, NgIf, FormsModule, UiCardComponent],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.css'
})
export class SettingsPageComponent {
  readonly snapshot$ = this.settingsFacade.getSettingsSnapshot();

  familyMembers: FamilyMember[] = [];
  familyLoading = false;
  familyError = '';
  categories: ExpenseCategory[] = [];
  categoriesLoading = false;
  categoriesError = '';
  budgetRows: BudgetStatusItem[] = [];
  budgetDrafts: Record<string, string> = {};
  budgetLoading = false;
  budgetError = '';

  showForm = false;
  editingId: string | null = null;
  memberForm = {
    name: '',
    relation: ''
  };

  showCategoryForm = false;
  editingCategoryId: string | null = null;
  categoryForm = {
    name: '',
    icon: 'shapes',
    colorHex: '#64748B'
  };

  constructor(
    private readonly settingsFacade: SettingsFacade,
    private readonly familyFacade: FamilyMembersFacade,
    private readonly categoriesFacade: CategoriesFacade,
    private readonly budgetsFacade: BudgetsFacade,
    readonly monthService: MonthService
  ) {
    this.loadFamilyMembers();
    this.loadCategories();
    this.monthService.period$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.loadBudgets());
  }

  loadFamilyMembers() {
    this.familyLoading = true;
    this.familyError = '';

    this.familyFacade.list(true).subscribe({
      next: (items) => {
        this.familyMembers = items;
        this.familyLoading = false;
      },
      error: () => {
        this.familyLoading = false;
        this.familyError = 'Não foi possível carregar os membros da família.';
      }
    });
  }

  openCreateForm() {
    this.showForm = true;
    this.editingId = null;
    this.memberForm = { name: '', relation: '' };
  }

  openEditForm(member: FamilyMember) {
    this.showForm = true;
    this.editingId = member.id;
    this.memberForm = {
      name: member.name,
      relation: member.relation ?? ''
    };
  }

  cancelForm() {
    this.showForm = false;
    this.editingId = null;
  }

  saveMember() {
    const payload = {
      name: this.memberForm.name.trim(),
      relation: this.memberForm.relation.trim() || null
    };

    if (!payload.name) {
      this.familyError = 'Nome é obrigatório.';
      return;
    }

    const request$ = this.editingId
      ? this.familyFacade.update(this.editingId, payload)
      : this.familyFacade.create(payload);

    request$.subscribe({
      next: () => {
        this.cancelForm();
        this.loadFamilyMembers();
      },
      error: () => {
        this.familyError = 'Não foi possível salvar o membro.';
      }
    });
  }

  deactivateMember(member: FamilyMember) {
    if (!member.active) {
      return;
    }

    const shouldDeactivate = window.confirm(`Desativar ${member.name}?`);
    if (!shouldDeactivate) {
      return;
    }

    this.familyFacade.deactivate(member.id).subscribe({
      next: () => this.loadFamilyMembers(),
      error: () => {
        this.familyError = 'Não foi possível desativar o membro.';
      }
    });
  }

  loadCategories() {
    this.categoriesLoading = true;
    this.categoriesError = '';

    this.categoriesFacade.list(true).subscribe({
      next: (items) => {
        this.categories = items;
        this.categoriesLoading = false;
      },
      error: () => {
        this.categoriesLoading = false;
        this.categoriesError = 'Não foi possível carregar as categorias.';
      }
    });
  }

  openCreateCategoryForm() {
    this.showCategoryForm = true;
    this.editingCategoryId = null;
    this.categoryForm = { name: '', icon: 'shapes', colorHex: '#64748B' };
  }

  openEditCategoryForm(category: ExpenseCategory) {
    if (category.isDefault) {
      return;
    }

    this.showCategoryForm = true;
    this.editingCategoryId = category.id;
    this.categoryForm = {
      name: category.name,
      icon: category.icon || 'shapes',
      colorHex: category.colorHex || '#64748B'
    };
  }

  cancelCategoryForm() {
    this.showCategoryForm = false;
    this.editingCategoryId = null;
  }

  saveCategory() {
    const payload = {
      name: this.categoryForm.name.trim(),
      icon: this.categoryForm.icon.trim() || 'shapes',
      colorHex: this.categoryForm.colorHex
    };

    if (!payload.name) {
      this.categoriesError = 'Nome da categoria é obrigatório.';
      return;
    }

    const request$ = this.editingCategoryId
      ? this.categoriesFacade.update(this.editingCategoryId, payload)
      : this.categoriesFacade.create(payload);

    request$.subscribe({
      next: () => {
        this.cancelCategoryForm();
        this.loadCategories();
      },
      error: () => {
        this.categoriesError = 'Não foi possível salvar a categoria.';
      }
    });
  }

  deleteCategory(category: ExpenseCategory) {
    if (category.isDefault) {
      this.categoriesError = 'Categorias do sistema não podem ser removidas.';
      return;
    }

    const shouldDelete = window.confirm(`Remover categoria "${category.name}"?`);
    if (!shouldDelete) {
      return;
    }

    this.categoriesFacade.delete(category.id).subscribe({
      next: () => this.loadCategories(),
      error: (error: HttpErrorResponse) => {
        if (error.status === 409) {
          this.categoriesError = 'Categoria em uso: ela foi desativada e não pode ser removida.';
          this.loadCategories();
          return;
        }
        if (error.status === 403) {
          this.categoriesError = 'Sem permissão para remover esta categoria.';
          return;
        }
        this.categoriesError = 'Não foi possível remover a categoria.';
      }
    });
  }

  loadBudgets() {
    const { month, year } = this.monthService.period();
    this.budgetLoading = true;
    this.budgetError = '';

    this.budgetsFacade.status(month, year).subscribe({
      next: (response) => {
        this.budgetRows = response.items;
        this.budgetDrafts = response.items.reduce<Record<string, string>>((drafts, item) => {
          drafts[item.category.id] = item.amountLimit === null ? '' : String(item.amountLimit);
          return drafts;
        }, {});
        this.budgetLoading = false;
      },
      error: () => {
        this.budgetLoading = false;
        this.budgetError = 'Não foi possível carregar os orçamentos.';
      }
    });
  }

  saveBudget(row: BudgetStatusItem) {
    const amountLimit = this.parseBudgetDraft(row);
    if (amountLimit === null) {
      return;
    }

    const { month, year } = this.monthService.period();
    const payload: BudgetUpsertRequest = {
      categoryId: row.category.id,
      month,
      year,
      amountLimit
    };

    const request$ = row.budgetId
      ? this.budgetsFacade.update(row.budgetId, payload)
      : this.budgetsFacade.create(payload);

    request$.subscribe({
      next: () => this.loadBudgets(),
      error: () => {
        this.budgetError = 'Não foi possível salvar o orçamento.';
      }
    });
  }

  clearBudget(row: BudgetStatusItem) {
    this.budgetDrafts[row.category.id] = '';
    if (!row.budgetId) {
      return;
    }

    this.budgetsFacade.delete(row.budgetId).subscribe({
      next: () => this.loadBudgets(),
      error: () => {
        this.budgetError = 'Não foi possível remover o orçamento.';
      }
    });
  }

  copyPreviousBudgets() {
    const { month, year } = this.monthService.period();
    this.budgetLoading = true;
    this.budgetError = '';

    this.budgetsFacade.copyPrevious(month, year).subscribe({
      next: () => this.loadBudgets(),
      error: () => {
        this.budgetLoading = false;
        this.budgetError = 'Não foi possível copiar o mês anterior.';
      }
    });
  }

  budgetUsageClass(row: BudgetStatusItem): string {
    return budgetUsageTone(row.pctUsed);
  }

  budgetProgressWidth(row: BudgetStatusItem): string {
    return budgetProgressWidth(row.pctUsed);
  }

  private parseBudgetDraft(row: BudgetStatusItem): number | null {
    const rawValue = (this.budgetDrafts[row.category.id] ?? '').trim().replace(',', '.');
    const amountLimit = Number(rawValue);

    if (!rawValue || Number.isNaN(amountLimit) || amountLimit <= 0) {
      this.budgetError = 'Informe um limite maior que zero.';
      return null;
    }

    this.budgetError = '';
    return amountLimit;
  }

  getCategoryIcon(icon: string | null): string {
    const map: Record<string, string> = {
      utensils: '🍽️',
      home: '🏠',
      car: '🚗',
      'heart-pulse': '❤️',
      'party-popper': '🎉',
      shapes: '🔷',
      bag: '👜',
      cart: '🛒',
      school: '🎓'
    };
    return map[icon ?? ''] || '🏷️';
  }

  getMemberColor(member: FamilyMember): string {
    const palette = ['#5B82FF', '#0FD4B0', '#FF8A3D', '#9B6CFF', '#3FB2FF', '#F768A1'];
    const key = `${member.name}|${member.relation ?? ''}`;
    let hash = 0;

    for (let i = 0; i < key.length; i += 1) {
      hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    }

    return palette[hash % palette.length];
  }
}
