import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SettingsSnapshot } from '../models/settings.model';

@Injectable({ providedIn: 'root' })
export class SettingsFacade {
  getSettingsSnapshot(): Observable<SettingsSnapshot> {
    return of({
      familyMembers: ['Felipe (Owner)', 'Amanda (Member)'],
      categories: ['Moradia', 'Alimentação', 'Transporte', 'Educação', 'Lazer'],
      monthlyBudget: 'R$ 6.000,00',
      securityLabel: 'Autenticação interna com JWT'
    });
  }
}
