import { DirtyPage } from '../core.types';
import { CanDeactivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { CsdConfirmDialogService } from '../csd-confirm-dialog/csd-confirm-dialog.service';

@Injectable({ providedIn: 'root' })
export class CsdDirtyCheckGuard implements CanDeactivate<DirtyPage> {
  constructor(private csdConfirmDialogService: CsdConfirmDialogService) {}

  canDeactivate(pageComponent: DirtyPage) {
    return pageComponent.hasDirtyComponent$().pipe(
      switchMap((dirty) => {
        if (dirty === false) {
          return of(true);
        }

        return this.csdConfirmDialogService
          .openConfirmDialog({
            title: 'DIRTY_PAGE_GUARD.DIALOG_TITLE',
            message: 'DIRTY_PAGE_GUARD.DIALOG_MESSAGE',
            cancelButtonTitle: 'DIRTY_PAGE_GUARD.DIALOG_CONTINUE',
            submitButtonTitle: 'DIRTY_PAGE_GUARD.DIALOG_STAY',
          })
          .afterClosed()
          .pipe(map((result) => !result));
      })
    );
  }
}
