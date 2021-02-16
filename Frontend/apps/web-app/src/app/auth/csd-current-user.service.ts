import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import {
  AuthCheckInput,
  AuthMethod,
  ChangePasswordInput,
  ConfirmAccountInfo,
  LoginUserInput,
  ConfirmEmailInput,
  RequestPasswordResetInput,
  ResetPasswordInput,
  RegisterUserInput,
  RequestEmailChangeInput,
  User,
  UserUpdateMeInput,
  AuthUserMutationResponse,
  MeMutationResponse,
} from './auth.types';
import { BehaviorSubject, Observable, throwError, combineLatest, of, from } from 'rxjs';
import { catchError, filter, map, switchMap, tap } from 'rxjs/operators';
import { I18NEXT_SERVICE, ITranslationService } from 'angular-i18next';
import { CsdDataService } from '../core/services/csd-data.service';
import {
  authCheckMutation,
  changePasswordMutation,
  confirmUserMutation,
  currentUserConfirmEmailMutation,
  currentUserEmailChangeRequestMutation,
  deleteMeMutation,
  loginUserMutation,
  logoutUserMutation,
  meQuery,
  registerUserMutation,
  requestPasswordResetMutation,
  resendAccountConfirmationEmailMutation,
  resetPasswordMutation,
  updateMeMutation,
} from './csd-current-user.graphql';
import { isPlatformBrowser } from '@angular/common';
import { CsdSnackbarService } from '../features/csd-snackbar/csd-snackbar.service';
import { CsdBiService } from '../features/csd-bi/csd-bi.service';
import { BiEvent } from '../features/csd-bi/csd-bi.types';
import { DocumentNode } from '@apollo/client';
import { CsdAuthService } from './state/csd-auth.service';
import { CsdUnauthorizedError } from '../shared/errors';
import { BaseGqlInput } from '../core/core.types';

@Injectable({
  providedIn: 'root',
})
export class CsdCurrentUserService {
  authenticationToken$: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  constructor(
    @Inject(I18NEXT_SERVICE) private i18NextService: ITranslationService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private csdDataService: CsdDataService,
    private csdSnackbarService: CsdSnackbarService,
    private csdBiService: CsdBiService,
    private csdAuthService: CsdAuthService
  ) {
    // set the auth Token (only at client)
    if (isPlatformBrowser(this.platformId)) {
      this.authenticationToken$.next(localStorage.getItem('authtoken'));
    } else {
      this.authenticationToken$.next(null);
    }

    this.changedUserLanguageListener();
  }

  /**
   * Create a subscription to a changing userObjLang/i18nLang
   *
   * The page will be reloaded if the current Browser language and the user's language suddenly differs
   */
  private changedUserLanguageListener() {
    combineLatest(this.csdAuthService.getUser$(), this.i18NextService.events.initialized)
      .pipe(
        filter(([user, i18NEvent]: [User, any]) => user && i18NEvent),
        filter(([user, _i18NEvent]: [User, any]) => user.language !== this.i18NextService.language),
        switchMap(([user, _i18NEvent]) => from(this.i18NextService.changeLanguage(user.language))),
        tap(() => {
          console.log(
            'CsdCurrentUserService.changedUserLanguageListener: Document reloaded because of changed user language'
          );
          document.location.reload();
        })
      )
      .subscribe();
  }

  hasAuthenticationToken() {
    return !!this.authenticationToken$.getValue();
  }

  getAuthenticationToken() {
    return this.authenticationToken$.getValue();
  }

  getAuthenticationToken$() {
    return this.authenticationToken$.asObservable();
  }

  setAuthenticationToken(token: string) {
    this.authenticationToken$.next(token);
    if (!token) {
      localStorage.removeItem('authtoken');
    } else {
      localStorage.setItem('authtoken', token);
    }
  }

  getUser$(): Observable<User> {
    return this.csdAuthService.getUser$();
  }

  loadUser$(): Observable<User> {
    return this.csdDataService
      .typedQuery<User, any>(meQuery, {}, ['data', 'me'])
      .pipe(
        tap({
          next: (user) => {
            this.csdAuthService.updateUser(user);
          },
          error: (error) => {
            if (error instanceof CsdUnauthorizedError) {
              this.setAuthenticationToken(null);
            }
          },
        })
      );
  }

