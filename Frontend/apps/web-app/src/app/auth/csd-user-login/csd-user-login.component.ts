import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { CsdValidationService } from '../../core/csd-validation.service';
import { UnsubscribeBaseComponent } from '../../shared/unsubscribe-base.component';
import { CsdSnackbarService } from '../../features/csd-snackbar/csd-snackbar.service';
import { CsdCurrentUserService } from '../csd-current-user.service';
import { finalize, filter, tap, catchError } from 'rxjs/operators';
import { PATH_REGISTER, PATH_REQUEST_PASSWORD_RESET } from '../../core/constants/router.constants';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import { LoginUserInput } from '../auth.types';
import { CsdInvalidCredentialsError } from '../auth.errors';
import { MatDialog } from '@angular/material/dialog';
import { CsdRequestPasswordResetComponent } from '../csd-request-password-reset/csd-request-password-reset.component';

@Component({
  selector: 'csd-user-login',
  templateUrl: './csd-user-login.component.html',
  styleUrls: ['./csd-user-login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdUserLoginComponent extends UnsubscribeBaseComponent implements OnInit {
  @Input() formFieldAppearance: MatFormFieldAppearance = 'outline';
  @Input() queryParams;
  @Input() resetPasswordUrl = PATH_REQUEST_PASSWORD_RESET;
  @Input() registerUrl = `/${PATH_REGISTER}`;
  @Output() loginSuccess = new EventEmitter<void>();

  appName = 'VSocial';
  loginForm: FormGroup;
  formErrors: any = {};
  loginFailed = false;
  loginDone = false;
  loginInProgress = false;
  passwordHidden = true;
  target: string;
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
    private csdSnackbarService: CsdSnackbarService,
    private csdCurrentUserService: CsdCurrentUserService,
    private matDialog: MatDialog
  ) {
    super();
  }

  ngOnInit(): void {
    // subscribe to the token observable to react to a successful login
    this.addSubscription(
      this.csdCurrentUserService
        .getAuthenticationToken$()
        .pipe(
          filter((token) => token !== null),
          tap((token) => {
            // Login Succeeded
            this.loginDone = true;
            this.loginFailed = false;
            this.loginSuccess.emit();
          })
        )
        .subscribe()
    );

    this.buildForm();
  }

  forgotPassword() {
    this.matDialog.open(CsdRequestPasswordResetComponent, {});
  }

  buildForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, CsdValidationService.emailValidator]],
      password: ['', [Validators.required]],
    });

    this.addSubscription(
      this.loginForm.valueChanges
        .pipe
        //this.csdSnackbarService.catchError()
        ()
        .subscribe(() => {
          //this.formErrors = this.getFormValidationErrors();
        })
    );
  }

  getFormValidationErrors() {
    console.log('--- NEW ERRORS ---');
    Object.keys(this.loginForm.controls).forEach((key) => {
      const controlErrors: ValidationErrors = this.loginForm.get(key).errors;
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

  onSubmit() {
    // check validation
    if (!this.loginForm.valid) {
      this.loginForm.get('email').markAsTouched();
      this.loginForm.get('password').markAsTouched();
      this.csdSnackbarService.error(
        'USER_LOGIN.FORM.ERROR.INVALID_FORM_DATA',
        'snackbar-error-correct-credentials'
      );
    } else {
      // try to authenticate
      this.loginFailed = false;
      this.loginInProgress = true;
      this.loginForm.disable();
      const userLoginData: LoginUserInput = {
        email: this.loginForm.value['email'],
        password: this.loginForm.value['password'],
        //lang: this.selectedLanguageService.language.languageKey
      };

      this.csdCurrentUserService
        .login$(userLoginData)
        .pipe(
          finalize(() => {
            this.loginInProgress = false;
            this.loginForm.enable();
          }),
          catchError((e) => {
            throw e;
          })
        )
        .subscribe(
          () => null,
          (error) => {
            console.log('CsdUserLoginComponent.onSubmit: Error: CsdInvalidCredentialsError');
            if (error instanceof CsdInvalidCredentialsError) {
              this.csdSnackbarService.error('USER_LOGIN.FORM.ERROR.INVALID_CREDENTIALS');
            } else {
              this.csdSnackbarService.error(error.message);
            }
            this.loginFailed = true;
            this.loginDone = false;
          }
        );
    }
  }

  get emailForm(): AbstractControl {
    return this.loginForm.get('email');
  }

  get passwordForm(): AbstractControl {
    return this.loginForm.get('password');
  }
}
