import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import * as routeConstants from '../../../core/constants/router.constants';
import { CsdCurrentUserService } from '../../../auth/csd-current-user.service';
import { UnsubscribeBaseComponent } from '../../unsubscribe-base.component';
import { filter, tap } from 'rxjs/operators';

@Component({
  selector: 'csd-user-menu',
  templateUrl: './csd-user-menu.component.html',
  styleUrls: ['./csd-user-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdUserMenuComponent extends UnsubscribeBaseComponent implements OnInit {
  routeConstants = routeConstants;
  isAdmin = false;

  constructor(private csdCurrentUserService: CsdCurrentUserService) {
    super();
  }

  ngOnInit() {
    this.addSubscription(
      this.csdCurrentUserService
        .getUser$()
        .pipe(
          filter((user) => !!user),
          tap((user) => (this.isAdmin = user.groups.includes('Administrators')))
        )
        .subscribe()
    );
  }

  logout() {
    this.csdCurrentUserService.logout$().subscribe();
  }
}
