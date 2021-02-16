import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PATH_NAME_FILTER_CONFIGURATOR, PATH_NAME_ID } from '../../core/constants/router.constants';
import { CsdFilterConfiguratorPageComponent } from './csd-filter-configurator-page/csd-filter-configurator-page.component';
import { CsdDataFilteringModule } from './csd-data-filtering.module';

const routes: Routes = [
  {
    path: PATH_NAME_FILTER_CONFIGURATOR + '/' + PATH_NAME_ID,
    component: CsdFilterConfiguratorPageComponent,
  },
];

@NgModule({
  imports: [CsdDataFilteringModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CsdDataFilteringRoutingModule {}
