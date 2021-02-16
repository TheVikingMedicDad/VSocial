import { NgModule } from '@angular/core';
import { CsdUserInvitationListPageComponent } from './csd-user-invitation-list-page/csd-user-invitation-list-page.component';
import { CsdUserInvitationListComponent } from './csd-user-invitation-list/csd-user-invitation-list.component';
import { CsdUserInvitationCrudPageComponent } from './csd-user-invitation-crud-page/csd-user-invitation-crud-page.component';
import { CsdUserInvitationModelComponent } from './csd-user-invitation-model/csd-user-invitation-model.component';
import { SharedModule } from '../shared/shared.module';
import { UserInvitationRoutingModule } from './user-invitation-routing.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { CsdUserInvitationAcceptPageComponent } from './csd-user-invitation-accept-page/csd-user-invitation-accept-page.component';
import { CsdModelListModule } from '../features/csd-model-list/csd-model-list.module';

@NgModule({
  imports: [
    SharedModule,
    CsdModelListModule,
    UserInvitationRoutingModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
  ],
  declarations: [
    CsdUserInvitationListPageComponent,
    CsdUserInvitationListComponent,
    CsdUserInvitationCrudPageComponent,
    CsdUserInvitationModelComponent,
    CsdUserInvitationAcceptPageComponent,
  ],
})
export class UserInvitationModule {}
