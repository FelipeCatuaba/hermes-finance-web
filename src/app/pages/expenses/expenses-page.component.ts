import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { UiCardComponent } from '../../shared/ui/card/ui-card.component';

@Component({
  selector: 'app-expenses-page',
  standalone: true,
  imports: [NgFor, UiCardComponent],
  templateUrl: './expenses-page.component.html',
  styleUrl: './expenses-page.component.css'
})
export class ExpensesPageComponent {
  readonly items = [
    { name: 'Aluguel', category: 'Moradia', amount: 'R$ 1.500,00' },
    { name: 'Supermercado', category: 'Alimentação', amount: 'R$ 487,20' },
    { name: 'Combustível', category: 'Transporte', amount: 'R$ 320,00' },
    { name: 'Farmácia', category: 'Saúde', amount: 'R$ 189,90' }
  ];
}
