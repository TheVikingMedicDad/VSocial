import { TranslationObject } from '../../translation/translation.type';

export interface CarouselItem {
  title: string | TranslationObject;
  imageSrc: string;
  description: string | TranslationObject;
}
