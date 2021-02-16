import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UnsubscribeBaseComponent } from '../../shared/unsubscribe-base.component';
import { CsdCurrentUserService } from '../../auth/csd-current-user.service';
import { filter, finalize } from 'rxjs/operators';
import { CsdSnackbarService } from '../../features/csd-snackbar/csd-snackbar.service';
import { AuthCheckActions, User } from '../../auth/auth.types';
import { CsdValidationService } from '../../core/csd-validation.service';
import { Location } from '@angular/common';
import { I18NextPipe } from 'angular-i18next';
import { CsdChangePasswordDialogComponent } from '../../core/csd-change-password-dialog/csd-change-password-dialog.component';
import { CsdAuthCheckService } from '../../core/csd-auth-check-dialog/csd-auth-check.service';
import { CsdDeleteAccountDialogComponent } from '../../core/csd-delete-account-dialog/csd-delete-account-dialog.component';
import { CsdChangeEmailDialogComponent } from '../../core/csd-change-email-dialog/csd-change-email-dialog.component';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import { LANGUAGES } from '../../core/constants/general.constants';
import { CsdBiService } from '../../features/csd-bi/csd-bi.service';
import { BiEvent } from '../../features/csd-bi/csd-bi.types';

@Component({
  selector: 'csd-account-settings',
  templateUrl: './csd-account-settings.component.html',
  styleUrls: ['./csd-account-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdAccountSettingsComponent extends UnsubscribeBaseComponent implements OnInit {
  @Input() formFieldAppearance: MatFormFieldAppearance = 'outline';
  accountSettingsForm: FormGroup;
  salutations: string[];
  languages = LANGUAGES;
  inProgress = false;
  user: User;
  interests: string[];
  countries: string[];

  constructor(
    private i18NextPipe: I18NextPipe,
    private formBuilder: FormBuilder,
    private csdCurrentUserService: CsdCurrentUserService,
    private csdAuthCheckService: CsdAuthCheckService,
    private csdSnackbarService: CsdSnackbarService,
    private location: Location,
    private changeDetectorRef: ChangeDetectorRef,
    private csdBiService: CsdBiService
  ) {
    super();
  }

  ngOnInit() {
    this.interests = Object.keys(
      this.i18NextPipe.transform('MODEL.USER.INTERESTS.OPTIONS', { returnObjects: true })
    );
    this.salutations = Object.keys(
      this.i18NextPipe.transform('ACCOUNT_SETTINGS.PERSONAL_INFORMATION.FORM.SALUTATION.OPTIONS', {
        returnObjects: true,
      })
    );
    this.countries = Object.keys(
      this.i18NextPipe.transform('COUNTRY_SELECTOR.OPTIONS', { returnObjects: true })
    );

    this.buildForm();

    this.addSubscription(
      this.csdCurrentUserService
        .getUser$()
        .pipe(filter((user) => !!user))
        .subscribe(
          (user) => {
            this.user = user;
            this.emailForm.setValue(this.user.email);
            this.firstNameForm.setValue(this.user.firstName);
            this.lastNameForm.setValue(this.user.lastName);
            this.salutationForm.setValue(this.user.salutation);
            this.languageForm.setValue(this.user.language);
            this.countryForm.setValue(this.user.country);
            this.interests.forEach((interest, i) => {
              this.interestsForm.at(i).setValue(this.user.interests.includes(interest));
            });
            this.changeDetectorRef.markForCheck();
          },
          (error) => this.csdSnackbarService.error(error)
        )
    );

    this.csdBiService.logEvent(BiEvent.VIEWED_ACCOUNT_SETTINGS);
  }

  buildForm() {
    this.accountSettingsForm = this.formBuilder.group({
      salutation: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      language: ['', [Validators.required]],
      country: ['', [Validators.required]],
      email: ['', [Validators.required, CsdValidationService.emailValidator]],
      interests: this.formBuilder.array([]),
    });

    this.interests.forEach((interest) => {
      this.interestsForm.push(new FormControl(false));
    });
  }

  saveUserSettings() {
    // check validation
    if (!this.accountSettingsForm.valid) {
      this.accountSettingsForm.get('salutation').markAsTouched();
      this.accountSettingsForm.get('email').markAsTouched();
      this.accountSettingsForm.get('firstName').markAsTouched();
      this.accountSettingsForm.get('lastName').markAsTouched();
      this.accountSettingsForm.get('language').markAsTouched();
      this.accountSettingsForm.get('country').markAsTouched();
      this.csdSnackbarService.error(
        'ACCOUNT_SETTINGS.PERSONAL_INFORMATION.FORM.ERROR.INVALID_FORM_DATA',
        'snackbar-error-invalid-data'
      );
    } else {
      this.inProgress = true;
      this.accountSettingsForm.disable();
      const modifiedUser = {
        ...this.user,
        email: this.emailForm.value,
        firstName: this.firstNameForm.value,
        lastName: this.lastNameForm.value,
        salutation: this.salutationForm.value,
        language: this.languageForm.value,
        country: this.countryForm.value,
        interests: this.interests.filter((x, i) => !!this.interestsForm.value[i]),
      };

      this.csdCurrentUserService
        .update$(modifiedUser)
        .pipe(
          finalize(() => {
            this.inProgress = false;
            this.accountSettingsForm.enable();
          })
        )
        .subscribe(
          (done) => {
            this.csdSnackbarService.success('ACCOUNT_SETTINGS.PERSONAL_INFORMATION.FORM.SAVED');
          },
          (error) => {
            if ((error.id = 'NETWORK_ERROR')) {
              this.csdSnackbarService.error(error.message);
            } else {
              this.csdSnackbarService.error('network error');
            }
          }
        );
    }
  }

  get emailForm() {
    return this.accountSettingsForm.get('email');
  }

  get firstNameForm() {
    return this.accountSettingsForm.get('firstName');
  }

  get lastNameForm() {
    return this.accountSettingsForm.get('lastName');
  }

  get languageForm() {
    return this.accountSettingsForm.get('language');
  }

  get countryForm() {
    return this.accountSettingsForm.get('country');
  }

  get salutationForm() {
    return this.accountSettingsForm.get('salutation');
  }

  get interestsForm() {
    return this.accountSettingsForm.get('interests') as FormArray;
  }

  cancel() {
    this.location.back();
  }

  changeEmail() {
    const oldEmail = this.user.email;
    this.csdAuthCheckService
      .openDialogAfterAuthCheck(CsdChangeEmailDialogComponent, AuthCheckActions.CHANGE_EMAIL)
      .subscribe(
        (result) => {
          if (result) {
            this.csdSnackbarService.success('ACCOUNT_SETTINGS.CHANGE_EMAIL.REQUEST_SUCCESS');
          }
        },
        (error) => this.csdSnackbarService.error()
      );
  }

  changePassword() {
    this.csdAuthCheckService
      .openDialogAfterAuthCheck(CsdChangePasswordDialogComponent, AuthCheckActions.CHANGE_PASSWORD)
      .subscribe(
        (result) => {
          if (result) {
            this.csdSnackbarService.success('ACCOUNT_SETTINGS.CHANGE_PASSWORD.SUCCESS');
            this.csdBiService.logEvent(BiEvent.USER_PASSWORD_CHANGED);
          }
        },
        (error) => this.csdSnackbarService.error()
      );
  }

  deleteAccount() {
    this.csdAuthCheckService
      .openDialogAfterAuthCheck(CsdDeleteAccountDialogComponent, AuthCheckActions.DELETE_ACCOUNT)
      .subscribe(
        (result) => {
          if (result) {
            // should never come here because a reload should be triggered
          } else {
            // in case the user clicks cancel
          }
        },
        (error) => this.csdSnackbarService.error()
      );
  }
}
