import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { CsdBaseDataSource } from '../../../shared/datasource/csd-base-data-source';
import { CsdFilterService } from '../../csd-data-filtering/csd-filter.service';
import { UnsubscribeBaseComponent } from '../../../shared/unsubscribe-base.component';
import { ID } from '../../../core/core.types';
import { CONTAINER_FIELD_ID } from '../../csd-data-filtering/csd-data-filtering.constants';
import { CsdFilterContainerComponent } from '../../csd-data-filtering/filters/csd-filter-container/csd-filter-container.component';
import { map } from 'rxjs/operators';

@Component({
  selector: 'csd-model-list-wrapper',
  templateUrl: './csd-model-list-wrapper.component.html',
  styleUrls: ['./csd-model-list-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdModelListWrapperComponent<T> extends UnsubscribeBaseComponent implements OnInit {
  @Input() dataSource: CsdBaseDataSource<T>;

  @Input() pageSize = 5;

  @Input() filterAllowNesting = false;
  @Input() filters = null;
  @Input() filterFieldTranslationPattern = '<fieldId>';

  filterSetId: ID;

  get hasFilters() {
    return !!this.filters;
  }

  constructor(private csdFilterService: CsdFilterService) {
    super();
  }

  ngOnInit() {
    if (this.hasFilters) {
      this.initFilters();
    }
  }

  initFilters() {
    if (this.filterAllowNesting) {
      this.filters.push({ fieldId: CONTAINER_FIELD_ID, filter: CsdFilterContainerComponent });
    }
    this.filterSetId = this.csdFilterService.createOrUpdateGlobalFilterSet({
      availableFilters: this.filters,
      filterQuery: {},
      filterFieldTranslationPattern: this.filterFieldTranslationPattern,
    });
    this.dataSource.registerFilterQueryStream(
      this.csdFilterService
        .getGlobalFilterSetById$(this.filterSetId)
        .pipe(map((filterSet) => filterSet.filterQuery))
    );
  }
}
