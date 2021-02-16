import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CsdInvitationSystemService } from '../../invitation-system/csd-invitation-system.service';
import { UnsubscribeBaseComponent } from '../../shared/unsubscribe-base.component';
import { PAGE_KEY_INVITATION_CHECK } from '../../core/constants/page.constants';
import { PATH_NAME_APP_ENTRY_PAGE, PATH_PARAM_TOKEN } from '../../core/constants/router.constants';
import { CsdCurrentPageService } from '../../core/services/csd-current-page.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CsdSnackbarService } from '../../features/csd-snackbar/csd-snackbar.service';

@Component({
  selector: 'csd-user-invitation-accept-page',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * This page calls the acceptInvitationMutation without displaying any submit button
 * and redirects afterwards to the dashboard page
 */
export class CsdUserInvitationAcceptPageComponent
  extends UnsubscribeBaseComponent
  implements OnInit {
  private acceptToken: string;

  constructor(
    private csdInvitationSystemService: CsdInvitationSystemService,
    private csdCurrentPageService: CsdCurrentPageService,
    private csdSnackbarService: CsdSnackbarService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    super();
  }

  ngOnInit() {
    this.csdCurrentPageService.setCurrentPageKey$(PAGE_KEY_INVITATION_CHECK);
    this.acceptToken = this.activatedRoute.snapshot.paramMap.get(PATH_PARAM_TOKEN);

    const acceptInvitation$ = this.csdInvitationSystemService.accept$({
      acceptToken: this.acceptToken,
    });

    this.addSubscription(
      acceptInvitation$.subscribe(
        (success) => {
          this.router.navigateByUrl(PATH_NAME_APP_ENTRY_PAGE, {
            replaceUrl: true,
          });
        },
        (error) => {
          this.csdSnackbarService.error();
        }
      )
    );
  }
}
