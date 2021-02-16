import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import { CsdComponentLibraryService } from '../csd-component-library.service';
import { delay } from 'rxjs/operators';
import { CsdLastEmailPreviewFrameComponent } from '../csd-last-email-preview-frame/csd-last-email-preview-frame.component';
import { CsdAuthCheckService } from '../../core/csd-auth-check-dialog/csd-auth-check.service';
import { CsdChangeEmailDialogComponent } from '../../core/csd-change-email-dialog/csd-change-email-dialog.component';
import { AuthCheckActions } from '../../auth/auth.types';

@Component({
  selector: 'csd-account-email-preview',
  templateUrl: './csd-account-email-preview.component.html',
  styleUrls: ['./csd-account-email-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdAccountEmailPreviewComponent implements OnInit {
  GERMAN = 'de';
  ENGLISH = 'en';

  hasClicked = false;

  @ViewChild(CsdLastEmailPreviewFrameComponent)
  emailPreview: CsdLastEmailPreviewFrameComponent;

  constructor(
    private csdComponentLibraryService: CsdComponentLibraryService,
    private csdAuthCheckService: CsdAuthCheckService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit() {}

  refreshEmailPreview() {
    const hasToUpdate = !!this.emailPreview;
    this.hasClicked = true;
    if (hasToUpdate) {
      this.emailPreview.doRefresh();
    }
    this.changeDetectorRef.markForCheck();
  }

  createNewUser(language) {
    this.csdComponentLibraryService
      .registerRandomUser$(language)
      .pipe(delay(1000))
      .subscribe((ok) => this.refreshEmailPreview());
  }

  requestEmailChange() {
    this.csdAuthCheckService
      .openDialogAfterAuthCheck(CsdChangeEmailDialogComponent, AuthCheckActions.CHANGE_EMAIL)
      .pipe(delay(1000))
      .subscribe((ok) => this.refreshEmailPreview());
  }

  requestPasswordReset() {
    this.csdComponentLibraryService
      .requestPasswordReset$()
      .pipe(delay(1000))
      .subscribe((ok) => this.refreshEmailPreview());
  }
}
