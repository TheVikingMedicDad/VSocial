import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Params, Route } from '@angular/router';
import { UnsubscribeBaseComponent } from '../../shared/unsubscribe-base.component';
import {
  PATH_APP_ENTRY_PAGE,
  PATH_REGISTER,
  PATH_REQUEST_PASSWORD_RESET,
} from '../../core/constants/router.constants';
import { CsdRouterUtilsService } from '../../core/csd-router-utils.service';
import { CsdCurrentUserService } from '../csd-current-user.service';

@Component({
  templateUrl: './csd-user-login-page.component.html',
  styleUrls: ['./csd-user-login-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdUserLoginPageComponent extends UnsubscribeBaseComponent implements OnInit {
  queryParams: Params;
  registerUrl = `/${PATH_REGISTER}`;
  resetPasswordUrl = PATH_REQUEST_PASSWORD_RESET;

  constructor(
    protected activatedRoute: ActivatedRoute,
    protected csdRouterUtilsService: CsdRouterUtilsService,
    protected csdCurrentUserService: CsdCurrentUserService
  ) {
    super();
    this.queryParams = activatedRoute.snapshot.queryParams;
  }

  ngOnInit(): void {
    // check if user is logged in. navigate to target if yes:
    this.goToSavedTargetIfAuthenticated();
  }

  loginSuccess(): void {
    this.csdRouterUtilsService.goToSavedTarget(
      this.activatedRoute.snapshot.queryParams,
      PATH_APP_ENTRY_PAGE
    );
  }

  goToSavedTargetIfAuthenticated(): void {
    this.addSubscription(
      this.csdCurrentUserService.ifAuthenticatedLoadUser$().subscribe((nowAuthenticated) => {
        if (nowAuthenticated) {
          this.csdRouterUtilsService.goToSavedTarget(
            this.activatedRoute.snapshot.queryParams,
            PATH_APP_ENTRY_PAGE
          );
        }
      })
    );
  }
}
