import { Directive, OnInit } from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { CsdBaseDataSource, SortDirection } from '../datasource/csd-base-data-source';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

@Directive({
  selector: '[csdMatSortDatasourceConnector]',
})
export class CsdMatSortDatasourceConnectorDirective<T> implements OnInit {
  private dataSource: CsdBaseDataSource<T>;
  private destroyed$ = new Subject();

  constructor(private matTable: MatTable<T>, private matSort: MatSort) {}

  ngOnInit() {
    this.dataSource = this.matTable.dataSource as CsdBaseDataSource<T>;
    this.connectDataSourceWithMatSort();
  }

  private connectDataSourceWithMatSort() {
    this.matSort.sortChange
      .pipe(
        takeUntil(this.destroyed$),
        map((sortChanged: Sort) => {
          this.dataSource.changeSort([
            {
              property: sortChanged.active,
              order:
                sortChanged.direction === 'asc'
                  ? SortDirection.Ascending
                  : SortDirection.Descending,
            },
          ]);
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.destroyed$.next();
  }
}
