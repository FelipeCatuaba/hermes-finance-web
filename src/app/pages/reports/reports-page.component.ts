import { Component } from '@angular/core';
import { UiCardComponent } from '../../shared/ui/card/ui-card.component';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [UiCardComponent],
  templateUrl: './reports-page.component.html',
  styleUrl: './reports-page.component.css'
})
export class ReportsPageComponent {}
