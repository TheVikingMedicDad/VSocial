import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnChanges,
  SimpleChanges,
  SimpleChange,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import { I18NextPipe } from 'angular-i18next';

@Component({
  selector: 'csd-address-child-form',
  templateUrl: './csd-address-child-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdAddressChildFormComponent implements OnChanges {
  // @Input() parentForm: FormGroup;
  @Input() formFieldAppearance: MatFormFieldAppearance = 'outline';
  @Input() modelForm: FormGroup = null;
  @Input() parentForm: FormGroup = null;

  countries: string[];

  constructor(private formBuilder: FormBuilder, private i18NextPipe: I18NextPipe) {
    this.modelForm = formBuilder.group({
      addressLine1: [''],
      addressLine2: [''],
      region: [''],
      city: [''],
      zipCode: [''],
      country: [''],
    });
    this.countries = Object.keys(
      this.i18NextPipe.transform('COUNTRY_SELECTOR.OPTIONS', { returnObjects: true })
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('parentForm' in changes) {
      const parentFormChange = changes.parentForm as SimpleChange;
      if (parentFormChange.firstChange) {
        this.parentForm.addControl('address', this.modelForm);
      }
    }
  }
}
