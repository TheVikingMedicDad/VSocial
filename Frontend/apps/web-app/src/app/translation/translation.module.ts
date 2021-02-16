import { APP_INITIALIZER, LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  I18NEXT_SERVICE,
  I18NextLoadResult,
  I18NextModule,
  ITranslationService,
} from 'angular-i18next';
import XHR from 'i18next-xhr-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { LANGUAGES } from '../core/constants/general.constants';

const i18nextOptions = {
  whitelist: LANGUAGES,
  fallbackLng: 'en',
  debug: false,
  returnEmptyString: false,
  returnObjects: true,
  ns: ['vsp', 'csd'],
  fallbackNS: ['vsp', 'csd'],
  defaultNS: 'vsp',
  //backend plugin options
  backend: {
    loadPath: function (langs, ns) {
      // 
      //TODO: Add remote workspaces base eg on ns ending like "-remote" then the path returns should be like "/api/translation/..."
      return '/assets/i18n/{{lng}}.{{ns}}.json';
      // 
    },
  },
  // lang detection plugin options
  detection: {
    // order and from where user language should be detected
    order: ['cookie'],

    // keys or params to lookup language from
    lookupCookie: 'lang',

    // cache user language on
    caches: ['cookie'],
  },
};

export function appInit(i18next: ITranslationService) {
  return () => {
    const promise: Promise<I18NextLoadResult> = i18next
      .use(XHR)
      .use(LanguageDetector)
      .init(i18nextOptions);
    return promise;
  };
}

export function localeIdFactory(i18next: ITranslationService) {
  return i18next.language;
}

export const I18N_PROVIDERS = [
  {
    provide: APP_INITIALIZER,
    useFactory: appInit,
    deps: [I18NEXT_SERVICE],
    multi: true,
  },
  {
    provide: LOCALE_ID,
    deps: [I18NEXT_SERVICE],
    useFactory: localeIdFactory,
  },
];

@NgModule({
  imports: [CommonModule, I18NextModule.forRoot()],
  declarations: [],
  providers: [I18N_PROVIDERS],
})
export class TranslationModule {}
