import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { CsdModelListWrapperComponent } from './csd-model-list-wrapper/csd-model-list-wrapper.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { CsdDataFilteringModule } from '../csd-data-filtering/csd-data-filtering.module';

@NgModule({
  imports: [SharedModule, CsdDataFilteringModule, MatPaginatorModule, MatSortModule],
  declarations: [CsdModelListWrapperComponent],
  exports: [CsdModelListWrapperComponent],
})
export class CsdModelListModule {}
