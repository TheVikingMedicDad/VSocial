import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';

export interface UserStoreState {
  lastModified: number;
  invitationSystemModified: number;
  todoSystemModified: number;
}

function getDefaultDate() {
  return new Date(0).getTime();
}
export function createInitialState(): UserStoreState {
  return {
    lastModified: getDefaultDate(),
    invitationSystemModified: getDefaultDate(),
    todoSystemModified: getDefaultDate(),
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'userStore' })
export class UserStore extends Store<UserStoreState> {
  constructor() {
    super(createInitialState());
  }
}
