import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { DraftList } from './csd-draft.model';

export interface DraftListState extends EntityState<DraftList> {}

export const csdDraftEntityId = 'csdDraftEntity';
@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'csdDraft' })
export class CsdDraftStore extends EntityStore<DraftListState> {
  constructor() {
    super();
    this.upsert(csdDraftEntityId, { drafts: [] });
  }
}
