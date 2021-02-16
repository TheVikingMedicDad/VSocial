import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {
  ADMIN_APPS,
  ADMIN_APPS_TRANS_KEY,
  ADMIN_APPS_TRANS_KEY_NAME,
  ADMIN_ICON_LG,
  PATH_ADMIN_APP_IMAGES,
} from '../../core/constants/general.constants';
import { AdminApp } from '../admin.types';
import { PATH_ADMIN } from '../../core/constants/router.constants';
import { PAGE_KEY_ADMIN_DASHBOARD } from '../../core/constants/page.constants';
import { CsdCurrentPageService } from '../../core/services/csd-current-page.service';

@Component({
  selector: 'csd-admin-dashboard',
  templateUrl: './csd-admin-dashboard.component.html',
  styleUrls: ['./csd-admin-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdAdminDashboardComponent implements OnInit {
  apps = ADMIN_APPS;

  constructor(private csdCurrentPageService: CsdCurrentPageService) {}

  ngOnInit() {
    this.csdCurrentPageService.setCurrentPageKey$(PAGE_KEY_ADMIN_DASHBOARD);
  }

  iconPath(app: AdminApp) {
    return PATH_ADMIN_APP_IMAGES + '/' + app.nameKey.toLocaleLowerCase() + '/' + ADMIN_ICON_LG;
  }

  transKey(key: string) {
    return ADMIN_APPS_TRANS_KEY + '.' + key;
  }

  appTitleKey(app: AdminApp) {
    return this.transKey(app.nameKey + '.' + ADMIN_APPS_TRANS_KEY_NAME);
  }

  appLink(app) {
    const linkName = app.nameKey.toLocaleLowerCase().replace(/_/g, '-');
    return PATH_ADMIN + '/' + linkName;
  }

  //TODO: to implement reordering with drag and drop:
  // we can use
  // - https://stackblitz.com/edit/drag-drop-dashboard?file=src%2Fapp%2Fdashboard%2Fdashboard.component.ts
  // - https://github.com/angular/material2/issues/13372
  // - https://github.com/swiety85/angular2gridster
}
