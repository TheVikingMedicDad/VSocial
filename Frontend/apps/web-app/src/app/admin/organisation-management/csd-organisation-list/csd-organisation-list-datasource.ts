import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { CsdDataService } from '../../../core/services/csd-data.service';
import { gql } from '@apollo/client';
import { BaseModelListDataSource } from '../../../shared/components/base-model-list/base-model-list-datasource';

export interface CsdOrganisationListItem {
  name: string;
  owner: {};
  id: number;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string;
  endCursor: string;
}

export enum PageDirection {
  Previous,
  Current,
  Next,
}

export enum SortDirection {
  Ascending = 'asc',
  Descending = 'desc',
}

export const allOrganisationsQuery = gql`
  query allOrganisations(
    $orderBy: [String]
    $after: String
    $first: Int
    $before: String
    $last: Int
  ) {
    allOrganisations(
      orderBy: $orderBy
      after: $after
      first: $first
      before: $before
      last: $last
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
          name
          owner {
            id
            username
          }
        }
        cursor
      }
    }
  }
`;

/**
 * Data source for the CsdOrganisationList view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class CsdOrganisationListDataSource extends BaseModelListDataSource<
  CsdOrganisationListItem
> {
  allItemsQuery = allOrganisationsQuery;
  allItemsQueryName = 'allOrganisations';

  constructor(
    protected paginator: MatPaginator,
    protected sort: MatSort,
    protected csdDataService: CsdDataService
  ) {
    super(paginator, sort, csdDataService);

    this.triggerUpdate();
  }
}
