import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { PAGE_KEY_DASHBOARD } from '../../../core/constants/page.constants';
import { CsdCurrentPageService } from '../../../core/services/csd-current-page.service';
import { BiEvent } from '../../../features/csd-bi/csd-bi.types';
import { CsdBiService } from '../../../features/csd-bi/csd-bi.service';

@Component({
  selector: 'csd-dashboard-component-page',
  templateUrl: './csd-dashboard-page.component.html',
  styleUrls: ['./csd-dashboard-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdDashboardPageComponent implements OnInit {
  constructor(
    private csdCurrentPageService: CsdCurrentPageService,
    private csdBiService: CsdBiService
  ) {}

  ngOnInit() {
    this.csdCurrentPageService.setCurrentPageKey$(PAGE_KEY_DASHBOARD);
    this.csdBiService.logEvent(BiEvent.VIEWED_DASHBOARD);
  }
}
