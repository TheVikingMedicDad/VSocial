import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PATH_NAME_ORGANISATION_LIST } from '../../core/constants/router.constants';
import { CsdOrganisationManagementPageComponent } from './csd-organisation-management-page/csd-organisation-management-page.component';

const routes: Routes = [
  { path: '', redirectTo: PATH_NAME_ORGANISATION_LIST, pathMatch: 'full' },
  {
    path: PATH_NAME_ORGANISATION_LIST,
    component: CsdOrganisationManagementPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganisationManagementRoutingModule {}
