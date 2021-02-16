import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  ChangeDetectorRef,
} from '@angular/core';
import { CsdDataService } from '../../../core/services/csd-data.service';
import { countFilters } from '../csd-data-filtering.utils';
import { UnsubscribeBaseComponent } from '../../../shared/unsubscribe-base.component';
import { CsdFilterService } from '../csd-filter.service';

@Component({
  selector: 'csd-filter-button',
  templateUrl: './csd-filter-button.component.html',
  styleUrls: ['./csd-filter-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdFilterButtonComponent extends UnsubscribeBaseComponent implements OnInit {
  @Input() filterSetId: string;
  @Input() buttonTranslationKey: string;
  filterCount = 0;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private csdDataService: CsdDataService,
    private csdFilterService: CsdFilterService
  ) {
    super();
  }

  ngOnInit() {
    this.addSubscription(
      this.csdFilterService.getGlobalFilterSetById$(this.filterSetId).subscribe((filterSet) => {
        this.filterCount = countFilters(filterSet.filterQuery);
        this.changeDetectorRef.markForCheck();
      })
    );
  }

  showFilterConfigurator() {
    this.csdFilterService.showFilterConfigurator(this.filterSetId);
  }
}
