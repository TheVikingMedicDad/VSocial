import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { PATH_PARAM_ID } from '../../../core/constants/router.constants';
import { tap } from 'rxjs/operators';
import { ParamMap, ActivatedRoute } from '@angular/router';
import { UnsubscribeBaseComponent } from '../../../shared/unsubscribe-base.component';

@Component({
  templateUrl: './csd-filter-configurator-page.component.html',
  styleUrls: ['./csd-filter-configurator-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdFilterConfiguratorPageComponent extends UnsubscribeBaseComponent implements OnInit {
  filterSetId: string;
  constructor(
    private activatedRoute: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit() {
    this.addSubscription(
      this.activatedRoute.paramMap
        .pipe(
          tap((params: ParamMap) => {
            this.filterSetId = params.get(PATH_PARAM_ID);
            this.changeDetectorRef.markForCheck();
          })
        )
        .subscribe()
    );
  }
}
