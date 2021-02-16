import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { UnsubscribeBaseComponent } from '../../shared/unsubscribe-base.component';
import { CsdValidationService } from '../../core/csd-validation.service';
import { CsdSnackbarService } from '../../features/csd-snackbar/csd-snackbar.service';
import { finalize } from 'rxjs/operators';
import { CsdCurrentUserService } from '../csd-current-user.service';
import { ActivatedRoute, Params } from '@angular/router';
import { PATH_LOGIN } from '../../core/constants/router.constants';
import { I18NEXT_SERVICE, ITranslationService } from 'angular-i18next';
import { RegisterUserInput } from '../auth.types';
import { CsdDuplicateEmailError } from '../auth.errors';
import { BiEvent } from '../../features/csd-bi/csd-bi.types';
import { CsdBiService } from '../../features/csd-bi/csd-bi.service';

@Component({
  selector: 'csd-user-register',
  templateUrl: './csd-user-register.component.html',
  styleUrls: ['./csd-user-register.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdUserRegisterComponent extends UnsubscribeBaseComponent implements OnInit {
  @Input() formFieldAppearance: MatFormFieldAppearance = 'outline';
  @Input() queryParams;
  @Input() loginUrl = PATH_LOGIN;
  @Output() registerSuccess = new EventEmitter<void>();

  appName = 'VSocial';
  passwordHidden = true;
  registerForm: FormGroup;
  formErrors: any = {};
  registerFailed = false;
  registerDone = false;
  registerInProgress = false;
  language = 'en';
  carouselItems = [
    {
      title: 'LOGIN_CAROUSEL.ITEM_1.TITLE',
      imageSrc: '/assets/images/item_1.svg',
      description: 'LOGIN_CAROUSEL.ITEM_1.DESCRIPTION',
    },
    {
      title: 'LOGIN_CAROUSEL.ITEM_2.TITLE',
      imageSrc: '/assets/images/item_2.svg',
      description: 'LOGIN_CAROUSEL.ITEM_2.DESCRIPTION',
    },
    {
      title: 'LOGIN_CAROUSEL.ITEM_3.TITLE',
      imageSrc: '/assets/images/item_3.svg',
      description: 'LOGIN_CAROUSEL.ITEM_3.DESCRIPTION',
    },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private csdSnackbarService: CsdSnackbarService,
    private csdCurrentUserService: CsdCurrentUserService,
    private csdBiService: CsdBiService,
    @Inject(I18NEXT_SERVICE) private i18NextService: ITranslationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.buildForm();
    // get selected language from i18Next Service:
    this.addSubscription(
      this.i18NextService.events.initialized.subscribe((event) => {
        if (event) {
          this.language = this.i18NextService.language;
        }
      })
    );
  }

  buildForm(): void {
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, CsdValidationService.emailValidator]],
      password: ['', [Validators.required, CsdValidationService.passwordValidator]],
      terms: ['', [Validators.required]],
    });

    this.addSubscription(
      this.registerForm.valueChanges
        .pipe
        //this.csdSnackbarService.catchError()
        ()
        .subscribe(() => {
          //this.formErrors = this.getFormValidationErrors();
        })
    );
  }

  getFormValidationErrors(): void {
    console.log('--- NEW ERRORS ---');
    Object.keys(this.registerForm.controls).forEach((key) => {
      const controlErrors: ValidationErrors = this.registerForm.get(key).errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach((keyError) => {
          console.log(
            'Key control: ' + key + ', keyError: ' + keyError + ', err value: ',
            controlErrors[keyError]
          );
        });
      }
    });
  }

  onSubmit(): void {
    // check validation
    if (!this.registerForm.valid || !this.registerForm.value['terms']) {
      this.registerForm.get('email').markAsTouched();
      this.registerForm.get('password').markAsTouched();
      this.registerForm.get('terms').markAsTouched();
      this.csdSnackbarService.error(
        'USER_REGISTER.FORM.ERROR.INVALID_FORM_DATA',
        'snackbar-error-correct-credentials'
      );
    } else {
      // try to authenticate
      this.registerFailed = false;
      this.registerInProgress = true;
      this.registerForm.disable();

      const userRegisterData: RegisterUserInput = {
        email: this.registerForm.value['email'],
        password: this.registerForm.value['password'],
        language: this.language,
      };

      this.csdCurrentUserService
        .register$(userRegisterData)
        .pipe(
          finalize(() => {
            this.registerInProgress = false;
            this.registerForm.enable();
          })
        )
        .subscribe(
          (done) => {
            // Register Succeeded
            this.registerDone = true;
            this.registerFailed = false;
            this.registerSuccess.emit();
            this.csdBiService.logEvent(BiEvent.SIGNUP, {
              email: userRegisterData.email,
              language: userRegisterData.language,
            });
          },
          (error) => {
            this.registerFailed = true;
            this.registerDone = false;
            if (error instanceof CsdDuplicateEmailError) {
              this.csdSnackbarService.error('USER_REGISTER.FORM.ERROR.DUPLICATE_EMAIL');
            } else {
              this.csdSnackbarService.error();
            }
          }
        );
    }
  }

  get emailForm(): AbstractControl {
    return this.registerForm.get('email');
  }

  get passwordForm(): AbstractControl {
    return this.registerForm.get('password');
  }

  get termsForm(): AbstractControl {
    return this.registerForm.get('terms');
  }
}
