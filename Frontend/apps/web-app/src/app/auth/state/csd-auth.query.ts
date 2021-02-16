import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { CsdAuthState, CsdAuthStore } from './csd-auth.store';

@Injectable({ providedIn: 'root' })
export class CsdAuthQuery extends QueryEntity<CsdAuthState> {
  getUser$ = this.select('user');

  constructor(protected store: CsdAuthStore) {
    super(store);
  }
}
