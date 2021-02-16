import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Input,
  Output,
  EventEmitter,
  QueryList,
  ContentChildren,
  AfterViewInit,
  OnInit,
  Inject,
  forwardRef,
} from '@angular/core';
import { CdkStep, CdkStepper } from '@angular/cdk/stepper';
import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { trigger, state, style, animate, transition, AnimationMetadata } from '@angular/animations';
import { CsdDuplicateStepError, CsdNoStepIdError } from '../../../auth/auth.errors';

@Component({
  selector: 'csd-step',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-template><ng-content></ng-content></ng-template>',
  providers: [{ provide: CdkStep, useExisting: CsdStepComponent }],
})
export class CsdStepComponent extends CdkStep implements OnInit {
  /***
   * defines what the content of the label of the step is
   */
  @Input() label: string;
  /***
   * states if the step is disabled
   */
  @Input() disabled = false;

  @Input() id: string;

  constructor(@Inject(forwardRef(() => CsdStepperComponent)) _stepper: CsdStepperComponent) {
    super(_stepper);
  }

  ngOnInit(): void {
    if (!this.id) {
      throw new CsdNoStepIdError(
        'csd-step: sA csd-step needs an id! Use the [id] attribute to assign an id'
      );
    }
  }
}

/***
 * defines the states of the animation and the transition between the states
 */
export let csdStepperAnimationDefinitions: AnimationMetadata[] = [
  state(
    'previous',
    style({ transform: 'translate3d(-100%, 0, 0)', visibility: 'hidden', opacity: 0 })
  ),
  state('current', style({ transform: 'none', visibility: 'visible', opacity: 1 })),
  state('next', style({ transform: 'translate3d(100%, 0, 0)', visibility: 'hidden', opacity: 0 })),
  transition('* => *', animate('500ms cubic-bezier(0.35, 0, 0.25, 1)')),
];

export let csdStepperAnimations = trigger('stepTransition', csdStepperAnimationDefinitions);

