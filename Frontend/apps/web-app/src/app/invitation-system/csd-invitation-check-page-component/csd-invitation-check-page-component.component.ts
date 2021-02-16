import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { PATH_PARAM_TOKEN } from '../../core/constants/router.constants';
import { ActivatedRoute, Router } from '@angular/router';
import { UnsubscribeBaseComponent } from '../../shared/unsubscribe-base.component';
import { CsdInvitationSystemService } from '../csd-invitation-system.service';
import { map } from 'rxjs/operators';
import { isValidInvitationToken } from '../utils';
import { InvitationInvalidReason } from '../csd-invitation-system.types';
import { CsdCurrentPageService } from '../../core/services/csd-current-page.service';
import { PAGE_KEY_INVITATION_CHECK } from '../../core/constants/page.constants';

@Component({
  selector: 'csd-invitation-check-page-component',
  templateUrl: './csd-invitation-check-page-component.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdInvitationCheckPageComponentComponent
  extends UnsubscribeBaseComponent
  implements OnInit {
  private invitationToken: string;

  invalidReason: InvitationInvalidReason = null;
  invalidToken = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private csdInvitationSystemService: CsdInvitationSystemService,
    private csdCurrentPageService: CsdCurrentPageService,
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router
  ) {
    super();
  }

  ngOnInit() {
    this.csdCurrentPageService.setCurrentPageKey$(PAGE_KEY_INVITATION_CHECK);
    this.invitationToken = this.activatedRoute.snapshot.paramMap.get(PATH_PARAM_TOKEN);
    if (!isValidInvitationToken(this.invitationToken)) {
      // TODO: Redirect to 404 as soon as we have one
      this.invalidToken = true;
      this.changeDetectorRef.markForCheck();
      return;
    }

    const invitationCheck$ = this.csdInvitationSystemService
      .getInvitationByToken$(this.invitationToken)
      .pipe(
        map((invitation) => {
          if (!invitation.isValid) {
            this.invalidReason = invitation.invalidReason as InvitationInvalidReason;
            return;
          }

          // route to the acceptPage
          this.router.navigateByUrl(invitation.acceptPage, { replaceUrl: true });
        })
      );

    this.addSubscription(
      invitationCheck$.subscribe((success) => this.changeDetectorRef.markForCheck())
    );
  }
}
