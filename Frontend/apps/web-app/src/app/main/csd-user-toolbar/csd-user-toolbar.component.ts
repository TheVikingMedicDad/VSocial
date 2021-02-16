import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CsdCurrentUserService } from '../../auth/csd-current-user.service';
import { UnsubscribeBaseComponent } from '../../shared/unsubscribe-base.component';
import { filter } from 'rxjs/operators';
import { CsdCurrentPageService } from '../../core/services/csd-current-page.service';

@Component({
  selector: 'csd-user-toolbar',
  templateUrl: './csd-user-toolbar.component.html',
  styleUrls: ['./csd-user-toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdUserToolbarComponent extends UnsubscribeBaseComponent implements OnInit {
  userAccountConfirmed = true;
  pageKey: string;

  constructor(
    private csdCurrentUserService: CsdCurrentUserService,
    private csdCurrentPageService: CsdCurrentPageService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit() {
    this.addSubscription(
      this.csdCurrentUserService
        .getUser$()
        .pipe(filter((user) => !!user))
        .subscribe((user) => {
          this.userAccountConfirmed = user.emailVerified;
        })
    );

    this.addSubscription(
      this.csdCurrentPageService.getCurrentPageKey$().subscribe((key) => {
        this.pageKey = key;
        this.changeDetectorRef.detectChanges();
      })
    );
  }
}