@Component({
  selector: 'csd-stepper',
  templateUrl: './csd-stepper.component.html',
  styleUrls: ['./csd-stepper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: CdkStepper, useExisting: CsdStepperComponent }],
  animations: [csdStepperAnimations],
})
export class CsdStepperComponent extends CdkStepper implements AfterViewInit {
  /***
   * defines the flex Layout of the different divs of the component
   */
  CSD_STEPPER_FLEX_LAYOUT = {
    STEPPER: {
      LAYOUT: 'row',
      LAYOUT_ALIGN: 'start start',
      NAVIGATION: {
        LAYOUT: 'column',
        FLEX: '20',
        STEPS: {
          LAYOUT_ALIGN: 'start center',
        },
      },
      CONTENT: {
        LAYOUT: 'column',
        LAYOUT_ALIGN: 'start stretch',
        FLEX: '80',
      },
    },
  };

  /***
   * Input that changes the icon of a completed step. See mat-icon for reference.
   */
  @Input() errorIcon = 'warning';
  /***
   * Input that changes the icon of a step that has errors. See mat-icon for reference.
   */
  @Input() completedIcon = 'check';

  /***
   * contains all the steps of the stepper
   */
  @ContentChildren(CsdStepComponent) _steps: QueryList<CsdStepComponent>;

  /***
   * if a disabled step be navigated to, this event triggers
   */
  @Output() enterDisabled = new EventEmitter<any>();

  /***
   * defines if the transition between each step should be animated
   */
  private _animate = false;
  @Input()
  get animate() {
    return this._animate;
  }
  set animate(shouldAnimate: boolean) {
    this._animate = coerceBooleanProperty(shouldAnimate);
  }

  /***
   * defines if the direction of the stepper should be horizontal
   */
  private _horizontal = false;
  @Input()
  get horizontal(): boolean {
    return this._horizontal;
  }
  set horizontal(isHorizontal: boolean) {
    this._horizontal = coerceBooleanProperty(isHorizontal);
    this.changeLayout(this._horizontal);
  }

  constructor(private dir: Directionality, private changeDetectorRef: ChangeDetectorRef) {
    super(dir, changeDetectorRef);
  }

  ngAfterViewInit(): void {
    const hasDuplicateSteps: boolean =
      new Set(this._steps.map((step) => step.id)).size < this._steps.length;
    if (hasDuplicateSteps) {
      throw new CsdDuplicateStepError(
        'csd-stepper: Every csd-step of a csd-stepper needs an unique id! Check the ids of each step if they are unique'
      );
    }
    super.ngAfterViewInit();
  }

  /***
   * triggers if one of the step labels is clicked. It detects if the clicked on step is disabled
   * or not and either navigates to this step or emits the enterDisabled event
   *
   * @param nextStep Step that the stepper wants to navigate to
   * @param newIndex Index of nextStep
   */
  onClick(nextStep: CsdStepComponent, newIndex: number): void {
    if (this._steps.toArray()[newIndex].disabled) {
      this.emit(nextStep);
    } else {
      this.selectedIndex = newIndex;
    }
  }

  /***
   * Is called when a cdkStepperNext button is clicked. It checks if the next step is disabled or
   * not and either navigates to the next step or emits the enterDisabled event
   */
  next(): void {
    const nextStepIndex = this.selectedIndex + 1;

    if (
      this.selectedIndex < this._steps.length - 1 &&
      this._steps.toArray()[nextStepIndex].disabled
    ) {
      this.emit(this._steps.toArray()[nextStepIndex]);
    } else {
      super.next();
    }
  }

  /***
   * Is called when a cdkStepperPrevious button is clicked. It checks if the previous step is disabled or
   * not and either navigates to the previous step or emits the enterDisabled event
   */
  previous(): void {
    const previousStepIndex = this.selectedIndex - 1;
    if (this.selectedIndex > 0 && this._steps.toArray()[previousStepIndex].disabled) {
      this.emit(this._steps.toArray()[previousStepIndex]);
    } else {
      super.previous();
    }
  }

  /**
   * Helper function that prepares the data that is emitted through the enterDisabled event. The
   * data contains the current step and the step that is disabled
   *
   * @param nextStep Step that the stepper would navigate to, if it would not be disabled
   */
  emit(nextStep: CsdStepComponent) {
    const currentStep = this._steps.toArray()[this.selectedIndex];
    const emitObject = {
      currentStep: currentStep,
      nextStep: nextStep,
    };

    this.enterDisabled.emit(emitObject);
  }

  /***
   * changes the flex layout properties according to the orientation of the stepper (vertical or
   * horizontal)
   *
   * @param toHorizontal True if the Layout should be changed its horizontal State
   */
  changeLayout(toHorizontal: boolean) {
    if (toHorizontal) {
      this.CSD_STEPPER_FLEX_LAYOUT.STEPPER.LAYOUT = 'column';
      this.CSD_STEPPER_FLEX_LAYOUT.STEPPER.LAYOUT_ALIGN = 'start center';
      this.CSD_STEPPER_FLEX_LAYOUT.STEPPER.NAVIGATION.LAYOUT = 'row';
    } else {
      this.CSD_STEPPER_FLEX_LAYOUT.STEPPER.LAYOUT = 'row';
      this.CSD_STEPPER_FLEX_LAYOUT.STEPPER.LAYOUT_ALIGN = 'start start';
      this.CSD_STEPPER_FLEX_LAYOUT.STEPPER.NAVIGATION.LAYOUT = 'column';
    }
  }

  addStyleClass(step: CsdStepComponent, index: number): string {
    let styleClass = '';

    if (this.selectedIndex === index) {
      styleClass = 'csd-activated';
    } else if (step.hasError) {
      styleClass = 'csd-error';
    } else if (step.completed) {
      styleClass = 'csd-completed';
    }

    if (index + 1 === this._steps.length) {
      styleClass += ' csd-last';
    }

    return styleClass;
  }
}
