import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'csd-form-control-overview',
  templateUrl: './csd-form-control-overview.component.html',
  styleUrls: ['./csd-form-control-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdFormControlOverviewComponent implements OnInit {
  testFormOne: FormGroup;
  seasons: string[] = ['Winter', 'Spring', 'Summer', 'Autumn'];

  constructor(private formBuilder: FormBuilder) {
    this.testFormOne = formBuilder.group({
      formFieldOne: [''],
      formFieldInvalidState: new FormControl('', [(control) => ({ invalid: true })]),
      disabledInput: [{ value: '', disabled: true }],
      inputWithSomeValue: new FormControl('already some value in it'),
      languageSelect: new FormControl(),
      languageSelectDisabled: [{ value: '', disabled: true }],
      languageSelectInErrorState: ['', (control) => ({ invalid: true })],
    });
  }

  ngOnInit() {
    this.formFieldInvalidStateControl.updateValueAndValidity();
    this.formFieldInvalidStateControl.markAsTouched();
    this.languageSelectInErrorState.markAsTouched();
  }

  get formFieldInvalidStateControl(): FormControl {
    return this.testFormOne.get('formFieldInvalidState') as FormControl;
  }

  get languageSelectInErrorState(): FormControl {
    return this.testFormOne.get('languageSelectInErrorState') as FormControl;
  }

  doNothing() {}
}
