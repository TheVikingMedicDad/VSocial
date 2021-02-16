import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {
  PATH_NAME_INVITATION_CHECK,
  PATH_PARAM_TOKEN,
  PATH_REGISTER,
} from '../core/constants/router.constants';
import { CsdInvitationCheckPageComponentComponent } from './csd-invitation-check-page-component/csd-invitation-check-page-component.component';
import { CsdUserAuthenticatedGuard } from '../core/guards/csd-user-authenticated.guard';

const routes: Routes = [
  {
    path: `${PATH_NAME_INVITATION_CHECK}/:${PATH_PARAM_TOKEN}`,
    canActivate: [CsdUserAuthenticatedGuard], // TODO: write an own guard which redirects to a custom login page
    component: CsdInvitationCheckPageComponentComponent,
    data: { redirectPath: PATH_REGISTER },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvitationSystemRoutingModule {}
