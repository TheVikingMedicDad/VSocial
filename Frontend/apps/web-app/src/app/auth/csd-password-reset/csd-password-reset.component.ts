import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CsdSnackbarService } from '../../features/csd-snackbar/csd-snackbar.service';
import { CsdCurrentUserService } from '../csd-current-user.service';
import { CsdValidationService } from '../../core/csd-validation.service';
import { UnsubscribeBaseComponent } from '../../shared/unsubscribe-base.component';
import { PATH_LOGIN_SHORTCUT } from '../../core/constants/router.constants';
import { ResetPasswordInput } from '../auth.types';
import { finalize } from 'rxjs/operators';
import { CsdInvalidTokenError } from '../auth.errors';

@Component({
  selector: 'csd-password-reset',
  templateUrl: './csd-password-reset.component.html',
  styleUrls: ['./csd-password-reset.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdPasswordResetComponent extends UnsubscribeBaseComponent implements OnInit {
  @Input() formFieldAppearance: MatFormFieldAppearance = 'outline';
  @Input() resetToken: string;
  passwordHidden = true;
  passwordResetForm: FormGroup;
  resetDone = false;
  inProgress = false;
  loginUrl = PATH_LOGIN_SHORTCUT;

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private csdSnackbarService: CsdSnackbarService,
    private csdCurrentUserService: CsdCurrentUserService
  ) {
    super();
  }

  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    this.passwordResetForm = this.formBuilder.group(
      {
        password: ['', [Validators.required, CsdValidationService.passwordValidator]],
        confirmPassword: ['', [Validators.required, CsdValidationService.passwordValidator]],
      },
      {
        validator: CsdValidationService.mustMatchValidator('password', 'confirmPassword'),
      }
    );
  }

  onSubmit() {
    console.log(this.passwordResetForm);
    // check validation
    if (!this.passwordResetForm.valid) {
      this.passwordResetForm.get('password').markAsTouched();
      this.csdSnackbarService.error(
        'USER_PASSWORD_RESET.FORM.ERROR.INVALID_FORM_DATA',
        'snackbar-error-invalid-password'
      );
    } else {
      // try to reset the password
      this.inProgress = true;
      this.passwordResetForm.disable();
      const password = this.passwordResetForm.value['password'];

      const resetPasswordInput: ResetPasswordInput = {
        resetToken: this.resetToken,
        newPassword: password,
      };

      this.csdCurrentUserService
        .passwordReset$(resetPasswordInput)
        .pipe(
          finalize(() => {
            this.inProgress = false;
            this.passwordResetForm.enable();
          })
        )
        .subscribe(
          (response) => {
            this.resetDone = true;
          },
          (error) => {
            this.resetDone = false;
            if (error instanceof CsdInvalidTokenError) {
              this.csdSnackbarService.error('USER_PASSWORD_RESET.FORM.ERROR.INVALID_TOKEN');
            } else {
              this.csdSnackbarService.error();
            }
          }
        );
    }
  }

  get passwordForm() {
    return this.passwordResetForm.get('password');
  }
}
