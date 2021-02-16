import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { UserStore, UserStoreState } from './user.store';

@Injectable({ providedIn: 'root' })
export class UserQuery extends Query<UserStoreState> {
  // TODO: create a ModelLastChangeState
  getLatest$ = this.select('lastModified');
  getLatestInvitation$ = this.select('invitationSystemModified');
  getLatestTodos$ = this.select('todoSystemModified');

  constructor(protected store: UserStore) {
    super(store);
  }
}
