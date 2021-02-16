import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';

export class CsdBaseDataSource<T> implements IDataSource<T> {
  private _page$: BehaviorSubject<Page<T>> = new BehaviorSubject(null);

  /** Stream that emits when paginator changed page */
  protected updateStream$ = new BehaviorSubject<PageRequest<T>>(null);

  private disconnected$ = new Subject();
  private connected = false;
  private _isLoading$ = new BehaviorSubject<boolean>(false);
  protected resetPaginator$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  public constructor(private config: CsdBaseDataSourceConfig<T>) {
    this.updateStream$
      .pipe(
        takeUntil(this.disconnected$),
        filter((pageRequest) => !!pageRequest && this.connected), // we do not want to have empty requests
        tap((_) => this._isLoading$.next(true)),
        switchMap((pageRequest: PageRequest<T>) =>
          config.onPageRequest(pageRequest, this._page$.getValue())
        ),
        // TODO: add an error handling
        tap((_) => this._isLoading$.next(false)),
        map((page: Page<T>) => this._page$.next(page))
      )
      .subscribe();

    if (config.externalUpdater$) {
      config.externalUpdater$
        .pipe(
          takeUntil(this.disconnected$),
          map((_) => this.triggerUpdate())
        )
        .subscribe();
    }
  }

  public get isLoading$(): Observable<boolean> {
    return this._isLoading$.asObservable().pipe(distinctUntilChanged());
  }

  public triggerPageRequest(pageRequest: PageRequest<T>) {
    this.updateStream$.next(pageRequest);
  }

  public triggerUpdate() {
    this.updateStream$.next(this._getPageRequestOrInitial());
  }

  public setPageSize(pageSize: number) {
    const pageRequest = this._getPageRequestOrInitial();
    this.updateStream$.next({
      ...pageRequest,
      pageSize,
      pageDirection: PageDirection.Initial,
    });
  }

  public registerFilterQueryStream(filterQuery$: Observable<any>) {
    filterQuery$
      .pipe(
        takeUntil(this.disconnected$),
        map((filterInput: any) => {
          this.updateStream$.next({
            ...this._getPageRequestOrInitial(),
            filter: filterInput,
          });
        })
      )
      .subscribe();
  }

  private _getPageRequestOrInitial(): PageRequest<T> {
    let pageRequest = this.updateStream$.getValue();
    pageRequest = !!pageRequest
      ? {
          ...pageRequest,
          pageDirection: PageDirection.Current,
        }
      : {
          // create empty request
          pageDirection: PageDirection.Initial,
        };
    return pageRequest;
  }

  public changeSort(sort: Sort<T>[]) {
    // we have to reset the paginator too
    this.resetPaginator$.next(true);
    const currentRequest: PageRequest<T> = this.updateStream$.getValue();
    this.updateStream$.next({
      pageSize: currentRequest.pageSize,
      pageDirection: PageDirection.Initial,
      sort: sort,
    } as PageRequest<T>);
  }

  connect(): Observable<T[]> {
    if (this.connected) {
      return this.data$();
    }

    this.connected = true;
    this.triggerUpdate();
    return this.data$();
  }

  disconnect(): void {
    this.disconnected$.next();
  }

  public data$(): Observable<T[]> {
    return this._page$.pipe(
      filter((page) => !!page),
      map((page) => page.content)
    );
  }

  public getTotalElements$(): Observable<number> {
    return this._page$.pipe(
      filter((page) => !!page),
      map((page) => page.totalElements)
    );
  }

  public getCurrentTotalElements(): number {
    const currentVal = this._page$.getValue();
    return currentVal ? currentVal.totalElements : null;
  }

  /**
   * This method subscribes to the given Stream and triggers a DataSource everytime
   * the stream emits a new PaginatorPageEvent (like going to the next page)
   */
  public registerPageChanges(pageEventStream$: Observable<PaginatorPageEvent>) {
    pageEventStream$
      .pipe(
        takeUntil(this.disconnected$),
        map((event: PaginatorPageEvent) => this.updatePageRequestFromPageEvent(event))
      )
      .subscribe();
  }

  public updatePageRequestFromPageEvent(pageEvent: PaginatorPageEvent) {
    const pageDirection = transformPageEventToPageDirection(pageEvent);
    // update the pageRequest State
    this.updateStream$.next({
      ...this.updateStream$.getValue(),
      pageDirection: pageDirection,
      pageSize: pageEvent.pageSize,
    });
  }

  getResetPagination$(): Observable<boolean> {
    return this.resetPaginator$.asObservable();
  }
}

export interface IDataSource<T> {
  connect(): Observable<T[]>;
  disconnect(): void;
}

export interface CsdBaseDataSourceConfig<T> {
  onPageRequest: PaginatedEndpoint<T>;

  /**
   * a stream which can be passed to the Datasource which triggers a pageevent every
   * time it triggers. can be used for deletion/adding a model to the backend e.g.
   */
  externalUpdater$?: Observable<void>;
}

/**
 * This is what we pass to the function which should then
 * return a Page
 */
export interface PageRequest<T> {
  pageDirection?: PageDirection;
  pageSize?: number /* how many items should be displayed at the current page */;

  /* the current sort object, could be null if sort is not supported */
  sort?: [Sort<T>];

  filter?: FilterRequest;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  cursorInfo: CursorInfo;
}

export interface Sort<T> {
  property: string;
  order: SortDirection;
}

export type FilterRequest = {};

export type PaginatedEndpoint<T> = (
  req: PageRequest<T>,
  currentPage?: Page<T>
) => Observable<Page<T>>;

export enum SortDirection {
  Ascending = 'asc',
  Descending = 'desc',
}

export interface PaginatorPageEvent {
  /** The current page index. */
  pageIndex: number;
  /**
   * Index of the page that was selected previously.
   * @breaking-change 8.0.0 To be made into a required property.
   */
  previousPageIndex?: number;
  /** The current page size */
  pageSize: number;
  /** The current total number of items being paged */
  length: number;
}

export enum PageDirection {
  Previous = 'PREVIOUS',
  Current = 'CURRENT',
  Next = 'NEXT',
  Initial = 'INITIAL',
}

export interface CursorInfo {
  startCursor: any;
  endCursor: any;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

function transformPageEventToPageDirection(pageEvent: PaginatorPageEvent) {
  if (pageEvent.previousPageIndex === -1) {
    return PageDirection.Initial;
  } else if (pageEvent.previousPageIndex > pageEvent.pageIndex) {
    return PageDirection.Previous;
  } else if (pageEvent.previousPageIndex < pageEvent.pageIndex) {
    return PageDirection.Next;
  } else {
    return PageDirection.Current;
  }
}
