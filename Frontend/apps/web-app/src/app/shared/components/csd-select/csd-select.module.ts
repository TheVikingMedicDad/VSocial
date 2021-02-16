import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CsdBottomDirective,
  CsdItemContentDirective,
  CsdSelectComponent,
  CsdSelectItemComponent,
  CsdTopDirective,
} from './csd-select.component';
import { SharedModule } from '../../shared.module';

@NgModule({
  imports: [CommonModule, SharedModule],
  declarations: [
    CsdSelectComponent,
    CsdTopDirective,
    CsdBottomDirective,
    CsdItemContentDirective,
    CsdSelectItemComponent,
  ],
  exports: [
    CsdSelectComponent,
    CsdTopDirective,
    CsdBottomDirective,
    CsdItemContentDirective,
    CsdSelectItemComponent,
  ],
})
export class CsdSelectModule {}
