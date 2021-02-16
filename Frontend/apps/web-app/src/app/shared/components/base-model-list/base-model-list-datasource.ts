import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { CsdDataService } from '../../../core/services/csd-data.service';
import { BehaviorSubject, combineLatest, Observable, Subject, Subscription, of } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { get, assign } from 'lodash-es';
import { DocumentNode } from '@apollo/client';

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

export abstract class BaseModelListDataSource<ListItemType> extends DataSource<ListItemType> {
  public totalCount: number;

  protected paginatorSubscription: Subscription;
  protected sortChangeSubscription: Subscription;
  protected pageInfo: PageInfo;
  protected resetPagination: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public data$: BehaviorSubject<ListItemType[]> = new BehaviorSubject<ListItemType[]>([]);
  protected variables$ = new BehaviorSubject<any>(null);
  protected loadingIndicator$ = new BehaviorSubject(false);

  protected abstract allItemsQuery: DocumentNode;
  protected allItemsQueryVariables = {};
  protected abstract allItemsQueryName: string;

  private updateStream$ = new Subject();

  protected constructor(
    protected paginator: MatPaginator,
    protected sort: MatSort,
    protected csdDataService: CsdDataService,
    protected filterQuery$: Observable<any> = of({})
  ) {
    super();
    this.resetPageInfo();

    this.paginatorSubscription = this.paginator.page.subscribe((pageEvent) => {
      if (pageEvent.previousPageIndex > pageEvent.pageIndex) {
        console.log('BaseModelListDataSource.paginatorSubscription: fetch previous page');
        this.updateQueryVariables(PageDirection.Previous);
      } else if (pageEvent.previousPageIndex < pageEvent.pageIndex) {
        console.log('BaseModelListDataSource.paginatorSubscription: fetch next page');
        this.updateQueryVariables(PageDirection.Next);
      } else {
        console.log('BaseModelListDataSource.paginatorSubscription: fetch current page');
        this.updateQueryVariables();
      }
    });

    this.sortChangeSubscription = this.sort.sortChange.subscribe((sortEvent) => {
      console.log('BaseModelListDataSource.sortChangeSubscription: ', sortEvent);
      this.resetPageInfo();
      this.updateQueryVariables();
    });

    const validVariables$ = this.variables$.pipe(filter((variables) => !!variables));

    // refetch query when query variables changed or we observe a create user action
    combineLatest(this.updateStream$.asObservable(), validVariables$, filterQuery$)
      .pipe(
        map(([_1, variables, filterInput]) => [variables, filterInput]),
        switchMap(([variables, filterInput]) => {
          const queryVariables = assign(variables, this.allItemsQueryVariables, {
            filter: filterInput,
          });
          return this.csdDataService.query(
            this.allItemsQuery,
            queryVariables,
            { fetchPolicy: 'network-only' } // because we can't use the cache for inserted items in filter query
          ).valueChanges;
        }),
        map((queryResult) => {
          const allItemsQueryNameSplitted = this.allItemsQueryName.split('.');
          allItemsQueryNameSplitted.unshift('data');
          const queryData = get(queryResult, allItemsQueryNameSplitted) as {
            edges: any;
            totalCount: number;
            pageInfo: PageInfo;
          };
          this.totalCount = queryData.totalCount;
          this.pageInfo = queryData.pageInfo;
          const nodes = queryData.edges.map((edge) => edge.node);
          this.data$.next(nodes);
        })
      )
      .subscribe();
  }

  public triggerUpdate() {
    this.updateStream$.next();
  }

  updateQueryVariables(page: PageDirection = PageDirection.Current) {
    let variables;
    let orderBy;

    // ordering
    if (this.sort.active && this.sort.direction) {
      orderBy = [
        this.sort.direction === SortDirection.Ascending ? this.sort.active : '-' + this.sort.active,
      ];
    } else {
      orderBy = [];
    }

    // pagination
    if (page === PageDirection.Next) {
      variables = {
        orderBy: orderBy,
        after: this.pageInfo.endCursor,
        first: this.paginator.pageSize,
      };
    } else if (page === PageDirection.Previous) {
      variables = {
        orderBy: orderBy,
        before: this.pageInfo.startCursor,
        last: this.paginator.pageSize,
      };
    } else {
      variables = {
        orderBy: orderBy,
        first: this.paginator.pageSize,
      };
    }
    this.variables$.next(variables);
  }

  resetPageInfo() {
    this.pageInfo = {
      startCursor: null,
      endCursor: null,
      hasNextPage: true,
      hasPreviousPage: false,
    };
    this.resetPagination.next(true);
  }

  getResetPagination$(): Observable<boolean> {
    return this.resetPagination.asObservable();
  }

  /**
   *  Called when the table is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during connect.
   */
  disconnect() {
    this.sortChangeSubscription.unsubscribe();
    this.paginatorSubscription.unsubscribe();
  }

  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  connect(): Observable<ListItemType[]> {
    this.updateQueryVariables();
    return this.data$.asObservable();
  }

  getData$(): Observable<ListItemType[]> {
    return this.data$.asObservable();
  }
}
