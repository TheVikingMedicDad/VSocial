import { NgModule } from '@angular/core';
import { CsdAccountPageComponent } from './csd-account-page/csd-account-page.component';
import { SharedModule } from '../shared/shared.module';
import { AccountRoutingModule } from './account-routing.module';
import { MainModule } from '../main/main.module';
import { CsdAccountSettingsComponent } from './csd-account-settings/csd-account-settings.component';

@NgModule({
  imports: [SharedModule, AccountRoutingModule, MainModule],
  declarations: [CsdAccountPageComponent, CsdAccountSettingsComponent],
  entryComponents: [],
  exports: [],
  providers: [],
})
export class AccountModule {}
