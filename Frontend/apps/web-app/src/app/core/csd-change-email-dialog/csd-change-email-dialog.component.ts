import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CsdSnackbarService } from '../../features/csd-snackbar/csd-snackbar.service';
import { CsdCurrentUserService } from '../../auth/csd-current-user.service';
import { CsdValidationService } from '../csd-validation.service';
import { finalize } from 'rxjs/operators';
import {
  CsdDuplicateEmailError,
  CsdNotAuthenticatedError,
  CsdPermissionDeniedError,
} from '../../auth/auth.errors';
import { RequestEmailChangeInput } from '../../auth/auth.types';

@Component({
  selector: 'csd-change-email-dialog',
  templateUrl: './csd-change-email-dialog.component.html',
  styleUrls: ['./csd-change-email-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdChangeEmailDialogComponent implements OnInit {
  formFieldAppearance: MatFormFieldAppearance = 'outline';
  changeEmailForm: FormGroup;
  inProgress = false;
  requestSent = false;
  newEmail = '';

  constructor(
    private dialogRef: MatDialogRef<Component>,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private csdSnackbarService: CsdSnackbarService,
    private csdCurrentUserService: CsdCurrentUserService
  ) {}

  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    this.changeEmailForm = this.formBuilder.group({
      newEmail: ['', [Validators.required, CsdValidationService.emailValidator]],
    });
  }

  requestEmailChange(): void {
    // check validation
    if (!this.changeEmailForm.valid) {
      this.changeEmailForm.get('newEmail').markAsTouched();
    } else {
      // try to authenticate
      this.inProgress = true;
      this.changeEmailForm.disable();
      this.newEmail = this.changeEmailForm.value['newEmail'];

      const requestEmailChangeInput: RequestEmailChangeInput = {
        newEmail: this.newEmail,
      };

      this.csdCurrentUserService.requestEmailChange$(requestEmailChangeInput).subscribe(
        () => {
          this.inProgress = false;
          this.changeEmailForm.enable();
          this.requestSent = true;
        },
        (error) => {
          this.inProgress = false;
          this.changeEmailForm.enable();
          if (error instanceof CsdDuplicateEmailError) {
            this.csdSnackbarService.error('CHANGE_EMAIL_DIALOG.FORM.EMAIL.ERROR.DUPLICATE');
          } else if (error.id instanceof CsdPermissionDeniedError) {
            this.csdSnackbarService.error('CHANGE_EMAIL_DIALOG.FORM.EMAIL.ERROR.PERMISSION');
          } else if (error.id instanceof CsdNotAuthenticatedError) {
            this.csdCurrentUserService.setAuthenticationToken(null);
            document.location.reload();
          } else {
            this.csdSnackbarService.error();
          }
        }
      );
    }
  }

  get newEmailForm() {
    return this.changeEmailForm.get('newEmail');
  }
}
