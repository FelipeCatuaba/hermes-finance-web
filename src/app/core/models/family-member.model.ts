export interface FamilyMember {
  id: string;
  name: string;
  relation: string | null;
  active: boolean;
  createdAt: string;
}

export interface FamilyMemberUpsertRequest {
  name: string;
  relation?: string | null;
}
