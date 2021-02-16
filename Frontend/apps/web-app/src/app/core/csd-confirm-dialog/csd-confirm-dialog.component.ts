import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ensureTranslationObjectType, TranslationObject } from '../../translation/translation.type';
import { I18NextPipe } from 'angular-i18next';
import { CsdConfirmDialogConfig } from '../core.types';

@Component({
  selector: 'csd-confirm-dialog',
  templateUrl: './csd-confirm-dialog.component.html',
})
export class CsdConfirmDialogComponent {
  defaultTitle: TranslationObject = { key: 'DEFAULT_CONFIRM_DIALOG.TITLE', payload: {} };
  defaultMessage: TranslationObject = { key: 'DEFAULT_CONFIRM_DIALOG.MESSAGE', payload: {} };
  defaultCancelButton: TranslationObject = { key: 'BUTTON.CANCEL', payload: {} };
  defaultSubmitButton: TranslationObject = { key: 'BUTTON.YES', payload: {} };

  constructor(
    @Inject(MAT_DIALOG_DATA) public csdConfirmDialogConfig: CsdConfirmDialogConfig,
    private i18NextPipe: I18NextPipe
  ) {
    csdConfirmDialogConfig.title = ensureTranslationObjectType(csdConfirmDialogConfig.title);
    csdConfirmDialogConfig.message = ensureTranslationObjectType(csdConfirmDialogConfig.message);

    csdConfirmDialogConfig.cancelButtonTitle = ensureTranslationObjectType(
      csdConfirmDialogConfig.cancelButtonTitle
    );
    csdConfirmDialogConfig.submitButtonTitle = ensureTranslationObjectType(
      csdConfirmDialogConfig.submitButtonTitle
    );

    csdConfirmDialogConfig.title =
      csdConfirmDialogConfig.title && csdConfirmDialogConfig.title.key.length > 0
        ? this.i18NextPipe.transform(
            csdConfirmDialogConfig.title.key,
            csdConfirmDialogConfig.title.payload
          )
        : this.i18NextPipe.transform(this.defaultTitle.key);
    csdConfirmDialogConfig.message =
      csdConfirmDialogConfig.message && csdConfirmDialogConfig.message.key.length > 0
        ? this.i18NextPipe.transform(
            csdConfirmDialogConfig.message.key,
            csdConfirmDialogConfig.message.payload
          )
        : this.i18NextPipe.transform(this.defaultMessage.key);
    csdConfirmDialogConfig.cancelButtonTitle =
      csdConfirmDialogConfig.cancelButtonTitle &&
      csdConfirmDialogConfig.cancelButtonTitle.key.length > 0
        ? this.i18NextPipe.transform(
            csdConfirmDialogConfig.cancelButtonTitle.key,
            csdConfirmDialogConfig.cancelButtonTitle.payload
          )
        : this.i18NextPipe.transform(this.defaultCancelButton.key);

    csdConfirmDialogConfig.submitButtonTitle =
      csdConfirmDialogConfig.submitButtonTitle &&
      csdConfirmDialogConfig.submitButtonTitle.key.length > 0
        ? this.i18NextPipe.transform(
            csdConfirmDialogConfig.submitButtonTitle.key,
            csdConfirmDialogConfig.submitButtonTitle.payload
          )
        : this.i18NextPipe.transform(this.defaultSubmitButton.key);
  }
}
