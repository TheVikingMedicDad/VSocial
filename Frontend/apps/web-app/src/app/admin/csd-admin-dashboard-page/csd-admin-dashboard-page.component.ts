import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {
  PAGE_KEY_ADMIN_DASHBOARD,
  PAGE_KEY_USER_MANAGEMENT,
} from '../../core/constants/page.constants';
import { CsdCurrentPageService } from '../../core/services/csd-current-page.service';

@Component({
  selector: 'csd-admin-dashboard-page',
  templateUrl: './csd-admin-dashboard-page.component.html',
  styleUrls: ['./csd-admin-dashboard-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdAdminDashboardPageComponent implements OnInit {
  constructor(private csdCurrentPageService: CsdCurrentPageService) {}

  ngOnInit() {
    this.csdCurrentPageService.setCurrentPageKey$(PAGE_KEY_ADMIN_DASHBOARD);
  }
}
