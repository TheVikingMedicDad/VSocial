import {
  APP_BASE_HREF,
  isPlatformBrowser,
  PathLocationStrategy,
  PlatformLocation,
} from '@angular/common';
import { Inject, Injectable, Optional, PLATFORM_ID } from '@angular/core';

/***
 * This class is getting injected by AppRoutingModule
 *
 * It's purpose is to skip doubled entries in the browser's history when calling Location.back()
 * This can happen e.g. if:
 *
 * the user follows this path: startpage -> view -> edit -> view
 * in this case the `edit` page gets replaced by the second view
 * now the browser history has: startpage -> view -> view.
 * as a user when i press `back` i then want to come back to startpage
 *
 * a better approach would be to delete the first `view` entry out of the history. but
 * html5 only supports to replace the last history entry with the current page but not deleting the last entry
 */
@Injectable()
export class CsdLocationStrategy extends PathLocationStrategy {
  private _pushHistory: string[] = [];

  constructor(
    _platformLocation: PlatformLocation,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Optional() @Inject(APP_BASE_HREF) href?: string
  ) {
    super(_platformLocation, href);
  }

  pushState(state: any, title: string, url: string, queryParams: string): void {
    super.pushState(state, title, url, queryParams);
    this._pushHistory.push(url);
  }

  replaceState(state: any, title: string, url: string, queryParams: string) {
    super.replaceState(state, title, url, queryParams);
    this._pushHistory.pop();
    this._pushHistory.push(url);
  }

  private _getLastPushedUrl() {
    if (this._pushHistory.length > 0) {
      return this._pushHistory[this._pushHistory.length - 1];
    } else {
      return null;
    }
  }

  private _numberOfSameEntriesInHistoryStack() {
    let count = 0;
    const lastPushedUrl = this._getLastPushedUrl();
    for (let i = this._pushHistory.length - 1; i >= 0; i--) {
      if (this._pushHistory[i] === lastPushedUrl) count++;
      else break;
    }
    return count;
  }

  back(): void {
    // if go back twice
    const goBackDelta = this._numberOfSameEntriesInHistoryStack();
    if (goBackDelta > 1 && isPlatformBrowser(this.platformId)) {
      for (let i = 0; i < goBackDelta; i++) this._pushHistory.pop();
      window.history.go(goBackDelta * -1);
    } else {
      this._pushHistory.pop();
      super.back();
    }
  }

  getPushHistory() {
    return this._pushHistory;
  }
}
