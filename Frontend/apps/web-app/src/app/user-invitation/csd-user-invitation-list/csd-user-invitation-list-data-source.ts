import { BaseModelListDataSource } from '../../shared/components/base-model-list/base-model-list-datasource';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { CsdDataService } from '../../core/services/csd-data.service';
import { map } from 'rxjs/operators';
import { allMyInvitations } from '../../invitation-system/csd-invitation-system.graphql';
import { UserQuery } from '../../admin/user-management/state/user.query';

export interface CsdUserInvitationListItem {
  id: string;
  inviteeEmail: string;
  status: string;
  expires: Date;
}

export class CsdUserInvitationListDataSource extends BaseModelListDataSource<
  CsdUserInvitationListItem
> {
  allItemsQuery = allMyInvitations;
  allItemsQueryName = 'me.invitations';

  constructor(
    protected paginator: MatPaginator,
    protected sort: MatSort,
    protected csdDataService: CsdDataService,
    protected userQuery: UserQuery
  ) {
    super(paginator, sort, csdDataService);

    this.userQuery.getLatestInvitation$
      .pipe(
        map(() => {
          this.triggerUpdate();
        })
      )
      .subscribe();
  }
}
