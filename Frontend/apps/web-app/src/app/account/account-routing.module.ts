import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CsdAccountPageComponent } from './csd-account-page/csd-account-page.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [],
    children: [{ path: '', component: CsdAccountPageComponent }],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  declarations: [],
  exports: [RouterModule],
})
export class AccountRoutingModule {}
