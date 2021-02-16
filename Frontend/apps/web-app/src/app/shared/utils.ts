import { Observable } from 'rxjs';
import { FormArray, ValidatorFn } from '@angular/forms';

export function camelCaseToSnakeCase(camelCase: string) {
  return camelCase
    .split(/(?=[A-Z])/)
    .join('_')
    .toLowerCase();
}

/**
 *  encapsulates the Browser built-in FileReader to an Observable function
 */
export function readFileAsDataURL$(file: File): Observable<string> {
  return Observable.create((obs) => {
    const reader = new FileReader();

    reader.onerror = (err) => obs.error(err);
    reader.onabort = (err) => obs.error(err);
    reader.onload = () => obs.next(reader.result);
    reader.onloadend = () => obs.complete();

    return reader.readAsDataURL(file);
  });
}

/**
 * From https://coryrylan.com/blog/creating-a-dynamic-checkbox-list-in-angular
 */
export function minSelectedCheckboxesValidator(min = 1) {
  const validator: ValidatorFn = (formArray: FormArray) => {
    const totalSelected = formArray.controls
      // get a list of checkbox values (boolean)
      .map((control) => control.value)
      // total up the number of checked checkboxes
      .reduce((prev, next) => (next ? prev + next : prev), 0);

    // if the total is not greater than the minimum, return the error message
    return totalSelected >= min ? null : { required: true };
  };

  return validator;
}
