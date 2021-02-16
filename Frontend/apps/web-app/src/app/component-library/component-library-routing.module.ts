import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {
  PATH_NAME_ACTIVATION_EMAIL_PREVIEW,
  PATH_NAME_BUTTONS,
  PATH_NAME_CONFIRM_DIALOG,
  PATH_NAME_CSD_CARDS,
  PATH_NAME_CSD_LISTS,
  PATH_NAME_CSD_SELECT,
  PATH_NAME_CSD_STEPPER,
  PATH_NAME_CSD_VERSION_PAGE,
  PATH_NAME_EXAMPLE_TABLE_PAGE,
  PATH_NAME_FORM_CONTROLS,
  PATH_NAME_OTHER_COMPONENTS,
  PATH_NAME_SNACKBARS,
  PATH_NAME_STYLEGUIDE,
} from '../core/constants/router.constants';
import { CsdConfirmDialogPageComponent } from './csd-confirm-dialog-page/csd-confirm-dialog-page.component';
import { CsdSelectPageComponent } from './csd-select-page/csd-select-page.component';
import { CsdStepperPageComponent } from './csd-stepper-page/csd-stepper-page.component';
import { CsdMainComponentLibraryPageComponent } from './csd-main-component-library-page/csd-main-component-library-page.component';
import { CsdVersionPageComponent } from './csd-version-page/csd-version-page.component';
import { ComponentLibraryModule } from './component-library.module';
import { CsdStyleguideOverviewComponent } from './csd-styleguide-overview/csd-styleguide-overview.component';
import { CsdFormControlOverviewComponent } from './csd-form-control-overview/csd-form-control-overview.component';
import { CsdButtonOverviewComponent } from './csd-button-overview/csd-button-overview.component';
import { CsdCardOverviewComponent } from './csd-card-overview/csd-card-overview.component';
import { CsdSnackbarOverviewComponent } from './csd-snackbar-overview/csd-snackbar-overview.component';
import { CsdOtherOverviewComponent } from './csd-other-overview/csd-other-overview.component';
import { CsdAccountEmailPreviewComponent } from './csd-account-email-preview/csd-account-email-preview.component';
import { CsdExampleTablePageComponent } from './csd-example-table-page/csd-example-table-page.component';
import { CsdListOverviewComponent } from './csd-list-overview/csd-list-overview.component';

const routes: Routes = [
  {
    path: '',
    component: CsdMainComponentLibraryPageComponent,
    children: [
      { path: PATH_NAME_CSD_SELECT, component: CsdSelectPageComponent },
      { path: PATH_NAME_CSD_STEPPER, component: CsdStepperPageComponent },
      { path: PATH_NAME_CSD_CARDS, component: CsdCardOverviewComponent },
      { path: PATH_NAME_CSD_LISTS, component: CsdListOverviewComponent },
      { path: PATH_NAME_CONFIRM_DIALOG, component: CsdConfirmDialogPageComponent },
      { path: PATH_NAME_STYLEGUIDE, component: CsdStyleguideOverviewComponent },
      { path: PATH_NAME_FORM_CONTROLS, component: CsdFormControlOverviewComponent },
      { path: PATH_NAME_BUTTONS, component: CsdButtonOverviewComponent },
      { path: PATH_NAME_SNACKBARS, component: CsdSnackbarOverviewComponent },
      { path: PATH_NAME_OTHER_COMPONENTS, component: CsdOtherOverviewComponent },
      { path: PATH_NAME_ACTIVATION_EMAIL_PREVIEW, component: CsdAccountEmailPreviewComponent },
      { path: PATH_NAME_EXAMPLE_TABLE_PAGE, component: CsdExampleTablePageComponent },
    ],
  },
  {
    path: PATH_NAME_CSD_VERSION_PAGE,
    component: CsdVersionPageComponent,
  },
];

@NgModule({
  imports: [ComponentLibraryModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComponentLibraryRoutingModule {
  constructor() {}
}
