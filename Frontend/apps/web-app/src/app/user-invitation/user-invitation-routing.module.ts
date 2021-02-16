import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {
  PATH_NAME_CRUD_MODEL_EDIT,
  PATH_NAME_CRUD_MODEL_LIST,
  PATH_NAME_CRUD_MODEL_NEW,
  PATH_NAME_CRUD_MODEL_VIEW,
  PATH_NAME_ID,
  PATH_NAME_USER_INVITATION_ACCEPT,
  PATH_PARAM_TOKEN,
} from '../core/constants/router.constants';
import { CsdDirtyCheckGuard } from '../core/guards/csd-dirty-check.guard';
import { CsdUserInvitationListPageComponent } from './csd-user-invitation-list-page/csd-user-invitation-list-page.component';
import { CsdUserInvitationCrudPageComponent } from './csd-user-invitation-crud-page/csd-user-invitation-crud-page.component';
import { CsdUserInvitationAcceptPageComponent } from './csd-user-invitation-accept-page/csd-user-invitation-accept-page.component';

const routes: Routes = [
  {
    path: PATH_NAME_CRUD_MODEL_LIST,
    canActivate: [],
    children: [{ path: '', component: CsdUserInvitationListPageComponent }],
  },
  {
    path: PATH_NAME_CRUD_MODEL_NEW,
    component: CsdUserInvitationCrudPageComponent,
    canDeactivate: [CsdDirtyCheckGuard],
  },
  // ACCEPT Invitation:
  {
    path: `${PATH_NAME_USER_INVITATION_ACCEPT}/:${PATH_PARAM_TOKEN}`,
    component: CsdUserInvitationAcceptPageComponent,
  },
  // SUB: user-invitations/1/...
  {
    path: PATH_NAME_ID,
    children: [
      {
        path: PATH_NAME_CRUD_MODEL_VIEW,
        component: CsdUserInvitationCrudPageComponent,
      },
      {
        path: PATH_NAME_CRUD_MODEL_EDIT,
        component: CsdUserInvitationCrudPageComponent,
        canDeactivate: [CsdDirtyCheckGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserInvitationRoutingModule {}
