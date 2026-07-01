import { Component } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe, NgFor } from '@angular/common';
import { UiCardComponent } from '../../shared/ui/card/ui-card.component';
import { ExpensesFacade } from '../../core/facades/expenses.facade';

@Component({
  selector: 'app-expenses-page',
  standalone: true,
  imports: [AsyncPipe, CurrencyPipe, DatePipe, NgFor, UiCardComponent],
  templateUrl: './expenses-page.component.html',
  styleUrl: './expenses-page.component.css'
})
export class ExpensesPageComponent {
  readonly createdExpenses$ = this.expensesFacade.createdExpenses$;
  readonly items = [
    { name: 'Aluguel', category: 'Moradia', amount: 'R$ 1.500,00' },
    { name: 'Supermercado', category: 'Alimentação', amount: 'R$ 487,20' },
    { name: 'Combustível', category: 'Transporte', amount: 'R$ 320,00' },
    { name: 'Farmácia', category: 'Saúde', amount: 'R$ 189,90' }
  ];

  constructor(private readonly expensesFacade: ExpensesFacade) {}
}
