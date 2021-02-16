import { NgModule } from '@angular/core';
import { AdminRoutingModule } from './admin-routing.module';
import { CsdAdminDashboardComponent } from './csd-admin-dashboard/csd-admin-dashboard.component';
import { SharedModule } from '../shared/shared.module';
import { CsdAdminDashboardPageComponent } from './csd-admin-dashboard-page/csd-admin-dashboard-page.component';

@NgModule({
  imports: [SharedModule, AdminRoutingModule],
  declarations: [CsdAdminDashboardComponent, CsdAdminDashboardPageComponent],
})
export class AdminModule {}
