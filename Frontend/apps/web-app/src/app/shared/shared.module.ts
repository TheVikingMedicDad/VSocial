import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CsdDummyComponent } from './components/csd-dummy/csd-dummy.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CsdLanguageChooserComponent } from '../translation/csd-language-chooser/csd-language-chooser.component';
import { I18NextModule } from 'angular-i18next';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SafeHtml } from './pipes/safe-html.pipe';
import { CsdUserMenuComponent } from './components/csd-user-menu/csd-user-menu.component';
import { RouterModule } from '@angular/router';
import { CsdUserConfirmAccountReminderComponent } from './components/csd-user-confirm-account-reminder/csd-user-confirm-account-reminder.component';
import { CsdDashboardPageComponent } from './components/csd-dashboard-page/csd-dashboard-page.component';
import { MomentModule } from 'ngx-moment';
import { CsdCrudHeaderComponent } from './components/csd-crud-header/csd-crud-header.component';
import { BaseModelListComponent } from './components/base-model-list/base-model-list.component';
import { SharedRoutingModule } from './shared-routing.module';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import {
  CsdStepComponent,
  CsdStepperComponent,
} from './components/csd-stepper/csd-stepper.component';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { FilePondModule, registerPlugin } from 'ngx-filepond';

import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginImageResize from 'filepond-plugin-image-resize';
import FilePondPluginImageCrop from 'filepond-plugin-image-crop';
import { ConstantToReadablePipe } from './pipes/constant-to-readable.pipe';
import { CsdAddressChildFormComponent } from './components/csd-address-child-form/csd-address-child-form.component';
import { TranslateCountryCodePipe } from './pipes/translate-country-code.pipe';
import { CsdCardComponent } from './components/csd-card/csd-card.component';
import { CsdPaginatorDataSourceDirective } from './directives/csd-paginator-data-source.directive';
import { CsdMatSortDatasourceConnectorDirective } from './directives/csd-mat-sort-datasource-connector.directive';
import { CsdNotFoundComponent } from './components/csd-not-found/csd-not-found.component';
import { CsdRouterOutletScrollDirective } from './directives/csd-router-outlet-scroll.directive';

registerPlugin(
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType,
  FilePondPluginImageResize,
  FilePondPluginImageCrop
);

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    SharedRoutingModule,
    FormsModule,
    NgxMatSelectSearchModule,
    // Material
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatCheckboxModule,
    MatChipsModule,
    MatButtonModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatDialogModule,
    MatCheckboxModule,
    MatGridListModule,
    MatSelectModule,
    CdkStepperModule,
    // FlexLayout
    FlexLayoutModule,
    // Translation
    I18NextModule,
    // Forms
    ReactiveFormsModule,
    // Moment Pipes
    MomentModule,
    //FilePond Uploading
    FilePondModule,
  ],
  declarations: [
    // Components
    CsdDummyComponent,
    CsdLanguageChooserComponent,
    CsdUserMenuComponent,
    CsdUserConfirmAccountReminderComponent,
    CsdCrudHeaderComponent,
    CsdStepperComponent,
    CsdStepComponent,
    CsdAddressChildFormComponent,
    CsdDashboardPageComponent,
    BaseModelListComponent,
    // Pipes
    SafeHtml,
    TranslateCountryCodePipe,
    ConstantToReadablePipe,
    CsdCardComponent,
    CsdPaginatorDataSourceDirective,
    CsdMatSortDatasourceConnectorDirective,
    CsdRouterOutletScrollDirective,
    CsdNotFoundComponent,
  ],
  exports: [
    // Components
    CsdLanguageChooserComponent,
    CsdDummyComponent,
    CsdUserMenuComponent,
    CsdUserConfirmAccountReminderComponent,
    CsdCrudHeaderComponent,
    CsdStepperComponent,
    CsdStepComponent,
    CsdAddressChildFormComponent,
    // Directives
    CsdPaginatorDataSourceDirective,
    CsdMatSortDatasourceConnectorDirective,
    CsdRouterOutletScrollDirective,
    // Pipes
    SafeHtml,
    TranslateCountryCodePipe,
    ConstantToReadablePipe,
    // Modules
    CommonModule,
    FormsModule,
    NgxMatSelectSearchModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatCheckboxModule,
    MatChipsModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatDialogModule,
    MatCheckboxModule,
    MatGridListModule,
    CdkStepperModule,
    // FlexLayout
    FlexLayoutModule,
    // Translation
    I18NextModule,
    // Forms
    ReactiveFormsModule,
    CsdDashboardPageComponent,
    // Moment Pipes
    MomentModule,
    BaseModelListComponent,
    //FilePond Uploading
    FilePondModule,
    CsdCardComponent,
  ],
})
export class SharedModule {}