  /**
   * This method returns an Observable that returns false if the user is not loaded and there is no token available
   * If there is a token the returning Observable loads the user and returns true afterwards
   */
  ifAuthenticatedLoadUser$(): Observable<boolean> {
    if (this.isUserLoaded()) {
      console.log(' > CsdCurrentUserService: user is loaded');
      return of(true);
    }
    if (this.hasAuthenticationToken()) {
      console.log(
        'CsdCurrentUserService.ifAuthenticatedLoadUser$: user is not loaded. has token. user is being loaded.'
      );
      return this.loadUser$().pipe(
        map((userOrFalse: any) => {
          return !!userOrFalse;
        })
      );
    }
    // no user and no token available
    return of(false);
  }

  isUserLoaded() {
    return !!this.csdAuthService.getUser();
  }

  logMutationResult(
    mutation: DocumentNode,
    variables: {},
    successMessage: string,
    errorMessage: string
  ) {
    return this.csdDataService.mutate$(mutation, { input: variables });
  }

  login$(loginUserInput: LoginUserInput): Observable<any> {
    return this.csdDataService
      .mutate$<AuthUserMutationResponse>(loginUserMutation, { input: loginUserInput })
      .pipe(
        tap((result) => {
          this.csdBiService.logEvent(BiEvent.LOGIN);
          return this.setAuthenticationToken(result.token);
        })
      );
  }

  logout$(): Observable<any> {
    return this.csdDataService.mutate$(logoutUserMutation, { input: {} }).pipe(
      tap(() => {
        this.csdBiService.logEvent(BiEvent.LOGOUT);
        this.setAuthenticationToken(null);
        document.location.reload();
      })
    );
  }

  confirmEmail$(confirmEmailInput: ConfirmEmailInput) {
    return this.logMutationResult(
      currentUserConfirmEmailMutation,
      confirmEmailInput,
      'confirmEmailSuccess',
      'confirmEmailFailure'
    );
  }

  requestEmailChange$(requestEmailChangeInput: RequestEmailChangeInput) {
    return this.logMutationResult(
      currentUserEmailChangeRequestMutation,
      requestEmailChangeInput,
      'sendEmailRequestSuccess',
      'sendEmailRequestFailure'
    );
  }

  resendAccountConfirmationEmail$(baseInput: BaseGqlInput) {
    return this.logMutationResult(
      resendAccountConfirmationEmailMutation,
      baseInput,
      'successResendAccountConfirmationEmail',
      'failureResendAccountConfirmationEmail'
    );
  }

  /**
   * Dispatches a register-User mutation and returns an observable of it's response (piping/switchmaps a loadUser in between)
   * @param registerUserInput
   */
  register$(registerUserInput: RegisterUserInput) {
    return this.csdDataService
      .mutate$<AuthUserMutationResponse>(registerUserMutation, { input: registerUserInput })
      .pipe(
        map((result) => this.setAuthenticationToken(result.token)),
        switchMap(() => this.loadUser$())
      );
  }

  deleteAccount$() {
    return this.csdDataService.mutate$(deleteMeMutation, { input: {} }).pipe(
      tap(() => this.setAuthenticationToken(null)),
      catchError((error) => {
        console.log('CsdCurrentUserService.deleteAccount: failed with error: ', error);
        return throwError(error);
      })
    );
  }

  update$(user: User) {
    const input: UserUpdateMeInput = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      salutation: user.salutation,
      interests: user.interests,
      language: user.language,
      country: user.country,
    };

    return this.csdDataService
      .mutate$<MeMutationResponse>(updateMeMutation, { input: input })
      .pipe(
        tap((result) => {
          this.csdAuthService.updateUser(result.user);
          this.csdBiService.logEvent(BiEvent.USER_ACCOUNT_SETTINGS_SAVED);
        })
      );
  }

  changePassword$(changePasswordInput: ChangePasswordInput) {
    return this.csdDataService.mutate$(changePasswordMutation, { input: changePasswordInput });
  }

  authCheck$(authMethod: AuthMethod, authCheckInput: AuthCheckInput) {
    return this.csdDataService.mutate$(authCheckMutation, { input: authCheckInput }).pipe(
      tap(() => {
        return localStorage.getItem('authtoken');
      })
    );
  }

  requestPasswordReset$(requestPasswordResetInput: RequestPasswordResetInput) {
    return this.csdDataService.mutate$(requestPasswordResetMutation, {
      input: requestPasswordResetInput,
    });
  }

  passwordReset$(resetPasswordInput: ResetPasswordInput) {
    return this.csdDataService.mutate$(resetPasswordMutation, {
      input: resetPasswordInput,
    });
  }

  confirmAccount$(token: string, userInfo: ConfirmAccountInfo) {
    return this.csdDataService.mutate$(confirmUserMutation, {
      input: { key: token, confirmAccountInfo: userInfo },
    });
  }
}
