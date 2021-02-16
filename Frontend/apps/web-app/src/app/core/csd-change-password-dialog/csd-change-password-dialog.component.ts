import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CsdValidationService } from '../csd-validation.service';
import { CsdCurrentUserService } from '../../auth/csd-current-user.service';
import { CsdSnackbarService } from '../../features/csd-snackbar/csd-snackbar.service';
import { CsdChangePasswordDialogData } from './csd-change-password-dialog.types';
import { ChangePasswordInput } from '../../auth/auth.types';
import { finalize } from 'rxjs/operators';
import {
  CsdInvalidCredentialsError,
  CsdNotAuthenticatedError,
  CsdPermissionDeniedError,
} from '../../auth/auth.errors';

@Component({
  selector: 'csd-change-password-dialog',
  templateUrl: './csd-change-password-dialog.component.html',
  styleUrls: ['./csd-change-password-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdChangePasswordDialogComponent implements OnInit {
  formFieldAppearance: MatFormFieldAppearance = 'outline';
  changePasswordForm: FormGroup;
  newPasswordHidden = true;
  inProgress = false;

  constructor(
    private dialogRef: MatDialogRef<Component>,
    private formBuilder: FormBuilder,
    private csdSnackbarService: CsdSnackbarService,
    private csdCurrentUserService: CsdCurrentUserService,
    @Inject(MAT_DIALOG_DATA) public data: CsdChangePasswordDialogData
  ) {}

  ngOnInit() {
    this.buildForm();
    console.log('CsdChangePasswordDialogComponent.ngOnInit: data:', this.data);
  }

  buildForm() {
    this.changePasswordForm = this.formBuilder.group({
      newPassword: ['', [Validators.required, CsdValidationService.passwordValidator]],
    });
  }

  saveNewPassword(): void {
    // check validation
    if (!this.changePasswordForm.valid) {
      this.changePasswordForm.get('newPassword').markAsTouched();
    } else {
      // try to authenticate
      this.inProgress = true;
      this.changePasswordForm.disable();
      const newPassword = this.changePasswordForm.value['newPassword'];

      const changePasswordInput: ChangePasswordInput = {
        newPassword: newPassword,
      };

      this.csdCurrentUserService
        .changePassword$(changePasswordInput)
        .pipe(
          finalize(() => {
            this.inProgress = false;
            this.changePasswordForm.enable();
          })
        )
        .subscribe(
          (response) => {
            this.dialogRef.close(true);
          },
          (error) => {
            if (error instanceof CsdInvalidCredentialsError) {
              this.csdSnackbarService.error(
                'CHANGE_PASSWORD_DIALOG.FORM.CURRENT_PASSWORD.ERROR.INVALID'
              );
            } else if (error instanceof CsdPermissionDeniedError) {
              this.csdSnackbarService.error(
                'CHANGE_PASSWORD_DIALOG.FORM.CURRENT_PASSWORD.ERROR.PERMISSION'
              );
            } else if (error instanceof CsdNotAuthenticatedError) {
              this.csdCurrentUserService.setAuthenticationToken(null);
              document.location.reload();
            } else {
              this.csdSnackbarService.error();
            }
          }
        );
    }
  }

  get newPasswordForm() {
    return this.changePasswordForm.get('newPassword');
  }
}
