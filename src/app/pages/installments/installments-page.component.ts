import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { UiCardComponent } from '../../shared/ui/card/ui-card.component';

@Component({
  selector: 'app-installments-page',
  standalone: true,
  imports: [NgFor, UiCardComponent],
  templateUrl: './installments-page.component.html',
  styleUrl: './installments-page.component.css'
})
export class InstallmentsPageComponent {
  readonly contracts = [
    { title: 'Notebook Dell', progress: '4/12', next: 'R$ 420,00' },
    { title: 'Viagem', progress: '2/6', next: 'R$ 310,00' },
    { title: 'Sofá', progress: '7/10', next: 'R$ 280,00' }
  ];
}
