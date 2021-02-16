import { ID } from '../../core/core.types';
import { ROUTER_OUTLET_MAIN_SIDENAV } from '../../core/constants/general.constants';
import {
  PATH_NAME_CRUD_MODEL_NEW,
  PATH_NAME_USER_INVITATION,
} from '../../core/constants/router.constants';
import { Invitation } from '../../invitation-system/csd-invitation-system.types';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CsdUserInvitationService {
  constructor(private router: Router) {}

  viewUserInvitation(id: ID) {
    this.router.navigate([
      {
        outlets: {
          [ROUTER_OUTLET_MAIN_SIDENAV]: [PATH_NAME_USER_INVITATION, Invitation.idFromGlobalId(id)],
        },
      },
    ]);
  }

  addNewUserInvitation(): void {
    this.router.navigate([
      {
        outlets: {
          [ROUTER_OUTLET_MAIN_SIDENAV]: [PATH_NAME_USER_INVITATION, PATH_NAME_CRUD_MODEL_NEW],
        },
      },
    ]);
  }
}
