import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CsdUserManagementPageComponent } from './csd-user-management-page/csd-user-management-page.component';
import {
  PATH_NAME_DRAFT_ID,
  PATH_NAME_ID,
  PATH_NAME_USER_ADD,
  PATH_NAME_USER_EDIT,
  PATH_NAME_USER_LIST,
  PATH_NAME_USER_VIEW,
} from '../../core/constants/router.constants';
import { CsdUserViewPageComponent } from './csd-user-view-page/csd-user-view-page.component';
import { CsdUserEditPageComponent } from './csd-user-edit-page/csd-user-edit-page.component';
import { CsdUserAddPageComponent } from './csd-user-add-page/csd-user-add-page.component';

const routes: Routes = [
  { path: '', redirectTo: PATH_NAME_USER_LIST, pathMatch: 'full' },
  {
    path: PATH_NAME_USER_LIST,
    component: CsdUserManagementPageComponent,
  },
  {
    path: PATH_NAME_USER_ADD,
    component: CsdUserAddPageComponent,
  },
  {
    path: PATH_NAME_USER_VIEW + '/' + PATH_NAME_ID,
    component: CsdUserViewPageComponent,
  },
  {
    path: PATH_NAME_USER_EDIT + '/' + PATH_NAME_ID,
    component: CsdUserEditPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserManagementRoutingModule {}
