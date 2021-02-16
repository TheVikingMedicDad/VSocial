import { NgModule } from '@angular/core';
import { CsdSnackbarModule } from '../features/csd-snackbar/csd-snackbar.module';
import { CsdGraphqlModule } from './csd-graphql.module';
import { CsdAuthCheckDialogComponent } from './csd-auth-check-dialog/csd-auth-check-dialog.component';
import { SharedModule } from '../shared/shared.module';
import { CsdAuthCheckService } from './csd-auth-check-dialog/csd-auth-check.service';
import { CsdChangePasswordDialogComponent } from './csd-change-password-dialog/csd-change-password-dialog.component';
import { CsdDeleteAccountDialogComponent } from './csd-delete-account-dialog/csd-delete-account-dialog.component';
import { CsdChangeEmailDialogComponent } from './csd-change-email-dialog/csd-change-email-dialog.component';
import { CsdDownloadPrepareDialogComponent } from './csd-download-prepare-dialog/csd-download-prepare-dialog.component';
import { TranslationModule } from '../translation/translation.module';
import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';

@NgModule({
  imports: [TranslationModule, CsdSnackbarModule.forRoot(), CsdGraphqlModule, SharedModule],
  declarations: [
    CsdAuthCheckDialogComponent,
    CsdChangePasswordDialogComponent,
    CsdDeleteAccountDialogComponent,
    CsdChangeEmailDialogComponent,
    CsdDownloadPrepareDialogComponent,
  ],
  entryComponents: [
    CsdAuthCheckDialogComponent,
    CsdChangePasswordDialogComponent,
    CsdDeleteAccountDialogComponent,
    CsdChangeEmailDialogComponent,
    CsdDownloadPrepareDialogComponent,
  ],
  providers: [
    //we need to provide it here because the dialog entry components are also here
    // see: https://stackoverflow.com/a/54144885/2160733
    CsdAuthCheckService,
    Apollo,
    HttpLink,
  ],
  exports: [],
})
export class CoreModule {
  constructor() {}
}
