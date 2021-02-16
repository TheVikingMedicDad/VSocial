import { Injectable } from '@angular/core';
import { uuidv4 } from '../core/core.utils';
import { AuthUserMutationResponse, RegisterUserInput } from '../auth/auth.types';
import { registerUserMutation } from '../auth/csd-current-user.graphql';
import { CsdDataService } from '../core/services/csd-data.service';
import { CsdCurrentUserService } from '../auth/csd-current-user.service';
import { first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CsdComponentLibraryService {
  constructor(
    private csdDataService: CsdDataService,
    private csdCurrentUserService: CsdCurrentUserService
  ) {}

  public registerRandomUser$(language: string) {
    return this.registerWithoutDoingSomething$({
      email: `test${uuidv4()}@cnc.io`,
      password: uuidv4(),
      language,
    });
  }

  registerWithoutDoingSomething$(registerUserInput: RegisterUserInput) {
    return this.csdDataService
      .mutate$<AuthUserMutationResponse>(registerUserMutation, {
        input: registerUserInput,
      })
      .pipe(first());
  }

  requestPasswordReset$() {
    return this.csdCurrentUserService
      .requestPasswordReset$({
        email: 'test1@cnc.io',
      })
      .pipe(first());
  }
}
