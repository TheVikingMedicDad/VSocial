import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { CsdDataService } from '../../../core/services/csd-data.service';
import { CsdFilterSet } from '../csd-data-filtering.types';
import { UnsubscribeBaseComponent } from '../../../shared/unsubscribe-base.component';
import { CsdFilterContainerComponent } from '../filters/csd-filter-container/csd-filter-container.component';
import { CsdFilterService } from '../csd-filter.service';
import { CsdMainStateService } from '../../../main/state/csd-main-state.service';

@Component({
  selector: 'csd-filter-configurator',
  templateUrl: './csd-filter-configurator.component.html',
  styleUrls: ['./csd-filter-configurator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdFilterConfiguratorComponent extends UnsubscribeBaseComponent implements OnInit {
  @Input() filterSetId;
  filterSet: CsdFilterSet;
  @ViewChild('rootFilterContainer')
  rootFilterContainer: CsdFilterContainerComponent;
  countFilterWidgets = 0;

  constructor(
    private csdDataService: CsdDataService,
    private csdFilterService: CsdFilterService,
    private changeDetectorRef: ChangeDetectorRef,
    private csdMainStateService: CsdMainStateService
  ) {
    super();
  }

  ngOnInit() {
    this.addSubscription(
      this.csdFilterService.getGlobalFilterSetById$(this.filterSetId).subscribe((filterSet) => {
        this.filterSet = filterSet;
        this.changeDetectorRef.markForCheck();
      })
    );
  }

  cancel() {
    this.csdMainStateService.cancelMainSidenav();
  }

  onQueryChange(filterQuery) {
    // preparation of new query to be put in the state
    const newFilterQuery = { ...this.filterSet, filterQuery: filterQuery };
    this.csdFilterService.createOrUpdateGlobalFilterSet(newFilterQuery, this.filterSetId);
  }
}
