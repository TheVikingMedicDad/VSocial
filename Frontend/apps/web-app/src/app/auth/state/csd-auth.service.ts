import { CsdAuthStore } from './csd-auth.store';
import { Injectable } from '@angular/core';
import { CsdAuthQuery } from './csd-auth.query';
import { User } from '../auth.types';

@Injectable({
  providedIn: 'root',
})
export class CsdAuthService {
  constructor(private csdAuthStore: CsdAuthStore, private csdQueryStore: CsdAuthQuery) {}

  updateUser(userObject: User) {
    this.csdAuthStore.update({ user: userObject });
  }

  getUser$() {
    return this.csdQueryStore.getUser$;
  }

  getUser() {
    return this.csdQueryStore.getValue().user;
  }
}
