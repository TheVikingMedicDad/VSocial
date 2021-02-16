import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  ChangeDetectorRef,
} from '@angular/core';
import { UnsubscribeBaseComponent } from '../../shared/unsubscribe-base.component';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'csd-select-page',
  templateUrl: './csd-select-page.component.html',
  styleUrls: ['./csd-select-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdSelectPageComponent extends UnsubscribeBaseComponent implements OnInit {
  @Input() formFieldAppearance: MatFormFieldAppearance = 'outline';
  // inputData: TestData[] = [
  //   { id: '01', name: 'Test01' },
  //   { id: '02', name: 'Test02' },
  //   { id: '03', name: 'T03' },
  //   { id: '04', name: 'TestLong04' },
  //   { id: '05', name: 'Test05' },
  //   { id: '06', name: 'Test06' },
  //   { id: '07', name: 'Test07' },
  //   { id: '08', name: 'Test08' },
  //   { id: '09', name: 'Test09' },
  //   { id: '10', name: 'Test10' },
  //   { id: '11', name: 'Test11' },
  //   { id: '12', name: 'Test12' },
  //   { id: '13', name: 'Test13' },
  //   { id: '14', name: 'Test14' },
  //   { id: '15', name: 'Test15' },
  // ];
  inputData: TestData[];
  testForm: FormGroup;
  interests: string[];
  multiple = false;
  search = false;
  selected = null;
  // selected = [{ id: '07', name: 'Test07' }, { id: '08', name: 'Test08' }];
  selected2 = null;
  selected3 = null;
  selected4 = null;
  selected5 = null;
  constructor(private formBuilder: FormBuilder, private changeDetectorRef: ChangeDetectorRef) {
    super();
  }

  alert(text: string, event = null) {
    alert(text);
    if (event) {
      event.stopPropagation();
    }
  }

  ngOnInit() {
    this.buildForm();
    this.testSelectDataForm.setValue(this.selected);
    this.testSelectDataForm2.setValue(this.selected2);
    this.inputData = [
      { id: '01', name: 'Test01' },
      { id: '02', name: 'Test02' },
      { id: '03', name: 'T03' },
      { id: '04', name: 'TestLong04' },
      { id: '05', name: 'Test05' },
      { id: '06', name: 'Test06' },
      { id: '07', name: 'Test07' },
      { id: '08', name: 'Test08' },
      { id: '09', name: 'Test09' },
      { id: '10', name: 'Test10' },
      { id: '11', name: 'Test11' },
      { id: '12', name: 'Test12' },
      { id: '13', name: 'Test13' },
      { id: '14', name: 'Test14' },
      { id: '15', name: 'Test15' },
    ];
    this.changeDetectorRef.markForCheck();
  }

  buildForm() {
    this.testForm = this.formBuilder.group({
      testSelectData: [{ value: '', disabled: false }, [Validators.required]],
      testSelectData2: [{ value: '', disabled: false }, [Validators.required]],
      testSelectData3: [{ value: '', disabled: false }, [Validators.required]],
      testSelectData4: [{ value: '', disabled: false }, [Validators.required]],
      testSelectData5: [{ value: '', disabled: false }, [Validators.required]],
    });
  }

  get testSelectDataForm() {
    return this.testForm.get('testSelectData');
  }

  get testSelectDataForm2() {
    return this.testForm.get('testSelectData2');
  }
  get testSelectDataForm3() {
    return this.testForm.get('testSelectData3');
  }
  get testSelectDataForm4() {
    return this.testForm.get('testSelectData4');
  }
  get testSelectDataForm5() {
    return this.testForm.get('testSelectData5');
  }

  toggleCsdSelect() {
    if (this.testSelectDataForm.disabled) {
      this.testSelectDataForm.enable();
    } else {
      this.testSelectDataForm.disable();
    }
  }
  toggleSearch() {
    this.search = !this.search;
  }
  toggleMultiple() {
    this.multiple = !this.multiple;
  }
  toggleCsdSelect2() {
    if (this.testSelectDataForm2.disabled) {
      this.testSelectDataForm2.enable();
    } else {
      this.testSelectDataForm2.disable();
    }
  }
  toggleCsdSelect3() {
    if (this.testSelectDataForm3.disabled) {
      this.testSelectDataForm3.enable();
    } else {
      this.testSelectDataForm3.disable();
    }
  }
  toggleCsdSelect4() {
    if (this.testSelectDataForm4.disabled) {
      this.testSelectDataForm4.enable();
    } else {
      this.testSelectDataForm4.disable();
    }
  }
  toggleMatSelect() {
    if (this.testSelectDataForm5.disabled) {
      this.testSelectDataForm5.enable();
    } else {
      this.testSelectDataForm5.disable();
    }
  }
}
export interface TestData {
  id?: string;
  name?: string;
}
