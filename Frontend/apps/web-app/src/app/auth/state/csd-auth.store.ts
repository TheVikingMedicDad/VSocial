import { Injectable } from '@angular/core';
import { EntityStore, StoreConfig } from '@datorama/akita';
import { User } from '../auth.types';

export interface CsdAuthState {
  user: User;
}

export function createInitialState(): CsdAuthState {
  return {
    user: null,
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'csdAuthStore' })
export class CsdAuthStore extends EntityStore<CsdAuthState> {
  constructor() {
    super(createInitialState());
  }
}
