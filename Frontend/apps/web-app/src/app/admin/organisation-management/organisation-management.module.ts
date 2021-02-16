import { NgModule } from '@angular/core';

import { OrganisationManagementRoutingModule } from './organisation-management-routing.module';
import { CsdOrganisationManagementPageComponent } from './csd-organisation-management-page/csd-organisation-management-page.component';
import { CsdOrganisationListComponent } from './csd-organisation-list/csd-organisation-list.component';
import { SharedModule } from '../../shared/shared.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

@NgModule({
  imports: [
    SharedModule,
    OrganisationManagementRoutingModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
  ],
  declarations: [CsdOrganisationManagementPageComponent, CsdOrganisationListComponent],
})
export class OrganisationManagementModule {}
