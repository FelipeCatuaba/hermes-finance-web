import { Injectable } from '@angular/core';
import { ApiService } from '../http/api.service';
import { ExpenseCategoryUpsertRequest } from '../models/expense-category.model';

@Injectable({ providedIn: 'root' })
export class CategoriesFacade {
  constructor(private readonly api: ApiService) {}

  list(includeInactive = false) {
    return this.api.getCategories(includeInactive);
  }

  create(payload: ExpenseCategoryUpsertRequest) {
    return this.api.createCategory(payload);
  }

  update(id: string, payload: ExpenseCategoryUpsertRequest) {
    return this.api.updateCategory(id, payload);
  }

  delete(id: string) {
    return this.api.deleteCategory(id);
  }
}
