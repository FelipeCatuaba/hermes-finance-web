import { CurrencyPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ShareFacade } from '../../core/facades/share.facade';
import { PublicShareStatement } from '../../core/models/share.model';

@Component({
  selector: 'app-public-share-page',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, NgFor, NgIf, RouterLink],
  templateUrl: './public-share-page.component.html',
  styleUrl: './public-share-page.component.css'
})
export class PublicSharePageComponent implements OnInit {
  statement: PublicShareStatement | null = null;
  loading = true;
  error = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly shareFacade: ShareFacade
  ) {}

  ngOnInit() {
    const token = this.route.snapshot.paramMap.get('token');
    if (!token) {
      this.loading = false;
      this.error = 'Link inválido ou expirado.';
      return;
    }

    this.shareFacade.getPublicStatement(token).subscribe({
      next: (statement) => {
        this.statement = statement;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Link inválido, expirado ou revogado.';
      }
    });
  }

  periodLabel(statement: PublicShareStatement): string {
    const date = new Date(statement.year, statement.month - 1, 1);
    return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
  }
}
