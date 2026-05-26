import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { UiCardComponent } from '../../shared/ui/card/ui-card.component';

@Component({
  selector: 'app-income-page',
  standalone: true,
  imports: [NgFor, UiCardComponent],
  templateUrl: './income-page.component.html',
  styleUrl: './income-page.component.css'
})
export class IncomePageComponent {
  readonly entries = [
    { name: 'Salário', date: '03/abr', tag: 'recorrente', amount: '+R$ 8.000,00' },
    { name: 'Freela - Sistema Web', date: '09/abr', tag: 'extra', amount: '+R$ 650,00' },
    { name: 'Reembolso', date: '14/abr', tag: 'pontual', amount: '+R$ 120,00' }
  ];
}
