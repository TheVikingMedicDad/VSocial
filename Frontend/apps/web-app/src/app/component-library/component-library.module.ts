import { NgModule } from '@angular/core';

import { CsdConfirmDialogComponent } from '../core/csd-confirm-dialog/csd-confirm-dialog.component';
import { CsdConfirmDialogPageComponent } from './csd-confirm-dialog-page/csd-confirm-dialog-page.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { CsdSelectPageComponent } from './csd-select-page/csd-select-page.component';
import {
  CsdStepperPageComponent,
  CsdStepperSecondPageComponent,
} from './csd-stepper-page/csd-stepper-page.component';
import { CsdMainComponentLibraryPageComponent } from './csd-main-component-library-page/csd-main-component-library-page.component';
import { CsdVersionPageComponent } from './csd-version-page/csd-version-page.component';
import { CsdSelectModule } from '../shared/components/csd-select/csd-select.module';
import { CsdStyleguideOverviewComponent } from './csd-styleguide-overview/csd-styleguide-overview.component';
import { RouterModule } from '@angular/router';
import { CsdFormControlOverviewComponent } from './csd-form-control-overview/csd-form-control-overview.component';
import { CsdButtonOverviewComponent } from './csd-button-overview/csd-button-overview.component';
import { CsdCardOverviewComponent } from './csd-card-overview/csd-card-overview.component';
import { CsdSnackbarOverviewComponent } from './csd-snackbar-overview/csd-snackbar-overview.component';
import { CsdOtherOverviewComponent } from './csd-other-overview/csd-other-overview.component';
import { CsdAccountEmailPreviewComponent } from './csd-account-email-preview/csd-account-email-preview.component';
import { CsdLastEmailPreviewFrameComponent } from './csd-last-email-preview-frame/csd-last-email-preview-frame.component';
import { MatRadioModule } from '@angular/material/radio';
import { CsdListOverviewComponent } from './csd-list-overview/csd-list-overview.component';
import { MatListModule } from '@angular/material/list';
import { CsdExampleTablePageComponent } from './csd-example-table-page/csd-example-table-page.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { CsdDataFilteringModule } from '../features/csd-data-filtering/csd-data-filtering.module';
import { CsdModelListModule } from '../features/csd-model-list/csd-model-list.module';
import { CsdExampleGqlDatasourceSectionComponent } from './csd-example-gql-datasource-section/csd-example-gql-datasource-section.component';
import { CsdExampleListDatasourceSectionComponent } from './csd-example-list-datasource-section/csd-example-list-datasource-section.component';

@NgModule({
  imports: [
    RouterModule,
    SharedModule,
    FormsModule,
    CsdSelectModule,
    MatRadioModule,
    MatListModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    CsdDataFilteringModule,
    CsdModelListModule,
  ],
  declarations: [
    CsdConfirmDialogComponent,
    CsdConfirmDialogPageComponent,
    CsdSelectPageComponent,
    CsdStepperPageComponent,
    CsdStepperSecondPageComponent,
    CsdMainComponentLibraryPageComponent,
    CsdVersionPageComponent,
    CsdStyleguideOverviewComponent,
    CsdFormControlOverviewComponent,
    CsdButtonOverviewComponent,
    CsdCardOverviewComponent,
    CsdSnackbarOverviewComponent,
    CsdOtherOverviewComponent,
    CsdAccountEmailPreviewComponent,
    CsdLastEmailPreviewFrameComponent,
    CsdListOverviewComponent,
    CsdExampleTablePageComponent,
    CsdExampleGqlDatasourceSectionComponent,
    CsdExampleListDatasourceSectionComponent,
  ],
  entryComponents: [CsdConfirmDialogComponent, CsdConfirmDialogPageComponent],
})
export class ComponentLibraryModule {}
