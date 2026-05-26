import { Component } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsFacade } from '../../core/facades/settings.facade';
import { UiCardComponent } from '../../shared/ui/card/ui-card.component';
import { FamilyMembersFacade } from '../../core/facades/family-members.facade';
import { FamilyMember } from '../../core/models/family-member.model';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [AsyncPipe, NgFor, NgIf, FormsModule, UiCardComponent],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.css'
})
export class SettingsPageComponent {
  readonly snapshot$ = this.settingsFacade.getSettingsSnapshot();

  familyMembers: FamilyMember[] = [];
  familyLoading = false;
  familyError = '';

  showForm = false;
  editingId: string | null = null;
  memberForm = {
    name: '',
    relation: ''
  };

  constructor(
    private readonly settingsFacade: SettingsFacade,
    private readonly familyFacade: FamilyMembersFacade
  ) {
    this.loadFamilyMembers();
  }

  loadFamilyMembers() {
    this.familyLoading = true;
    this.familyError = '';

    this.familyFacade.list(true).subscribe({
      next: (items) => {
        this.familyMembers = items;
        this.familyLoading = false;
      },
      error: () => {
        this.familyLoading = false;
        this.familyError = 'Não foi possível carregar os membros da família.';
      }
    });
  }

  openCreateForm() {
    this.showForm = true;
    this.editingId = null;
    this.memberForm = { name: '', relation: '' };
  }

  openEditForm(member: FamilyMember) {
    this.showForm = true;
    this.editingId = member.id;
    this.memberForm = {
      name: member.name,
      relation: member.relation ?? ''
    };
  }

  cancelForm() {
    this.showForm = false;
    this.editingId = null;
  }

  saveMember() {
    const payload = {
      name: this.memberForm.name.trim(),
      relation: this.memberForm.relation.trim() || null
    };

    if (!payload.name) {
      this.familyError = 'Nome é obrigatório.';
      return;
    }

    const request$ = this.editingId
      ? this.familyFacade.update(this.editingId, payload)
      : this.familyFacade.create(payload);

    request$.subscribe({
      next: () => {
        this.cancelForm();
        this.loadFamilyMembers();
      },
      error: () => {
        this.familyError = 'Não foi possível salvar o membro.';
      }
    });
  }

  deactivateMember(member: FamilyMember) {
    if (!member.active) {
      return;
    }

    const shouldDeactivate = window.confirm(`Desativar ${member.name}?`);
    if (!shouldDeactivate) {
      return;
    }

    this.familyFacade.deactivate(member.id).subscribe({
      next: () => this.loadFamilyMembers(),
      error: () => {
        this.familyError = 'Não foi possível desativar o membro.';
      }
    });
  }

  getMemberColor(member: FamilyMember): string {
    const palette = ['#5B82FF', '#0FD4B0', '#FF8A3D', '#9B6CFF', '#3FB2FF', '#F768A1'];
    const key = `${member.name}|${member.relation ?? ''}`;
    let hash = 0;

    for (let i = 0; i < key.length; i += 1) {
      hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    }

    return palette[hash % palette.length];
  }
}
