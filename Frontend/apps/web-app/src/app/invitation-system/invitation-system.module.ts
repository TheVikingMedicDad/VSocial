import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { InvitationSystemRoutingModule } from './invitation-system-routing.module';
import { CsdInvitationCheckPageComponentComponent } from './csd-invitation-check-page-component/csd-invitation-check-page-component.component';

@NgModule({
  imports: [SharedModule, InvitationSystemRoutingModule],
  declarations: [CsdInvitationCheckPageComponentComponent],
})
export class InvitationSystemModule {}
