import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CsdCurrentUserService } from '../csd-current-user.service';
import { I18NextPipe } from 'angular-i18next';
import { CsdSnackbarService } from '../../features/csd-snackbar/csd-snackbar.service';
import { PATH_APP_ENTRY_PAGE } from '../../core/constants/router.constants';
import { ConfirmAccountInfo, ConfirmEmailInput } from '../auth.types';
import { finalize } from 'rxjs/operators';
import { UnsubscribeBaseComponent } from '../../shared/unsubscribe-base.component';
import { MatFormFieldAppearance } from '@angular/material/form-field';

@Component({
  selector: 'csd-user-confirm-account',
  templateUrl: './csd-user-confirm-account.component.html',
  styleUrls: ['./csd-user-confirm-account.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdUserConfirmAccountComponent extends UnsubscribeBaseComponent implements OnInit {
  @Input() formFieldAppearance: MatFormFieldAppearance = 'outline';
  @Input() confirmationToken: string;
  inProgress = true;

  accountSettingsForm: FormGroup;
  interests: string[];
  salutations: string[];
  countries: string[];
  entryPageUrl = PATH_APP_ENTRY_PAGE;
  succeeded = false;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private csdCurrentUserService: CsdCurrentUserService,
    private changeDetectorRef: ChangeDetectorRef,
    private i18NextPipe: I18NextPipe,
    private formBuilder: FormBuilder,
    private csdSnackbarService: CsdSnackbarService
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
    this.accountSettingsForm.disable();
    const confirmInput: ConfirmEmailInput = {
      key: this.confirmationToken,
    };
    this.addSubscription(
      this.csdCurrentUserService.confirmEmail$(confirmInput).subscribe(
        () => {
          console.log('CsdUserConfirmAccountPageComponent.ngOnInit: confirmation succeeded');
          this.accountSettingsForm.enable();
          this.inProgress = false;
          this.changeDetectorRef.markForCheck();
        },
        (error) => {
          this.inProgress = false;
          this.error = true;
          console.log('CsdUserConfirmAccountPageComponent.ngOnInit: confirmation FAILED');
          this.changeDetectorRef.markForCheck();
        }
      )
    );
  }

  buildForm() {
    this.accountSettingsForm = this.formBuilder.group({
      salutation: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      country: ['', [Validators.required]],
      interests: this.formBuilder.array([]),
    });

    this.interests.forEach((interest) => {
      console.log('CsdUserConfirmAccountPageComponent.buildForm interest: ', interest);
      this.interestsForm.push(new FormControl(false));
    });
  }

  onSubmit() {
    // check validation
    if (!this.accountSettingsForm.valid) {
      this.accountSettingsForm.get('salutation').markAsTouched();
      this.accountSettingsForm.get('firstName').markAsTouched();
      this.accountSettingsForm.get('lastName').markAsTouched();
      this.accountSettingsForm.get('country').markAsTouched();
      this.csdSnackbarService.error(
        'ACCOUNT_SETTINGS.PERSONAL_INFORMATION.FORM.ERROR.INVALID_FORM_DATA',
        'snackbar-error-invalid-data'
      );
    } else {
      this.inProgress = true;
      this.accountSettingsForm.disable();

      const accountInfo: ConfirmAccountInfo = {
        firstName: this.firstNameForm.value,
        lastName: this.lastNameForm.value,
        salutation: this.salutationForm.value,
        country: this.countryForm.value,
        interests: this.interests.filter((x, i) => !!this.interestsForm.value[i]),
      };

      this.csdCurrentUserService
        .confirmAccount$(this.confirmationToken, accountInfo)
        .pipe(
          finalize(() => {
            this.inProgress = false;
            this.accountSettingsForm.enable();
          })
        )
        .subscribe(
          (done) => {
            this.succeeded = true;
          },
          (error) => {
            if (error.id === 'INVALID_TOKEN_ERROR') {
              this.csdSnackbarService.error(
                'USER_CONFIRM_ACCOUNT_PAGE.ACCOUNT_CONFIRMATION_TOKEN_INVALID'
              );
            } else {
              this.csdSnackbarService.error();
            }
          }
        );
    }
  }

  get firstNameForm() {
    return this.accountSettingsForm.get('firstName');
  }

  get lastNameForm() {
    return this.accountSettingsForm.get('lastName');
  }

  get salutationForm() {
    return this.accountSettingsForm.get('salutation');
  }

  get countryForm() {
    return this.accountSettingsForm.get('country');
  }

  get interestsForm() {
    return this.accountSettingsForm.get('interests') as FormArray;
  }
}
