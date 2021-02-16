import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CsdCurrentUserService } from '../../auth/csd-current-user.service';
import { CsdSnackbarService } from '../../features/csd-snackbar/csd-snackbar.service';
import { UnsubscribeBaseComponent } from '../../shared/unsubscribe-base.component';
import { User } from '../../auth/auth.types';
import { CsdCurrentPageService } from '../../core/services/csd-current-page.service';
import { PAGE_KEY_ACCOUNT } from '../../core/constants/page.constants';

@Component({
  selector: 'csd-account-page',
  templateUrl: './csd-account-page.component.html',
  styleUrls: ['./csd-account-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdAccountPageComponent extends UnsubscribeBaseComponent implements OnInit, OnDestroy {
  inProgress = false;
  user: User;

  constructor(
    private csdCurrentUserService: CsdCurrentUserService,
    private csdSnackbarService: CsdSnackbarService,
    private changeDetectorRef: ChangeDetectorRef,
    private csdCurrentPageService: CsdCurrentPageService
  ) {
    super();
  }

  ngOnInit() {
    this.csdCurrentPageService.setCurrentPageKey$(PAGE_KEY_ACCOUNT);
    this.addSubscription(
      this.csdCurrentUserService.getUser$().subscribe(
        (user) => {
          this.user = user;
          this.changeDetectorRef.markForCheck();
        },
        () => this.csdSnackbarService.error()
      )
    );
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.csdCurrentPageService.setCurrentPageKey$('');
  }
}
