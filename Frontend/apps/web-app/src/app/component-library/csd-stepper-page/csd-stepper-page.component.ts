import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import {
  CsdStepComponent,
  csdStepperAnimations,
} from '../../shared/components/csd-stepper/csd-stepper.component';
import { state, style } from '@angular/animations';

// overrides existing animation
csdStepperAnimations.definitions[0] = state('previous', style({ backgroundColor: 'red' }));

@Component({
  selector: 'csd-stepper-page',
  templateUrl: './csd-stepper-page.component.html',
  styleUrls: ['./csd-stepper-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdStepperPageComponent implements OnInit {
  testForm: FormGroup;
  formFieldAppearance: MatFormFieldAppearance = 'outline';
  constructor(private formBuilder: FormBuilder) {}
  horizontal = false;
  animate = false;
  secondError = false;
  secondCompleted = false;
  @ViewChild('neededForSecondStep') neededStep: CsdStepComponent;
  csdStepperStepIds = CsdStepperStepIds;
  generalTestAction(event: any) {
    alert('current/next step: ' + event.currentStep.label + '/' + event.nextStep.label);
  }

  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    this.testForm = this.formBuilder.group({
      testControl: [{ value: '', disabled: false }, [Validators.required]],
      testControl2: [{ value: '', disabled: false }, [Validators.required]],
      testControl3: [{ value: '', disabled: false }, [Validators.required]],
      testControl4: [{ value: '', disabled: false }, [Validators.required]],
      testControl5: [{ value: '', disabled: false }, [Validators.required]],
    });
  }

  get testControlForm() {
    return this.testForm.get('testControl');
  }
  get testControlForm2() {
    return this.testForm.get('testControl2');
  }
  get testControlForm3() {
    return this.testForm.get('testControl3');
  }
  get testControlForm4() {
    return this.testForm.get('testControl4');
  }
  get testControlForm5() {
    return this.testForm.get('testControl5');
  }

  toggleDirection() {
    this.horizontal = !this.horizontal;
  }

  toggleAnimation() {
    this.animate = !this.animate;
  }
}

@Component({
  selector: 'csd-stepper-second-page',
  templateUrl: './csd-stepper-second-page.html',
  styleUrls: ['./csd-stepper-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdStepperSecondPageComponent implements OnInit {
  secondTestForm: FormGroup;
  formFieldAppearance: MatFormFieldAppearance = 'outline';
  constructor(private formBuilder: FormBuilder) {}
  @Output() secondFormInvalid = new EventEmitter();
  @Output() secondFormValid = new EventEmitter();

  ngOnInit(): void {
    this.buildForm();
  }

  checkIfValid() {
    if (this.secondTestControlForm.touched && this.secondTestControlForm.errors) {
      this.secondFormInvalid.emit(true);
    } else {
      this.secondFormValid.emit(true);
    }
  }

  buildForm() {
    this.secondTestForm = this.formBuilder.group({
      secondTestControl: [{ value: '', disabled: false }, [Validators.required]],
    });
  }

  get secondTestControlForm() {
    return this.secondTestForm.get('secondTestControl');
  }
}

export enum CsdStepperStepIds {
  STEP_1 = 'STEP_1',
  STEP_2 = 'STEP_2',
  STEP_3 = 'STEP_3',
  STEP_4 = 'STEP_4',
}
