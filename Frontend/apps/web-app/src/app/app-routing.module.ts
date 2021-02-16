import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  PATH_APP_ENTRY_PAGE,
  PATH_LOGIN,
  PATH_NAME_ADMIN,
  PATH_NAME_APP_ENTRY_PAGE,
  PATH_NAME_LOGIN,
  PATH_NAME_REGISTER,
  PATH_NAME_USER_ACCOUNT,
  PATH_REGISTER,
  PATH_NAME_COMPONENT_LIBRARY,
  PATH_NAME_USER_INVITATION,
  PATH_NAME_INVITATION_SYSTEM,
  PATH_NAME_DATA_FILTERING,
  PATH_NAME_TODO,
  PAGE_NOT_FOUND,
} from './core/constants/router.constants';
import { CsdUserToolbarComponent } from './main/csd-user-toolbar/csd-user-toolbar.component';
import { CsdUserAuthenticatedGuard } from './core/guards/csd-user-authenticated.guard';
import { CsdDashboardPageComponent } from './shared/components/csd-dashboard-page/csd-dashboard-page.component';
import { LocationStrategy } from '@angular/common';
import { CsdLocationStrategy } from './core/csd-location-strategy';
import { CsdNotFoundComponent } from './shared/components/csd-not-found/csd-not-found.component';

const routes: Routes = [
  // 
  { path: '', redirectTo: PATH_NAME_TODO, pathMatch: 'full' },
  { path: PATH_NAME_APP_ENTRY_PAGE, redirectTo: PATH_NAME_TODO, pathMatch: 'full' },
  // 
  { path: PATH_NAME_LOGIN, redirectTo: PATH_LOGIN, pathMatch: 'full' },
  { path: PATH_NAME_REGISTER, redirectTo: PATH_REGISTER, pathMatch: 'full' },

  // all routes which can occur in the main-sidenav must also be added here
  {
    outlet: 'main-sidenav', // these are only routes which work in the outlet of the main-sidenav
    path: '',
    children: [
      // 
      {
        path: PATH_NAME_TODO,
        children: [
          {
            path: '',
            loadChildren: () =>
              import('./todo/todo-routing.module').then((m) => m.TodoRoutingModule),
          },
        ],
      },
      // 
      {
        canActivate: [CsdUserAuthenticatedGuard],
        path: PATH_NAME_ADMIN,
        loadChildren: () => import('./admin/admin.module').then((m) => m.AdminModule),
      },
      {
        path: PATH_NAME_USER_INVITATION,
        children: [
          {
            path: '',
            loadChildren: () =>
              import('./user-invitation/user-invitation.module').then(
                (m) => m.UserInvitationModule
              ),
          },
          { path: '', component: CsdUserToolbarComponent, outlet: 'main-toolbar' },
        ],
      },
      {
        path: PATH_NAME_DATA_FILTERING,
        loadChildren: () =>
          import('./features/csd-data-filtering/csd-data-filtering-routing.module').then(
            (m) => m.CsdDataFilteringRoutingModule
          ),
      },
    ],
  },
  {
    path: PATH_NAME_COMPONENT_LIBRARY,
    loadChildren: () =>
      import('./component-library/component-library-routing.module').then(
        (m) => m.ComponentLibraryRoutingModule
      ),
  },
  {
    path: PATH_NAME_INVITATION_SYSTEM,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./invitation-system/invitation-system.module').then(
            (m) => m.InvitationSystemModule
          ),
      },
      { path: '', component: CsdUserToolbarComponent, outlet: 'main-toolbar' },
    ],
  },
  {
    path: '',
    canActivate: [CsdUserAuthenticatedGuard],
    children: [
      // 
      {
        path: PATH_NAME_TODO,
        children: [
          {
            path: '',
            loadChildren: () =>
              import('./todo/todo-routing.module').then((m) => m.TodoRoutingModule),
          },
          { path: '', component: CsdUserToolbarComponent, outlet: 'main-toolbar' },
        ],
      },
      // 
      {
        path: PATH_NAME_USER_ACCOUNT,
        loadChildren: () => import('./account/account.module').then((m) => m.AccountModule),
      },
      {
        path: PATH_NAME_ADMIN,
        children: [
          {
            path: '',
            loadChildren: () => import('./admin/admin.module').then((m) => m.AdminModule),
          },
          { path: '', component: CsdUserToolbarComponent, outlet: 'main-toolbar' },
        ],
      },
      {
        path: PATH_NAME_USER_INVITATION,
        children: [
          {
            path: '',
            loadChildren: () =>
              import('./user-invitation/user-invitation.module').then(
                (m) => m.UserInvitationModule
              ),
          },
          { path: '', component: CsdUserToolbarComponent, outlet: 'main-toolbar' },
        ],
      },
    ],
  },
  { path: PAGE_NOT_FOUND, component: CsdNotFoundComponent },
  { path: '**', redirectTo: PAGE_NOT_FOUND },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      initialNavigation: 'enabled',
      enableTracing: false,
    }),
  ],
  declarations: [],
  exports: [RouterModule],
  providers: [{ provide: LocationStrategy, useClass: CsdLocationStrategy }],
})
export class AppRoutingModule {}
