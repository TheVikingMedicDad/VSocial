import { Directive, Input, OnDestroy, OnInit } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { CsdBaseDataSource } from '../datasource/csd-base-data-source';
import { Subject } from 'rxjs';
import { map, pairwise, startWith, takeUntil } from 'rxjs/operators';

@Directive({
  selector: '[csdPaginatorDataSource]',
})
export class CsdPaginatorDataSourceDirective<T> implements OnInit, OnDestroy {
  private destroyed$ = new Subject();

  @Input('csdPaginatorDataSource') dataSource: CsdBaseDataSource<T>;

  @Input() triggerInitialRequest = false;

  constructor(private host: MatPaginator) {}

  ngOnInit() {
    this.registerPaginatorAtDataSource();
  }

  registerPaginatorAtDataSource() {
    // register myself to the datasource, so that the datasource gets informed by pageEvent changes
    // we have to hook into the pageEvent Stream of the MatPaginator because
    // we want to reset the paginator whenever the pageSize changes
    // we need that in order to fulfill the cursor-based datasource
    // requirements: our data-source cannot deal with pageIndexes
    //   a change in pageSize could lead to a change of current pageIndex
    //   that is why we need to set the page to initial!
    const paginatorStream$ = this.host.page.pipe(
      startWith(null),
      pairwise(),
      map(([previousEvent, currentValue]: [PageEvent, PageEvent]) => {
        const haveToReset = !!previousEvent && previousEvent.pageSize !== currentValue.pageSize;
        if (haveToReset) {
          // modify the pageIndex of the host element:
          this.host.pageIndex = 0;
          // also modify the event:
          const fakeEvent = Object.assign({}, currentValue);
          fakeEvent.pageIndex = 0;
          fakeEvent.previousPageIndex = -1;
          return fakeEvent;
        }
        return currentValue;
      })
    );
    this.dataSource.registerPageChanges(paginatorStream$);

    // get the current length of the datasource and update myself
    this.dataSource
      .getTotalElements$()
      .pipe(
        takeUntil(this.destroyed$),
        map((totalElements) => (this.host.length = totalElements))
      )
      .subscribe();

    this.dataSource
      .getResetPagination$()
      .pipe(
        takeUntil(this.destroyed$),
        map((reset) => this.host.firstPage())
      )
      .subscribe();

    if (!!this.host.pageSize) {
      this.dataSource.setPageSize(this.host.pageSize);
    }

    // trigger the initial request if wanted
    if (this.triggerInitialRequest) {
      this.dataSource.triggerUpdate();
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
  }
}
