import { Injectable } from '@angular/core';
import { ApiService } from '../http/api.service';
import { FamilyMemberUpsertRequest } from '../models/family-member.model';

@Injectable({ providedIn: 'root' })
export class FamilyMembersFacade {
  constructor(private readonly api: ApiService) {}

  list(includeInactive = false) {
    return this.api.getFamilyMembers(includeInactive);
  }

  create(payload: FamilyMemberUpsertRequest) {
    return this.api.createFamilyMember(payload);
  }

  update(id: string, payload: FamilyMemberUpsertRequest) {
    return this.api.updateFamilyMember(id, payload);
  }

  deactivate(id: string) {
    return this.api.deactivateFamilyMember(id);
  }
}
