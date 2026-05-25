import { AfterViewInit, Component, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgClass } from '@angular/common';
import { UiButtonComponent } from '../../shared/ui/button/ui-button.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, NgFor, NgClass, UiButtonComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent implements AfterViewInit, OnDestroy {
  readonly navScrolled = signal(false);

  readonly featureCards = [
    { iconClass: 'bi bi-calendar3', title: 'Navegação por mês', body: 'Navegue entre meses com contexto completo para receitas, gastos e metas.', tag: 'MonthSelector' },
    { iconClass: 'bi bi-cash-stack', title: 'Receitas e saldo real', body: 'Registre salário, freelas e entradas avulsas com cálculo automático de saldo.', tag: 'Receitas' },
    { iconClass: 'bi bi-bar-chart-line', title: 'Categorias de gasto', body: 'Classifique despesas para enxergar para onde o dinheiro vai de verdade.', tag: 'Categorias' },
    { iconClass: 'bi bi-people', title: 'Família isolada', body: 'Separe gastos da família sem contaminar seus indicadores pessoais.', tag: 'Família' },
    { iconClass: 'bi bi-arrow-repeat', title: 'Parcelamentos', body: 'Distribuição automática das parcelas nos meses corretos do ano.', tag: 'Automático' },
    { iconClass: 'bi bi-link-45deg', title: 'Extrato por link', body: 'Compartilhe extratos temporários por familiar sem expor sua conta.', tag: '7 dias sem login' }
  ];

  readonly steps = [
    'Crie sua conta e configure membros da família.',
    'Lance receitas do mês.',
    'Registre gastos avulsos, recorrentes e parcelados.',
    'Acompanhe saldo, poupança e categorias em tempo real.'
  ];

  private observer?: IntersectionObserver;
  private readonly onScrollRef = () => this.onScroll();

  ngAfterViewInit(): void {
    const revealItems = Array.from(document.querySelectorAll('.reveal'));
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            this.observer?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealItems.forEach((item) => this.observer?.observe(item));
    window.addEventListener('scroll', this.onScrollRef, { passive: true });
    this.onScroll();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    window.removeEventListener('scroll', this.onScrollRef);
  }

  private onScroll(): void {
    this.navScrolled.set(window.scrollY > 20);
  }
}

