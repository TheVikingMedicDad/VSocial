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
import { CsdSnackbarService } from '../../features/csd-snackbar/csd-snackbar.service';
import { CsdCurrentUserService } from '../../auth/csd-current-user.service';
import { finalize } from 'rxjs/operators';
import { AuthCheckDialogData, AuthCheckInput, AuthMethod } from '../../auth/auth.types';
import { I18NextPipe } from 'angular-i18next';
import { UnsubscribeBaseComponent } from '../../shared/unsubscribe-base.component';
import { CsdInvalidCredentialsError, CsdNotAuthenticatedError } from '../../auth/auth.errors';

@Component({
  selector: 'csd-auth-check-dialog',
  templateUrl: './csd-auth-check-dialog.component.html',
  styleUrls: ['./csd-auth-check-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdAuthCheckDialogComponent extends UnsubscribeBaseComponent implements OnInit {
  static ACTIONS_TRANSLATION_BASEKEY = 'AUTH_CHECK_DIALOG.ACTIONS';
  formFieldAppearance: MatFormFieldAppearance = 'outline';
  checkPasswordForm: FormGroup;
  currentPasswordHidden = true;
  inProgress = false;
  translatedAction: string;

  constructor(
    private dialogRef: MatDialogRef<Component>,
    private formBuilder: FormBuilder,
    private csdSnackbarService: CsdSnackbarService,
    private csdCurrentUserService: CsdCurrentUserService,
    private changeDetectorRef: ChangeDetectorRef,
    private i18NextPipe: I18NextPipe,
    @Inject(MAT_DIALOG_DATA) public data: AuthCheckDialogData
  ) {
    super();
  }

  ngOnInit() {
    console.log('CsdAuthCheckDialogComponent.ngOnInit data: ', this.data);
    this.buildForm();
    this.addSubscription(
      this.csdCurrentUserService.getUser$().subscribe(
        (user) => {
          this.usernameForm.patchValue(user.email);
        },
        (error) => {
          this.csdSnackbarService.error();
        }
      )
    );
    this.translatedAction = this.i18NextPipe.transform(
      CsdAuthCheckDialogComponent.ACTIONS_TRANSLATION_BASEKEY + '.' + this.data.actionKey
    );
  }

  buildForm() {
    this.checkPasswordForm = this.formBuilder.group({
      username: [{ value: '', disabled: true }],
      currentPassword: ['', [Validators.required]],
    });
  }

  saveNewPassword(): void {
    // check validation
    if (!this.checkPasswordForm.valid) {
      this.checkPasswordForm.get('currentPassword').markAsTouched();
    } else {
      // try to authenticate
      this.inProgress = true;
      this.currentPasswordForm.disable();
      const authCheckInput: AuthCheckInput = {
        currentPassword: this.checkPasswordForm.value['currentPassword'],
        actionKey: this.data.actionKey,
      };

      this.csdCurrentUserService
        .authCheck$(AuthMethod.PASSWORD, authCheckInput)
        .pipe(
          finalize(() => {
            this.inProgress = false;
            this.currentPasswordForm.enable();
          })
        )
        .subscribe(
          (done) => {
            // Password Checked Successfully
            this.dialogRef.close(true);
          },
          (error) => {
            if (error instanceof CsdInvalidCredentialsError) {
              this.csdSnackbarService.error(
                'AUTH_CHECK_DIALOG.FORM.CURRENT_PASSWORD.ERROR.INVALID'
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

  get currentPasswordForm() {
    return this.checkPasswordForm.get('currentPassword');
  }

  get usernameForm() {
    return this.checkPasswordForm.get('username');
  }
}
