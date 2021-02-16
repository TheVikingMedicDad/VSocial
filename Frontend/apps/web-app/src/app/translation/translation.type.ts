export interface Language {
  readonly translationKey: string; // e.g. ENGLISH
  readonly languageKey: string; // e.g. en
  readonly momentKey: string; // e.g. en-ca
}

export interface TranslationObject {
  key: string;
  payload: { [key: string]: any };
}

export function ensureTranslationObjectType(
  translationObject: TranslationObject | string
): TranslationObject {
  if (typeof translationObject === 'string') {
    return { key: translationObject, payload: {} };
  }
  return <TranslationObject>translationObject;
}
