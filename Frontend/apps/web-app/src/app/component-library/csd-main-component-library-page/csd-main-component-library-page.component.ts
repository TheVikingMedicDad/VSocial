import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {
  PATH_NAME_ACTIVATION_EMAIL_PREVIEW,
  PATH_NAME_BUTTONS,
  PATH_NAME_CSD_CARDS,
  PATH_NAME_COMPONENT_LIBRARY,
  PATH_NAME_CONFIRM_DIALOG,
  PATH_NAME_CSD_SELECT,
  PATH_NAME_CSD_STEPPER,
  PATH_NAME_EXAMPLE_TABLE_PAGE,
  PATH_NAME_FORM_CONTROLS,
  PATH_NAME_CSD_LISTS,
  PATH_NAME_OTHER_COMPONENTS,
  PATH_NAME_SNACKBARS,
  PATH_NAME_STYLEGUIDE,
} from '../../core/constants/router.constants';

@Component({
  selector: 'csd-main-component-library-page',
  templateUrl: './csd-main-component-library-page.component.html',
  styleUrls: ['./csd-main-component-library-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdMainComponentLibraryPageComponent implements OnInit {
  componentLibraryMainPath = '/' + PATH_NAME_COMPONENT_LIBRARY + '/';
  componentLibraryPathList = [
    ['Styleguide', this.componentLibraryMainPath + PATH_NAME_STYLEGUIDE],
    ['Buttons', this.componentLibraryMainPath + PATH_NAME_BUTTONS],
    ['Snackbars', this.componentLibraryMainPath + PATH_NAME_SNACKBARS],
    ['Form Controls', this.componentLibraryMainPath + PATH_NAME_FORM_CONTROLS],
    ['Confirm Dialog', this.componentLibraryMainPath + PATH_NAME_CONFIRM_DIALOG],
    ['Csd-Cards', this.componentLibraryMainPath + PATH_NAME_CSD_CARDS],
    ['Csd-Select', this.componentLibraryMainPath + PATH_NAME_CSD_SELECT],
    ['Csd-Lists', this.componentLibraryMainPath + PATH_NAME_CSD_LISTS],
    ['Csd-Stepper', this.componentLibraryMainPath + PATH_NAME_CSD_STEPPER],
    ['Table', this.componentLibraryMainPath + PATH_NAME_EXAMPLE_TABLE_PAGE],
    ['Account Email Templates', this.componentLibraryMainPath + PATH_NAME_ACTIVATION_EMAIL_PREVIEW],
    ['Other Components', this.componentLibraryMainPath + PATH_NAME_OTHER_COMPONENTS],
  ];

  constructor() {}

  ngOnInit() {}
}
