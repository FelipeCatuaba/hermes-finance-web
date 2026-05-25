import { Component } from '@angular/core';
import { AsyncPipe, NgFor } from '@angular/common';
import { SettingsFacade } from '../../core/facades/settings.facade';
import { UiCardComponent } from '../../shared/ui/card/ui-card.component';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [AsyncPipe, NgFor, UiCardComponent],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.css'
})
export class SettingsPageComponent {
  readonly snapshot$ = this.settingsFacade.getSettingsSnapshot();

  constructor(private readonly settingsFacade: SettingsFacade) {}
}