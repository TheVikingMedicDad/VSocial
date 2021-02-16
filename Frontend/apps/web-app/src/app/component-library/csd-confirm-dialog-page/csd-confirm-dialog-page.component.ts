import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import { CsdConfirmDialogConfig } from '../../core/core.types';
import { CsdConfirmDialogService } from '../../core/csd-confirm-dialog/csd-confirm-dialog.service';
import { TranslationObject } from '../../translation/translation.type';

/*
 * Define the input for the CsdConfigDialog
 */
const csdConfirmDialogConfig: CsdConfirmDialogConfig = {
  title: '',
  message: '',
  messageHtml: '',
  cancelButtonTitle: '',
  submitButtonTitle: '',
};

@Component({
  selector: 'csd-confirm-dialog-page',
  templateUrl: './csd-confirm-dialog-page.component.html',
  styleUrls: ['./csd-confirm-dialog-page.component.scss'],
})
export class CsdConfirmDialogPageComponent {
  @Input() formFieldAppearance: MatFormFieldAppearance = 'outline';
  title: string;
  message: string;
  messageHtml: string;
  cancelButtonTitle: string;
  submitButtonTitle: string;

  testTitle: TranslationObject = { key: 'BUTTON.YES', payload: {} };

  result: string;

  constructor(public dialog: MatDialog, private csdConfirmDialogService: CsdConfirmDialogService) {}

  /*
   * Opens the openConfirmDialog() from the CsdConfirmDialogService, set the data from the input
   * fields to the CsdConfirmDialogConfig and subscribes to the result of the confirm dialog
   */
  openDialog() {
    csdConfirmDialogConfig.title = this.title;
    csdConfirmDialogConfig.message = this.message;
    csdConfirmDialogConfig.messageHtml = this.messageHtml;
    csdConfirmDialogConfig.cancelButtonTitle = this.cancelButtonTitle;
    csdConfirmDialogConfig.submitButtonTitle = this.submitButtonTitle;

    this.csdConfirmDialogService
      .openConfirmDialog(csdConfirmDialogConfig)
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.result = 'The action has been executed';
        } else {
          this.result = 'The action was not executed';
        }
      });
  }

  showConfirmDialog() {
    this.csdConfirmDialogService.openConfirmDialog({
      title: 'Title',
      messageHtml:
        'Fusce vehicula dolor arcu, sit amet blandit dolor mollis<br /> nec. Donec viverra eleifend lacus, vitae ullamcorper<br /> metus. Sed sollicitudin ipsum quis nunc sollicitudin<br /> ultrices. Donec euismod scelerisque ligula.',
      cancelButtonTitle: 'cancel',
      submitButtonTitle: 'submit',
    });
  }
}
