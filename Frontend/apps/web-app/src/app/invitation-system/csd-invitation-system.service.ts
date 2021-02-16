import { Injectable } from '@angular/core';
import { I18NextCapPipe } from 'angular-i18next';
import { Observable, throwError } from 'rxjs';
import { CsdBaseModelService } from '../core/state/csd-base-model.service';
import {
  AcceptInvitationInput,
  CancelInvitationInput,
  CreateInvitationInput,
  Invitation,
} from './csd-invitation-system.types';
import { CsdDataService } from '../core/services/csd-data.service';
import { CsdConfirmDialogService } from '../core/csd-confirm-dialog/csd-confirm-dialog.service';
import { CreateModelSuccessAction, ID } from '../core/core.types';
import {
  acceptInvitationMutation,
  cancelInvitationMutation,
  createInvitationMutation,
  getInvitationByTokenQuery,
  getInvitationQuery,
} from './csd-invitation-system.graphql';
import { map, tap } from 'rxjs/operators';
import { CsdInvitationUpdateNotAllowedError } from './csd-invitation-system.errors';
import { CsdMainStateService } from '../main/state/csd-main-state.service';

@Injectable({
  providedIn: 'root',
})
export class CsdInvitationSystemService extends CsdBaseModelService<Invitation> {
  modelName = 'Invitation';
  modelCls = Invitation;

  constructor(
    protected csdDataService: CsdDataService,
    protected csdMainStateService: CsdMainStateService,
    protected csdConfirmDialogService: CsdConfirmDialogService,
    protected i18NextPipe: I18NextCapPipe
  ) {
    super(csdDataService, csdMainStateService, csdConfirmDialogService, i18NextPipe);
  }

  get$(id: ID): Observable<Invitation> {
    return this.getObject(getInvitationQuery, id, { fetchPolicy: 'network-only' });
  }

  getInvitationByToken$(token: string): Observable<Invitation> {
    return this.csdDataService
      .typedQuery<any, Invitation>(getInvitationByTokenQuery, { token }, ['data', 'invitation'])
      .pipe(
        tap((result: any) => {
          // TODO: error handling like mutation
          if (result && 'error' in result) {
            throwError(result.error);
          }
        }),
        map((obj) => Object.assign(new this.modelCls(), obj))
      ) as Observable<Invitation>;
  }

  create$(createInput: CreateInvitationInput): Observable<Invitation> {
    return this.csdDataService
      .mutate$<Invitation>(createInvitationMutation, { input: createInput })
      .pipe<Invitation>(
        tap<Invitation>(() => {
          this.updateLastModified();
        })
      );
  }

  accept$(acceptInput: AcceptInvitationInput): Observable<any> {
    return this.csdDataService.mutate$(acceptInvitationMutation, { input: acceptInput }).pipe(
      tap(() => {
        this.updateLastModified();
      })
    );
  }

  cancel$(cancelInput: CancelInvitationInput): Observable<any> {
    return this.destroy$(
      cancelInput.id,
      this.csdDataService.mutate$(cancelInvitationMutation, { input: cancelInput })
    ).pipe(
      tap(() => {
        this.updateLastModified();
      })
    );
  }

  update$(updateInput: any): Observable<CreateModelSuccessAction<Invitation>> {
    throw new CsdInvitationUpdateNotAllowedError('Update of Invitation not possible.');
    return null; // <-- is needed
  }
}
