import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CsdTextFilterComponent } from './filters/csd-text-filter/csd-text-filter.component';
import { CsdFilterConfiguratorComponent } from './csd-filter-configurator/csd-filter-configurator.component';
import { CsdFilterConfiguratorPageComponent } from './csd-filter-configurator-page/csd-filter-configurator-page.component';
import { CoreModule } from '../../core/core.module';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { CsdFilterContainerComponent } from './filters/csd-filter-container/csd-filter-container.component';
import { CsdFilterHostDirective } from './csd-filter-host.directive';
import { CsdChoiceFilterComponent } from './filters/csd-choice-filter/csd-choice-filter.component';
import { I18NextModule } from 'angular-i18next';
import { CsdContainerSeparatorComponent } from './filters/csd-filter-container/csd-container-separator/csd-container-separator.component';
import { CsdFilterWidgetComponent } from './csd-filter-widget/csd-filter-widget.component';
import { CsdFilterButtonComponent } from './csd-filter-button/csd-filter-button.component';

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonToggleModule,
    MatExpansionModule,
    MatRadioModule,
    MatMenuModule,
    MatButtonModule,
    FlexLayoutModule,
    I18NextModule,
  ],
  declarations: [
    CsdTextFilterComponent,
    CsdFilterConfiguratorComponent,
    CsdFilterConfiguratorPageComponent,
    CsdFilterContainerComponent,
    CsdFilterHostDirective,
    CsdChoiceFilterComponent,
    CsdContainerSeparatorComponent,
    CsdFilterWidgetComponent,
    CsdFilterButtonComponent,
  ],
  entryComponents: [
    CsdTextFilterComponent,
    CsdFilterContainerComponent,
    CsdChoiceFilterComponent,
    CsdContainerSeparatorComponent,
  ],
  exports: [CsdTextFilterComponent, CsdFilterConfiguratorComponent, CsdFilterButtonComponent],
})
export class CsdDataFilteringModule {}
