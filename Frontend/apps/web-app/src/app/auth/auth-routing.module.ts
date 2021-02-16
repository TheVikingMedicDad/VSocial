import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CsdUserRegisterPageComponent } from './csd-user-register-page/csd-user-register-page.component';
import { CsdPublicToolbarComponent } from '../main/csd-public-toolbar/csd-public-toolbar.component';
import {
  PATH_NAME_AUTH,
  PATH_NAME_CONFIRM_EMAIL,
  PATH_NAME_CONFIRM_REGISTRATION,
  PATH_NAME_LOGIN,
  PATH_NAME_PASSWORD_RESET,
  PATH_NAME_REGISTER,
  PATH_NAME_TOKEN,
} from '../core/constants/router.constants';
import { CsdUserLoginPageComponent } from './csd-user-login-page/csd-user-login-page.component';
import { CsdUserConfirmAccountPageComponent } from './csd-user-confirm-account-page/csd-user-confirm-account-page.component';
import { CsdConfirmEmailPageComponent } from './csd-confirm-email-page/csd-confirm-email-page.component';
import { CsdPasswordResetPageComponent } from './csd-password-reset-page/csd-password-reset-page.component';

const routes: Routes = [
  {
    path: PATH_NAME_AUTH + '/' + PATH_NAME_REGISTER,
    data: { logoImage: '/assets/images/logo_rect_dark.svg' },
    children: [
      { path: '', component: CsdUserRegisterPageComponent },
      { path: '', component: CsdPublicToolbarComponent, outlet: 'main-toolbar' },
    ],
  },
  {
    path: PATH_NAME_AUTH + '/' + PATH_NAME_LOGIN,
    data: { logoImage: '/assets/images/logo_rect_light.svg' },
    children: [
      { path: '', component: CsdUserLoginPageComponent },
      { path: '', component: CsdPublicToolbarComponent, outlet: 'main-toolbar' },
    ],
  },
  {
    path: PATH_NAME_AUTH + '/' + PATH_NAME_CONFIRM_REGISTRATION + '/' + PATH_NAME_TOKEN,
    data: { logoImage: '/assets/images/logo_rect_dark.svg' },
    children: [
      { path: '', component: CsdUserConfirmAccountPageComponent },
      { path: '', component: CsdPublicToolbarComponent, outlet: 'main-toolbar' },
    ],
  },
  {
    path: PATH_NAME_AUTH + '/' + PATH_NAME_PASSWORD_RESET + '/' + PATH_NAME_TOKEN,
    data: { logoImage: '/assets/images/logo_rect_dark.svg' },
    children: [
      { path: '', component: CsdPasswordResetPageComponent },
      { path: '', component: CsdPublicToolbarComponent, outlet: 'main-toolbar' },
    ],
  },
  {
    path: PATH_NAME_AUTH + '/' + PATH_NAME_CONFIRM_EMAIL + '/' + PATH_NAME_TOKEN,
    data: { logoImage: '/assets/images/logo_rect_dark.svg' },
    children: [
      { path: '', component: CsdConfirmEmailPageComponent },
      { path: '', component: CsdPublicToolbarComponent, outlet: 'main-toolbar' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  declarations: [],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
