import { APP_INITIALIZER, LOCALE_ID, NgModule } from '@angular/core';
import {
  I18NEXT_SERVICE,
  I18NextLoadResult,
  I18NextModule,
  ITranslationService,
} from 'angular-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { LANGUAGES } from '../core/constants/general.constants';
import * as Backend from 'i18next-node-fs-backend';

const i18nextOptionsServer = {
  whitelist: LANGUAGES,
  fallbackLng: 'en',
  debug: false,
  returnEmptyString: false,
  returnObjects: true,
  ns: ['vsp', 'csd'],
  fallbackNS: ['vsp', 'csd'],
  defaultNS: 'vsp',

  backend: {
    // 
    // path where resources get loaded from
    loadPath: './dist/apps/webapp/browser/assets/i18n/{{lng}}.{{ns}}.json', //TODO: this should come from a constant
    // 

    // custom parser
    //parse: function(data) { return data; }
  },
  preload: ['en', 'de'], // important in backend mode!
};

export function appInitServer(i18next: ITranslationService) {
  return () => {
    const promise: Promise<I18NextLoadResult> = i18next
      .use(Backend)
      .use(LanguageDetector)
      .init(i18nextOptionsServer);
    return promise;
  };
}

export function localeIdFactoryServer(i18next: ITranslationService) {
  return i18next.language;
}

export const I18N_PROVIDERS_SERVER = [
  {
    provide: APP_INITIALIZER,
    useFactory: appInitServer,
    deps: [I18NEXT_SERVICE],
    multi: true,
  },
  {
    provide: LOCALE_ID,
    deps: [I18NEXT_SERVICE],
    useFactory: localeIdFactoryServer,
  },
];

@NgModule({
  imports: [I18NextModule.forRoot()],
  declarations: [],
  providers: [I18N_PROVIDERS_SERVER],
})
export class TranslationModuleServer {}
