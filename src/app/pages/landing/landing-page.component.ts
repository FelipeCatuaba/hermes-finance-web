import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor } from '@angular/common';
import { UiSectionShellComponent } from '../../shared/ui/section-shell/ui-section-shell.component';
import { UiButtonComponent } from '../../shared/ui/button/ui-button.component';
import { UiCardComponent } from '../../shared/ui/card/ui-card.component';
import { UiBadgeComponent } from '../../shared/ui/badge/ui-badge.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, NgFor, UiSectionShellComponent, UiButtonComponent, UiCardComponent, UiBadgeComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {
  readonly featureCards = [
    {
      title: 'Dashboard mensal inteligente',
      body: 'Acompanhe saldo, receitas e despesas com visão instantânea por mês e por família.'
    },
    {
      title: 'Compartilhamento familiar seguro',
      body: 'Convide membros e mantenha transparência financeira sem abrir mão de privacidade.'
    },
    {
      title: 'Arquitetura pronta para escalar',
      body: 'Frontend Angular, autenticação moderna e backend com segurança por JWT.'
    }
  ];

  readonly timeline = [
    'Conecte sua conta e configure categorias principais.',
    'Registre receitas, gastos e metas recorrentes.',
    'Receba visão consolidada para decisões melhores.'
  ];
}