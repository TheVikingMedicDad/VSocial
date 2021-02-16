import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { EMAIL_REGEX, PASSWORD_REGEX } from './constants/form.constants';

@Injectable()
export class CsdValidationService {
  static emailValidator(control: FormControl) {
    if (!control.value || !control.value.match(EMAIL_REGEX)) {
      return {
        invalid: true,
      };
    } else {
      return null;
    }
  }

  static mustMatchValidator(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && !matchingControl.errors.mustMatch) {
        // return if another validator has already found an error on the matchingControl
        return;
      }

      // set error on matchingControl if validation fails
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }

  static passwordValidator(control: FormControl) {
    if (!control.value || !control.value.match(PASSWORD_REGEX)) {
      return {
        invalid: true,
      };
    } else {
      return null;
    }
  }
}
