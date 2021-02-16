import { Injectable } from '@angular/core';
import { CreateUserInput, UpdateUserInput, User } from './csd-user.types';
import { CsdDataService } from '../../services/csd-data.service';
import {
  createUserMutation,
  deleteUserMutation,
  getUserQuery,
  updateUserMutation,
} from './csd-user.graphql';
import { CsdBaseModelService } from '../csd-base-model.service';
import { CsdConfirmDialogService } from '../../csd-confirm-dialog/csd-confirm-dialog.service';
import { BaseGqlInput, DeleteModelInput, DownloadFile, ID, Tag } from '../../core.types';
import { Observable } from 'rxjs';
import { I18NextPipe } from 'angular-i18next';
import { allUserTagsQuery, exportUserListMutation } from '../../../auth/csd-current-user.graphql';
import { map, tap } from 'rxjs/operators';
import { get } from 'lodash-es';
import { CsdSnackbarService } from '../../../features/csd-snackbar/csd-snackbar.service';
import { ROUTER_OUTLET_MAIN_SIDENAV } from '../../constants/general.constants';
import {
  PATH_NAME_ADMIN,
  PATH_NAME_USER_ADD,
  PATH_NAME_USER_EDIT,
  PATH_NAME_USER_MANAGEMENT,
  PATH_NAME_USER_VIEW,
} from '../../constants/router.constants';
import { CsdRouterUtilsService } from '../../csd-router-utils.service';
import { CsdChangePasswordDialogComponent } from '../../csd-change-password-dialog/csd-change-password-dialog.component';
import { AuthCheckActions } from '../../../auth/auth.types';
import { CsdAuthCheckService } from '../../csd-auth-check-dialog/csd-auth-check.service';
import { CsdMainStateService } from '../../../main/state/csd-main-state.service';
@Injectable({
  providedIn: 'root',
})
export class CsdUserService extends CsdBaseModelService<User> {
  modelName = 'User';
  modelCls = User;

  constructor(
    protected csdDataService: CsdDataService,
    protected csdMainStateService: CsdMainStateService,
    protected csdConfirmDialogService: CsdConfirmDialogService,
    protected i18NextPipe: I18NextPipe,
    protected csdSnackbarService: CsdSnackbarService,
    protected csdRouterService: CsdRouterUtilsService,
    protected csdAuthCheckService: CsdAuthCheckService
  ) {
    super(csdDataService, csdMainStateService, csdConfirmDialogService, i18NextPipe);
  }

  //TODO: It is not directly a user because we have all this nesting, we need to pluck
  // create$(createUserInput: CreateUserInput): Observable<User> {
  //   return this.createModel<CreateUserInput, User>(createUserMutation, createUserInput)
  //     .pipe(
  //       tap(result => console.log('####: ', result))
  //     );
  // }

  get$(id: ID) {
    return this.getObject(getUserQuery, id);
  }

  getAllUserTags$(): Observable<Tag[]> {
    return this.csdDataService
      .query(allUserTagsQuery, {}, { fetchPolicy: 'network-only' })
      .valueChanges.pipe(
        map((result: any) => this._flattenStructureDeep(result)['data']['allUserTags'])
      );
  }

  // TODO: should go in sidebar service
  viewUserAdd(draftId) {
    this.csdRouterService.navigate([
      {
        outlets: {
          [ROUTER_OUTLET_MAIN_SIDENAV]: [
            PATH_NAME_ADMIN,
            PATH_NAME_USER_MANAGEMENT,
            PATH_NAME_USER_ADD,
            { draftId: draftId.split(':')[1] },
          ],
        },
      },
    ]);
  }

  viewUserView(model_id: string) {
    console.log('CsdUserService.viewUserView: ', model_id);
    this.csdRouterService.navigate([
      {
        outlets: {
          [ROUTER_OUTLET_MAIN_SIDENAV]: `${PATH_NAME_ADMIN}/${PATH_NAME_USER_MANAGEMENT}/${PATH_NAME_USER_VIEW}/${model_id}`,
        },
      },
    ]);
  }

  userEdit(model_id: string) {
    console.log('CsdUserService.viewUserEdit: ', model_id);
    this.csdRouterService.navigate([
      {
        outlets: {
          [ROUTER_OUTLET_MAIN_SIDENAV]: `${PATH_NAME_ADMIN}/${PATH_NAME_USER_MANAGEMENT}/${PATH_NAME_USER_EDIT}/${model_id}`,
        },
      },
    ]);
  }

  userResetPassword(userId: string) {
    return this.csdAuthCheckService
      .openDialogAfterAuthCheck(CsdChangePasswordDialogComponent, AuthCheckActions.CHANGE_PASSWORD)
      .subscribe(
        (result) => {
          if (result) {
            this.csdSnackbarService.success('ACCOUNT_SETTINGS.CHANGE_PASSWORD.SUCCESS');
          }
        },
        (error) => this.csdSnackbarService.error()
      );
  }

  userDelete$(deleteUserInput: DeleteModelInput): Observable<any> {
    return this.destroy$(
      deleteUserInput.id,
      this.csdDataService
        .mutate$<User>(deleteUserMutation, { input: deleteUserInput })
        .pipe(
          tap(() => {
            this.updateLastModified();
          })
        )
    );
  }

  create$(createUserInput: CreateUserInput) {
    return this.csdDataService.mutate$(createUserMutation, { input: createUserInput }).pipe(
      tap(() => {
        this.updateLastModified();
      })
    );
  }

  update$(updateUserInput: UpdateUserInput) {
    return this.csdDataService.mutate$(updateUserMutation, { input: updateUserInput });
  }

  exportUserList$(baseInput: BaseGqlInput) {
    return this.csdDataService
      .mutate$(exportUserListMutation, { input: baseInput })
      .pipe(map((result) => get(result, 'file') as DownloadFile));
  }
}
