import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import {
  ensureTranslationObjectType,
  TranslationObject,
} from '../../../translation/translation.type';
import { I18NextService } from 'angular-i18next';

@Component({
  selector: 'csd-carousel-item',
  templateUrl: './csd-carousel-item.component.html',
  styleUrls: ['./csd-carousel-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdCarouselItemComponent implements OnInit {
  @Input() title: string | TranslationObject;
  @Input() imageSrc: string;
  @Input() description: string | TranslationObject;
  @Input() isActive = false;

  constructor(private i18NextService: I18NextService) {}

  ngOnInit() {
    const titleTranslationObject = ensureTranslationObjectType(this.title);
    this.title = this.i18NextService.t(titleTranslationObject.key, titleTranslationObject.payload);
    const descriptionTranslationObject = ensureTranslationObjectType(this.description);
    this.description = this.i18NextService.t(
      descriptionTranslationObject.key,
      descriptionTranslationObject.payload
    );
  }
}
