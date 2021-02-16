import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CsdCardStepperComponent } from './csd-card-stepper/csd-card-stepper.component';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@NgModule({
  imports: [
    CommonModule,
    CdkStepperModule,
    MatCardModule,
    MatExpansionModule,
    MatProgressBarModule,
  ],
  declarations: [CsdCardStepperComponent],
  entryComponents: [CsdCardStepperComponent],
  exports: [CsdCardStepperComponent],
})
export class CsdCardStepperModule {}
