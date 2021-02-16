import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { UnsubscribeBaseComponent } from '../../unsubscribe-base.component';
import { CsdDataService } from '../../../core/services/csd-data.service';
import { CsdFilterService } from '../../../features/csd-data-filtering/csd-filter.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { CsdFilterEntry } from '../../../features/csd-data-filtering/csd-data-filtering.types';
import { CsdFilterContainerComponent } from '../../../features/csd-data-filtering/filters/csd-filter-container/csd-filter-container.component';
import { CONTAINER_FIELD_ID } from '../../../features/csd-data-filtering/csd-data-filtering.constants';
import { countFilters } from '../../../features/csd-data-filtering/csd-data-filtering.utils';
import { CsdRouterUtilsService } from '../../../core/csd-router-utils.service';
import { ID } from '../../../core/core.types';

@Component({
  templateUrl: './base-model-list.component.html',
  styleUrls: ['./base-model-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * No logic in here yet.
 */
export class BaseModelListComponent extends UnsubscribeBaseComponent implements OnInit, OnDestroy {
  filters: CsdFilterEntry[] = [];
  filterSetId: ID;
  filterQuery$: Observable<any>;
  filterAllowNesting = true;
  filterFieldTranslationPattern = '';
  private _filterCount = 0;

  constructor(
    protected csdDataService: CsdDataService,
    protected csdFilterService: CsdFilterService,
    // TODO: refactor usage of router utils service
    protected csdRouterUtilsService: CsdRouterUtilsService
  ) {
    super();
  }

  get filterCount() {
    return this._filterCount;
  }

  ngOnInit() {
    if (this.filterAllowNesting) {
      this.filters.push({ fieldId: CONTAINER_FIELD_ID, filter: CsdFilterContainerComponent });
    }
    this.filterSetId = this.csdFilterService.createOrUpdateGlobalFilterSet({
      availableFilters: this.filters,
      filterQuery: {},
      filterFieldTranslationPattern: this.filterFieldTranslationPattern,
    });
    console.log('BaseModelListComponent.filterSetID: ', this.filterSetId);

    this.filterQuery$ = this.csdFilterService
      .getGlobalFilterSetById$(this.filterSetId)
      .pipe(map((filterSet) => filterSet.filterQuery));

    this.addSubscription(
      this.csdFilterService.getGlobalFilterSetById$(this.filterSetId).subscribe((filterSet) => {
        console.log('BaseModelListComponent.ngOnInit: filterQuery ', filterSet.filterQuery);
        this._filterCount = countFilters(filterSet.filterQuery);
      })
    );
  }

  ngOnDestroy() {
    this.csdFilterService.deleteGlobalFilterSet(this.filterSetId);
  }
}
