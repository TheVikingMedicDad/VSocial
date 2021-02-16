import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CsdCurrentPageService } from '../../core/services/csd-current-page.service';
import { UnsubscribeBaseComponent } from '../../shared/unsubscribe-base.component';
import { PAGE_KEY_USER_INVITATION_LIST } from '../../core/constants/page.constants';

@Component({
  selector: 'csd-user-invitation-page',
  templateUrl: './csd-user-invitation-list-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdUserInvitationListPageComponent extends UnsubscribeBaseComponent implements OnInit {
  pageKey = PAGE_KEY_USER_INVITATION_LIST;

  constructor(
    private activatedRoute: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private csdCurrentPageService: CsdCurrentPageService
  ) {
    super();
  }

  ngOnInit() {
    this.csdCurrentPageService.setCurrentPageKey$(this.pageKey);
  }
}
