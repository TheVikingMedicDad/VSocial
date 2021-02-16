import { NgModule } from '@angular/core';
import { LayoutModule } from '@angular/cdk/layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SharedModule } from '../shared/shared.module';
import { CsdMainLayoutComponent } from './csd-main-layout/csd-main-layout.component';
import { RouterModule } from '@angular/router';
import { CsdPublicToolbarComponent } from './csd-public-toolbar/csd-public-toolbar.component';
import { CsdUserToolbarComponent } from './csd-user-toolbar/csd-user-toolbar.component';
import { CsdMainSidenavComponent } from './csd-main-sidenav/csd-main-sidenav.component';

@NgModule({
  imports: [
    SharedModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    RouterModule,
  ],
  declarations: [
    CsdMainLayoutComponent,
    CsdPublicToolbarComponent,
    CsdUserToolbarComponent,
    CsdMainSidenavComponent,
  ],
  exports: [CsdMainLayoutComponent, CsdPublicToolbarComponent, CsdUserToolbarComponent],
})
export class MainModule {}
