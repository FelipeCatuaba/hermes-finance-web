import { Injectable } from '@angular/core';
import { ApiService } from '../http/api.service';
import { ShareCreateRequest } from '../models/share.model';

@Injectable({ providedIn: 'root' })
export class ShareFacade {
  constructor(private readonly api: ApiService) {}

  create(payload: ShareCreateRequest) {
    return this.api.createShareLink(payload);
  }

  list() {
    return this.api.getShareLinks();
  }

  revoke(id: string) {
    return this.api.revokeShareLink(id);
  }

  getPublicStatement(token: string) {
    return this.api.getPublicShareStatement(token);
  }
}
