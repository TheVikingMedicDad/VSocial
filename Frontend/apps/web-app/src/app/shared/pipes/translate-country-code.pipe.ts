import { Pipe, PipeTransform } from '@angular/core';
import { I18NextPipe } from 'angular-i18next';

@Pipe({ name: 'translateCountryCode' })
export class TranslateCountryCodePipe implements PipeTransform {
  constructor(private i18NextPipe: I18NextPipe) {}

  transform(countryCode): string {
    if (countryCode === '') return countryCode;

    return this.i18NextPipe.transform(getCountryTranslationKey(countryCode));
  }
}

/**
 * Helper function to get the translation key of a given country code
 * @param countryCode e.g. DE or AT
 */
export function getCountryTranslationKey(countryCode: string) {
  return `COUNTRY_SELECTOR.OPTIONS.${countryCode}`;
}
