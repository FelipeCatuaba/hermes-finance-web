import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HealthStatus } from '../models/dashboard.model';
import { FamilyMember, FamilyMemberUpsertRequest } from '../models/family-member.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  constructor(private readonly http: HttpClient) {}

  getHealth(): Observable<HealthStatus> {
    return this.http.get<HealthStatus>(`${this.baseUrl}/api/health`);
  }

  getFamilyMembers(includeInactive = false): Observable<FamilyMember[]> {
    return this.http.get<FamilyMember[]>(`${this.baseUrl}/api/family-members`, {
      params: { includeInactive }
    });
  }

  createFamilyMember(payload: FamilyMemberUpsertRequest): Observable<FamilyMember> {
    return this.http.post<FamilyMember>(`${this.baseUrl}/api/family-members`, payload);
  }

  updateFamilyMember(id: string, payload: FamilyMemberUpsertRequest): Observable<FamilyMember> {
    return this.http.put<FamilyMember>(`${this.baseUrl}/api/family-members/${id}`, payload);
  }

  deactivateFamilyMember(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/family-members/${id}`);
  }
}
