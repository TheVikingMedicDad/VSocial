import { NgModule } from '@angular/core';
import { CsdUserListComponent } from './csd-user-list/csd-user-list.component';
import { UserManagementRoutingModule } from './user-management-routing.module';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { SharedModule } from '../../shared/shared.module';
import { CsdUserManagementPageComponent } from './csd-user-management-page/csd-user-management-page.component';
import { CsdUserModelComponent } from './csd-user-model/csd-user-model.component';
import { CsdUserEditPageComponent } from './csd-user-edit-page/csd-user-edit-page.component';
import { CsdUserViewPageComponent } from './csd-user-view-page/csd-user-view-page.component';
import { CsdUserAddPageComponent } from './csd-user-add-page/csd-user-add-page.component';
import { CsdMatPaginatorIntl } from '../../translation/csd-mat-paginator-intl';
import { CsdSelectModule } from '../../shared/components/csd-select/csd-select.module';
import { CsdModelListModule } from '../../features/csd-model-list/csd-model-list.module';

@NgModule({
  imports: [
    SharedModule,
    CsdSelectModule,
    UserManagementRoutingModule,
    MatTableModule,
    MatSortModule,
    MatMenuModule,
    CsdModelListModule,
  ],
  declarations: [
    CsdUserListComponent,
    CsdUserManagementPageComponent,
    CsdUserModelComponent,
    CsdUserEditPageComponent,
    CsdUserViewPageComponent,
    CsdUserAddPageComponent,
  ],
  providers: [{ provide: MatPaginatorIntl, useClass: CsdMatPaginatorIntl }],
})
export class UserManagementModule {}
