import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Inject,
  ChangeDetectorRef,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DownloadFile } from '../core.types';
import { get } from 'lodash-es';
import { CsdSnackbarService } from '../../features/csd-snackbar/csd-snackbar.service';
import { delay, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export interface ProgressIndicatorDialogData {
  downloadFileObs: Observable<DownloadFile>;
  minShowingTime?: number;
  closeWhenDownloadStarts?: boolean;
}

@Component({
  selector: 'csd-download-prepare-dialog',
  templateUrl: './csd-download-prepare-dialog.component.html',
  styleUrls: ['./csd-download-prepare-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdDownloadPrepareDialogComponent implements OnInit {
  public downloadFile: DownloadFile = null;
  private minShowingTime = 3000;
  private downloadSubscription;

  constructor(
    private dialogRef: MatDialogRef<Component>,
    private changeDetectorRef: ChangeDetectorRef,
    private csdSnackbarService: CsdSnackbarService,
    @Inject(MAT_DIALOG_DATA) public data: ProgressIndicatorDialogData
  ) {
    this.minShowingTime = get(data, 'minShowingTime', this.minShowingTime);
  }

  ngOnInit() {
    const startTime = Date.now();
    this.downloadSubscription = this.data.downloadFileObs
      .pipe(
        switchMap((file) => {
          const timeWait = Math.max(this.minShowingTime - (Date.now() - startTime), 0);
          return of(file).pipe(delay(timeWait));
        })
      )
      .subscribe(
        (file) => {
          this.downloadFile = file;
          this.changeDetectorRef.markForCheck();
          window.location.href = this.downloadFile.absoluteUrl;
          if (get(this.data, 'closeWhenDownloadStarts', false)) {
            this.dialogRef.close();
          }
        },
        (error) => {
          this.csdSnackbarService.error();
          this.dialogRef.close();
        }
      );
  }

  abort() {
    if (this.downloadSubscription) {
      this.downloadSubscription.complete();
    }
    this.dialogRef.close();
  }
}
