import { Injectable } from '@angular/core';
import { NavigationExtras, Params, Router, UrlTree } from '@angular/router';
import { get, set } from 'lodash-es';

@Injectable({
  providedIn: 'root',
})
export class CsdRouterUtilsService {
  urlsToBeReplaced = [
    new RegExp('\\(main-sidenav:(.+)\\/add\\)$'),
    new RegExp('\\(main-sidenav:(.+)\\/new(;.+)?\\)$'),
    new RegExp('\\(main-sidenav:.+\\/edit\\/(.+)\\)$'),
    new RegExp('\\(main-sidenav:.+\\/edit\\)$'),
  ];

  constructor(private router: Router) {}

  goAndSaveTarget(target: string, saveTarget: string, extras: NavigationExtras = {}) {
    console.log(`CsdRouterUtilsService.goAndSaveTarget: target ${target} saveTarget ${saveTarget}`);
    set(extras, ['queryParams', 'target'], encodeURIComponent(saveTarget));
    this.router.navigate([target], extras);
  }

  goToSavedTarget(
    queryParams: Params,
    defaultValue: string = '/',
    extras: NavigationExtras = {}
  ): string {
    const target = decodeURIComponent(get(queryParams, 'target', defaultValue));
    console.log(`CsdRouterUtilsService.goToSavedTarget: target ${target}`);
    this.router.navigateByUrl(target, extras);
    return target;
  }

  go(target: string | UrlTree | any[], extras: NavigationExtras = {}) {
    console.log('CsdRouterUtilsService.go:', target, 'params', extras);
    if (Array.isArray(target)) {
      this.router.navigate(<any[]>target, extras);
    } else {
      this.router.navigateByUrl(<string | UrlTree>target, extras);
    }
  }

  navigate(commands: any[], extras?: NavigationExtras): Promise<boolean> {
    const actualUrl = this.router.url;
    let comingFromReplacingUrl = false;
    // if coming from an edit or add mode, we have to replace the url when navigating
    for (const regexp of this.urlsToBeReplaced) {
      if (regexp.test(actualUrl)) {
        comingFromReplacingUrl = true;
        console.log('CsdRouterUtilsService.navigate: Replacing Url');
        break;
      }
    }

    const newExtras = extras !== undefined ? extras : {};
    if (newExtras.replaceUrl === undefined && comingFromReplacingUrl) {
      newExtras['replaceUrl'] = true;
    }
    return this.router.navigate(commands, newExtras);
  }
}
