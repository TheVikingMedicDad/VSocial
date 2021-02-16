import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { DraftListState, CsdDraftStore } from './csd-draft.store';

@Injectable({ providedIn: 'root' })
export class DraftQuery extends QueryEntity<DraftListState> {
  constructor(protected store: CsdDraftStore) {
    super(store);
  }
}
