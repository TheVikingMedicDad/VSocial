import { UserStore } from './user.store';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CsdUserStoreService {
  constructor(private csdUserStore: UserStore) {}

  updateLastModified(state) {
    this.csdUserStore.update(state);
  }
}
