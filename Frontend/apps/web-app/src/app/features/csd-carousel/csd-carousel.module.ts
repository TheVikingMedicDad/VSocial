import { NgModule } from '@angular/core';
import { CsdCarouselComponent } from './csd-carousel.component';
import { CsdCarouselItemComponent } from './csd-carousel-item/csd-carousel-item.component';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [CommonModule, SharedModule],
  declarations: [CsdCarouselComponent, CsdCarouselItemComponent],
  exports: [CsdCarouselComponent],
})
export class CsdCarouselModule {}
