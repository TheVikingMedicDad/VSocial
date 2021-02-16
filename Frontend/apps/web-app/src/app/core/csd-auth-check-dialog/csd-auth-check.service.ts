import { Injectable, TemplateRef } from '@angular/core';
import { AuthCheckActions, AuthCheckDialogData } from '../../auth/auth.types';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CsdAuthCheckDialogComponent } from './csd-auth-check-dialog.component';
import { ComponentType } from '@angular/cdk/portal';
import { switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Injectable()
export class CsdAuthCheckService {
  constructor(private matDialog: MatDialog) {}

  openAuthCheckDialog(actionKey: AuthCheckActions) {
    const dialogData: AuthCheckDialogData = { actionKey: actionKey };
    const dialogRef = this.matDialog.open(CsdAuthCheckDialogComponent, {
      data: dialogData,
    });

    return dialogRef.afterClosed();
  }

  openDialogAfterAuthCheck<T, D = any>(
    dialogComponentOrTemplateRef: ComponentType<T> | TemplateRef<T>,
    actionKey: AuthCheckActions,
    dialogConfig?: MatDialogConfig<D>
  ): Observable<T> {
    return this.openAuthCheckDialog(actionKey).pipe(
      switchMap((result) => {
        if (!result) {
          return of(false);
        } else {
          const dialogRef = this.matDialog.open(dialogComponentOrTemplateRef, dialogConfig);
          return dialogRef.afterClosed();
        }
      })
    );
  }
}
