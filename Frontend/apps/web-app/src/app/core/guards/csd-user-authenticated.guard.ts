import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { CsdCurrentUserService } from '../../auth/csd-current-user.service';
import { CsdRouterUtilsService } from '../csd-router-utils.service';
import { PATH_LOGIN } from '../constants/router.constants';
import { CsdUnauthorizedError } from '../../shared/errors';

@Injectable({
  providedIn: 'root',
})
export class CsdUserAuthenticatedGuard implements CanActivate {
  constructor(
    private csdCurrentUserService: CsdCurrentUserService,
    private csdRouterUtilsService: CsdRouterUtilsService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, routerState: RouterStateSnapshot) {
    return this.canActivateUserAuthentication(route, routerState);
  }

  private canActivateUserAuthentication(
    route: ActivatedRouteSnapshot,
    routerState: RouterStateSnapshot
  ) {
    // console.log(
    //   'CsdUserAuthenticatedGuard.canActivateUserAuthentication: route',
    //   route,
    //   'state',
    //   routerState,
    //   'redirectPath',
    //   route.data.redirectPath
    // );
    const targetUrl = routerState.url;
    const urlSegments = routerState.url.split('/');
    const redirectPath = route.data.redirectPath ? route.data.redirectPath : PATH_LOGIN;

    // if userService cannot load current user i.e. user is not authenticated: go to login page
    // if user is logged in: pass through

    return this.csdCurrentUserService.ifAuthenticatedLoadUser$().pipe(
      catchError((error) => {
        if (error instanceof CsdUnauthorizedError) {
          // invalid token, probably outdated -> delete the token and redirect to login
          this.csdCurrentUserService.setAuthenticationToken(null);
          return of(false);
        } else {
          // probably a network error, we should prevent the canActivate - but do not reset the token
          // it may be valid
          console.log(
            'CsdUserAuthenticatedGuard.ifAuthenticatedLoadUser$: error ',
            typeof error,
            error
          );
          return of(false);
        }
      }),
      tap((userAuthenticated) => {
        if (!userAuthenticated) {
          console.log(
            'CsdUserAuthenticatedGuard.canActivateParticipant: No authentication token. Go to login'
          );
          this.csdRouterUtilsService.goAndSaveTarget(redirectPath, targetUrl);
        }
      })
    );
  }
}
