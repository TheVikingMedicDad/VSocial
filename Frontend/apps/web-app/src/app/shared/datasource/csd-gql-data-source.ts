import {
  CursorInfo,
  CsdBaseDataSource,
  Page,
  PageDirection,
  PageRequest,
  Sort,
  SortDirection,
} from './csd-base-data-source';
import { DocumentNode } from '@apollo/client';
import { Observable } from 'rxjs';
import { get } from 'lodash-es';
import { CsdDataService } from '../../core/services/csd-data.service';
import { filter, map } from 'rxjs/operators';
import { cloneDeep } from '@apollo/client/utilities';

const GQL_OPTIONS_NETWORK_ONLY = { fetchPolicy: 'cache-and-network' };
const GQL_ROOT_DATA_ELEMENT = 'data';

export class CsdGqlDataSource<T> extends CsdBaseDataSource<T> {
  lastQueryVariables: {
    after: any;
    first: any;
    before: any;
    last: any;
  } = null;

  get query(): DocumentNode {
    const queryClb = this.gqlConfig.gqlQuery;
    return typeof queryClb === 'function' ? queryClb() : queryClb;
  }

  public constructor(private gqlConfig: CsdGqlDataSourceConfig) {
    super({
      onPageRequest: (req, current) => this.onPageRequest(req, current),
      externalUpdater$: (() => {
        return gqlConfig.externalUpdater$
          ? gqlConfig.externalUpdater$.pipe(filter((_) => this !== undefined))
          : null;
      })(),
    });
  }

  /** helper method which creates the correct cursor variables to send to the backend */
  private _getInputCursorVariables(
    pageRequest: PageRequest<T>,
    currentPage: Page<T>
  ): GqlCursorRequestVariables {
    const baseV = {
      after: null,
      first: null,
      before: null,
      last: null,
    };
    if (!currentPage || pageRequest.pageDirection === PageDirection.Initial) {
      // first request or reset request
      return {
        ...baseV,
        first: pageRequest.pageSize,
      };
    } else if (pageRequest.pageDirection === PageDirection.Previous) {
      return {
        ...baseV,
        before: currentPage.cursorInfo.startCursor,
        last: pageRequest.pageSize,
      };
    } else if (pageRequest.pageDirection === PageDirection.Next) {
      return {
        ...baseV,
        after: currentPage.cursorInfo.endCursor,
        first: pageRequest.pageSize,
      };
    } else {
      // it's just a refresh, we should stay at the current position
      if (this.lastQueryVariables) {
        return {
          ...baseV,
          first: this.lastQueryVariables.first,
          before: this.lastQueryVariables.before,
          after: this.lastQueryVariables.after,
          last: this.lastQueryVariables.last,
        };
      } else {
        return {
          ...baseV,
          first: pageRequest.pageSize,
        };
      }
    }
  }

  private _getInputSortVariables(
    pageRequest: PageRequest<T>,
    currentPage: Page<T>
  ): { orderBy: string[] } {
    if (!(pageRequest.sort && pageRequest.sort.length > 0)) {
      return { orderBy: [] };
    }
    // TODO: Currently we are not able to send a orderBy and filter at the same time to the backend
    //       fix that and remove as soon as fixed
    //
    if (pageRequest.filter && pageRequest.filter != {}) {
      // there is some active filter, disable orderBy
      return { orderBy: [] };
    }
    return {
      orderBy: pageRequest.sort.map(
        (sort: Sort<T>) => `${sort.order === SortDirection.Ascending ? '' : '-'}${sort.property}`
      ),
    };
  }

  protected onPageRequest(pageRequest: PageRequest<T>, currentPage: Page<T>): Observable<Page<T>> {
    const queryVariables = {
      ...this._getInputCursorVariables(pageRequest, currentPage),
      ...this._getInputSortVariables(pageRequest, currentPage),
      ...this.gqlConfig.gqlQueryVariables,
      filter: pageRequest.filter,
    };

    const query: DocumentNode = this.query;
    // get the inital query observable
    const query$ = this.gqlConfig.csdDataService.query(
      query,
      queryVariables,
      GQL_OPTIONS_NETWORK_ONLY
    ).valueChanges;

    // deal with query response
    return query$.pipe(
      map((queryResult) => {
        this.lastQueryVariables = queryVariables;

        const allItemsQueryNameSplitted = this.gqlConfig.gqlItemsPath.split('.');
        allItemsQueryNameSplitted.unshift(GQL_ROOT_DATA_ELEMENT);
        const queryData = get(queryResult, allItemsQueryNameSplitted) as IExpectedGqlResponse<T>;

        return {
          content: queryData.edges.map((edge) => edge.node),
          totalElements: queryData.totalCount,
          cursorInfo: queryData.pageInfo,
        };
      })
    );
  }

  optimisticUpdate(kind: 'delete' | 'update' | 'create', entityName: string, store, mutationData) {
    // updates the local apollo store before the server actually responds
    // this makes the UX more responsive

    //TODO: the following query path generation is not very failsafe think about how to improve.
    const mutationEntityData = mutationData.data[kind + entityName][entityName.toLowerCase()];
    const query = this.query;
    const queryData = store.readQuery({
      query: query,
      variables: this.lastQueryVariables,
    });

    // we cannot directly modify the data as it is immutable, therefore we need to clone it
    const clonedData = cloneDeep(queryData);
    // add our entity (the temp one from the mutation data)

    const connection = get(clonedData, this.gqlConfig.gqlItemsPath);
    switch (kind) {
      case 'create': {
        connection.edges.push({ node: mutationEntityData });
        break;
      }
      case 'update': {
        const i = connection.edges.findIndex((edge) => edge.id == mutationEntityData.id);
        connection.edges[i] = mutationEntityData;
        break;
      }
      case 'delete': {
        connection.edges = connection.edges.filter(
          (edge) => edge.node.id !== mutationEntityData.id
        );
        break;
      }
    }
    // Write back to the store so that all watching queries of this kind are updated.
    store.writeQuery({
      query: query,
      variables: this.lastQueryVariables,
      data: clonedData,
    });
  }
}

export type GqlQueryFactory = () => DocumentNode;

export interface CsdGqlDataSourceConfig {
  gqlQuery: DocumentNode | GqlQueryFactory;
  csdDataService: CsdDataService;
  gqlQueryVariables?: {};
  gqlItemsPath: string;
  externalUpdater$?: Observable<any>;
}

interface IExpectedGqlResponse<T> {
  edges: [{ node: T }];
  totalCount: number;
  pageInfo: CursorInfo;
}

interface GqlCursorRequestVariables {
  after: string;
  first: number;
  before: string;
  last: number;
}
