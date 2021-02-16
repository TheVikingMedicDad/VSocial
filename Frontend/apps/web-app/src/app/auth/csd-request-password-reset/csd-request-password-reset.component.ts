import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CsdSnackbarService } from '../../features/csd-snackbar/csd-snackbar.service';
import { CsdValidationService } from '../../core/csd-validation.service';
import { UnsubscribeBaseComponent } from '../../shared/unsubscribe-base.component';
import { RequestPasswordResetInput } from '../auth.types';
import { CsdCurrentUserService } from '../csd-current-user.service';
import { CsdInvalidEmailError } from '../auth.errors';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'csd-request-password-reset',
  templateUrl: './csd-request-password-reset.component.html',
  styleUrls: ['./csd-request-password-reset.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdRequestPasswordResetComponent extends UnsubscribeBaseComponent implements OnInit {
  @Input() formFieldAppearance: MatFormFieldAppearance = 'outline';
  resetRequestForm: FormGroup;
  resetDone = false;
  inProgress = false;
  email: string;

  constructor(
    private formBuilder: FormBuilder,
    private csdSnackbarService: CsdSnackbarService,
    private csdCurrentUserService: CsdCurrentUserService
  ) {
    super();
  }

  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    this.resetRequestForm = this.formBuilder.group({
      email: ['', [Validators.required, CsdValidationService.emailValidator]],
    });
  }

  onSubmit() {
    // check validation
    if (!this.resetRequestForm.valid) {
      this.resetRequestForm.get('email').markAsTouched();
      this.csdSnackbarService.error(
        'USER_REQUEST_PASSWORD_RESET.FORM.ERROR.INVALID_FORM_DATA',
        'snackbar-error-invalid-email'
      );
    } else {
      // create reset request
      this.inProgress = true;
      this.resetRequestForm.disable();
      this.email = this.resetRequestForm.value['email'];

      const requestPasswordResetInput: RequestPasswordResetInput = {
        email: this.email,
      };
      this.csdCurrentUserService
        .requestPasswordReset$(requestPasswordResetInput)
        .pipe(
          finalize(() => {
            this.inProgress = false;
            this.resetRequestForm.enable();
          })
        )
        .subscribe(
          (response) => {
            this.resetDone = true;
          },
          (error) => {
            this.resetDone = false;
            if (error instanceof CsdInvalidEmailError) {
              this.csdSnackbarService.error('USER_REQUEST_PASSWORD_RESET.FORM.ERROR.INVALID_EMAIL');
            } else {
              this.csdSnackbarService.error();
            }
          }
        );
    }
  }

  get emailForm() {
    return this.resetRequestForm.get('email');
  }
}
