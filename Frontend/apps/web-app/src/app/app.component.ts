import { Component, Inject, Injector, PLATFORM_ID } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { csdProjectKey } from './core/constants/general.constants';
import { isPlatformServer } from '@angular/common';
import { I18NEXT_SERVICE, ITranslationService } from 'angular-i18next';
import { CsdPlatform } from './core/services/csd-version.types';
import { CsdVersionService } from './core/services/csd-version.service';

const DEFAULT_BROWSER_LANG = 'en';

@Component({
  selector: 'csd-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'webapp';
  csdProjectTheme = `${csdProjectKey}-theme`;
  platform: CsdPlatform;
  language: string;

  constructor(
    overlayContainer: OverlayContainer,
    @Inject(I18NEXT_SERVICE) private i18NextService: ITranslationService,
    injector: Injector,
    private csdVersionService: CsdVersionService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.platform = csdVersionService.getFrontendInfo().platform;
    overlayContainer.getContainerElement().classList.add('csd-theme-default-light');
    overlayContainer.getContainerElement().classList.add(this.csdProjectTheme);

    // if we are in ssr-mode we have to detect the language from the request:
    if (isPlatformServer(platformId)) {
      const lang = this._ssrDetectBrowserRequestLanguage(injector.get('REQUEST'));
      if (lang != 'en') {
        i18NextService.changeLanguage(lang);
      }
    }
    this.language = i18NextService.language;
  }

  private _ssrDetectBrowserRequestLanguage(request: any) {
    // TODO: parsing here is dirty, use a well-proofed parser here
    // e.g. this will fail when there is no accept-language header...
    const browserLang = request.get('accept-language') as string;
    if (browserLang === undefined) return DEFAULT_BROWSER_LANG;
    const acceptedLanguages = browserLang.split(',');
    if (acceptedLanguages.length > 0 && acceptedLanguages[0].toLowerCase().startsWith('de')) {
      return 'de';
    }
    return DEFAULT_BROWSER_LANG;
  }
}
