import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { PATH_APP_ENTRY_PAGE, PATH_LOGIN } from '../../core/constants/router.constants';
import { CsdRouterUtilsService } from '../../core/csd-router-utils.service';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  templateUrl: './csd-user-register-page.component.html',
  styleUrls: ['./csd-user-register-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdUserRegisterPageComponent {
  loginUrl = PATH_LOGIN;
  queryParams: Params;

  constructor(
    protected csdRouterUtilsService: CsdRouterUtilsService,
    protected activatedRoute: ActivatedRoute
  ) {
    this.queryParams = activatedRoute.snapshot.queryParams;
  }

  registerSuccess(): void {
    this.csdRouterUtilsService.goToSavedTarget(
      this.activatedRoute.snapshot.queryParams,
      PATH_APP_ENTRY_PAGE
    );
  }
}
