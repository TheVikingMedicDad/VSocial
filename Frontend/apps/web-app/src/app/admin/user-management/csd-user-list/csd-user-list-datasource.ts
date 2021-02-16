import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { gql } from '@apollo/client';
import { CsdDataService } from '../../../core/services/csd-data.service';
import { BaseModelListDataSource } from '../../../shared/components/base-model-list/base-model-list-datasource';
import { of, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserQuery } from '../state/user.query';

export interface CsdUserListItem {
  firstName: string;
  lastName: string;
  email: string;
  lastLogin: Date;
  registeredAt: Date;
  id: number;
  profileImage: string;
  language: string;
  // 
}

export const allUsersQuery = gql`
  query allUsers(
    $orderBy: [String]
    $after: String
    $first: Int
    $before: String
    $last: Int
    $filter: UserTypeFilterConnectionFilter
  ) {
    allUsers(
      orderBy: $orderBy
      after: $after
      first: $first
      before: $before
      last: $last
      filter: $filter
    ) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }

      edges {
        node {
          id
          firstName
          lastName
          email
          lastLogin
          dateJoined
          profileImage
          language
          # 
          tags {
            edges {
              node {
                id
                name
              }
            }
            totalCount
          }
        }
        cursor
      }
    }
  }
`;

/**
 * Data source for the CsdUserList view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class CsdUserListDataSource extends BaseModelListDataSource<CsdUserListItem> {
  allItemsQuery = allUsersQuery;
  allItemsQueryName = 'allUsers';

  constructor(
    protected paginator: MatPaginator,
    protected sort: MatSort,
    protected csdDataService: CsdDataService,
    protected filterQuery$: Observable<any> = of({}),
    protected userQuery: UserQuery
  ) {
    super(paginator, sort, csdDataService, filterQuery$);

    this.userQuery.getLatest$
      .pipe(
        map(() => {
          this.triggerUpdate();
        })
      )
      .subscribe();
  }
}
