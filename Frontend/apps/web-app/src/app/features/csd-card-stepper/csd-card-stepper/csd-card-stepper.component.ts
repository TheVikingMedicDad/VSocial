import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CdkStepper } from '@angular/cdk/stepper';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'csd-card-stepper',
  templateUrl: './csd-card-stepper.component.html',
  styleUrls: ['./csd-card-stepper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: CdkStepper, useExisting: CsdCardStepperComponent }],
})
export class CsdCardStepperComponent extends CdkStepper implements OnInit {
  get steps() {
    // needed for easier migration to new material version
    return this._steps;
  }

  ngOnInit() {}

  onClick(index: number): void {
    this.selectedIndex = index;
  }

  stepsCompleted() {
    let completedStepCounter = 0;
    for (const step of this.steps.toArray()) {
      if (step.completed) {
        completedStepCounter++;
      }
    }
    return completedStepCounter;
  }
}
