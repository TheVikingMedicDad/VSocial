import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { CsdSnackbarService } from '../../features/csd-snackbar/csd-snackbar.service';
import { CsdCurrentUserService } from '../../auth/csd-current-user.service';
import { finalize } from 'rxjs/operators';
import { I18NextPipe } from 'angular-i18next';
import { BiEvent } from '../../features/csd-bi/csd-bi.types';
import { CsdBiService } from '../../features/csd-bi/csd-bi.service';

@Component({
  selector: 'csd-delete-account-dialog',
  templateUrl: './csd-delete-account-dialog.component.html',
  styleUrls: ['./csd-delete-account-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdDeleteAccountDialogComponent implements OnInit {
  formFieldAppearance: MatFormFieldAppearance = 'outline';
  deleteAccountForm: FormGroup;
  inProgress = false;

  constructor(
    private i18NextPipe: I18NextPipe,
    private dialogRef: MatDialogRef<Component>,
    private formBuilder: FormBuilder,
    private csdSnackbarService: CsdSnackbarService,
    private csdCurrentUserService: CsdCurrentUserService,
    private csdBiService: CsdBiService
  ) {}

  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    const confirmationTextTranslated = this.i18NextPipe.transform(
      'DELETE_ACCOUNT_DIALOG.FORM.CONFIRMATION_TEXT.VALUE'
    );
    this.deleteAccountForm = this.formBuilder.group({
      confirmationText: [
        '',
        [Validators.required, this.equalityValidator(confirmationTextTranslated)],
      ],
    });
  }

  equalityValidator(equalString: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const equals = equalString.toLowerCase() === control.value.toLowerCase();
      return equals ? null : { unequal: true };
    };
  }

  deleteAccount(): void {
    // check validation
    if (!this.deleteAccountForm.valid) {
      this.confirmationTextForm.markAsTouched();
    } else {
      // try to authenticate
      this.inProgress = true;
      this.deleteAccountForm.disable();

      this.csdCurrentUserService
        .deleteAccount$()
        .pipe(
          finalize(() => {
            this.inProgress = false;
            this.deleteAccountForm.enable();
          })
        )
        .subscribe(
          () => {
            this.csdBiService.logEvent(BiEvent.USER_ACCOUNT_DELETED);
            document.location.reload();
          },
          (error) => this.csdSnackbarService.error()
        );
    }
  }

  get confirmationTextForm() {
    return this.deleteAccountForm.get('confirmationText');
  }
}
