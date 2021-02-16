import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  // 
  PATH_NAME_ORGANISATIONS,
  PATH_NAME_USER_MANAGEMENT,
} from '../core/constants/router.constants';
import { CsdAdminDashboardPageComponent } from './csd-admin-dashboard-page/csd-admin-dashboard-page.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [],
    children: [{ path: '', component: CsdAdminDashboardPageComponent }],
  },
  {
    path: PATH_NAME_USER_MANAGEMENT,
    loadChildren: () =>
      import('./user-management/user-management.module').then((m) => m.UserManagementModule),
  },
  {
    path: PATH_NAME_ORGANISATIONS,
    loadChildren: () =>
      import('./organisation-management/organisation-management.module').then(
        (m) => m.OrganisationManagementModule
      ),
  },
  // 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
