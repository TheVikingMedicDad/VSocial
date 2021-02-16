import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CsdUserRegisterComponent } from './csd-user-register/csd-user-register.component';
import { CsdUserRegisterPageComponent } from './csd-user-register-page/csd-user-register-page.component';
import { AuthRoutingModule } from './auth-routing.module';
import { SharedModule } from '../shared/shared.module';
import { CsdUserLoginComponent } from './csd-user-login/csd-user-login.component';
import { CsdUserLoginPageComponent } from './csd-user-login-page/csd-user-login-page.component';
import { CsdUserConfirmAccountPageComponent } from './csd-user-confirm-account-page/csd-user-confirm-account-page.component';
import { CsdConfirmEmailPageComponent } from './csd-confirm-email-page/csd-confirm-email-page.component';
import { CsdRequestPasswordResetComponent } from './csd-request-password-reset/csd-request-password-reset.component';
import { CsdPasswordResetPageComponent } from './csd-password-reset-page/csd-password-reset-page.component';
import { CsdPasswordResetComponent } from './csd-password-reset/csd-password-reset.component';
import { CsdUserConfirmAccountComponent } from './csd-user-confirm-account/csd-user-confirm-account.component';
import { CsdConfirmEmailComponent } from './csd-confirm-email/csd-confirm-email.component';
import { CsdCarouselModule } from '../features/csd-carousel/csd-carousel.module';

@NgModule({
  imports: [CommonModule, AuthRoutingModule, SharedModule, CsdCarouselModule],
  declarations: [
    CsdUserRegisterComponent,
    CsdUserRegisterPageComponent,
    CsdUserLoginComponent,
    CsdUserLoginPageComponent,
    CsdUserConfirmAccountPageComponent,
    CsdConfirmEmailPageComponent,
    CsdRequestPasswordResetComponent,
    CsdPasswordResetPageComponent,
    CsdPasswordResetComponent,
    CsdUserConfirmAccountComponent,
    CsdConfirmEmailComponent,
  ],
  entryComponents: [CsdRequestPasswordResetComponent],
  exports: [
    CsdUserRegisterComponent,
    CsdUserRegisterPageComponent,
    CsdUserLoginComponent,
    CsdUserLoginPageComponent,
    CsdUserConfirmAccountPageComponent,
  ],
})
export class AuthModule {}
