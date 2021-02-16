import { Injectable } from '@angular/core';
import { CsdConfirmDialogComponent } from './csd-confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CsdConfirmDialogConfig } from '../core.types';

@Injectable({
  providedIn: 'root',
})
export class CsdConfirmDialogService {
  result: boolean;

  constructor(public matDialog: MatDialog) {}

  /*
   * Opens the CsdConfirmDialog and uses CsdConfirmDialogConfig to fill the Title, Message, Cancel and Submit Button
   */
  openConfirmDialog(csdConfirmDialogConfig: CsdConfirmDialogConfig) {
    return this.matDialog.open(CsdConfirmDialogComponent, {
      data: csdConfirmDialogConfig,
      autoFocus: false,
    });
  }
}
