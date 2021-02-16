import { MatPaginatorIntl } from '@angular/material/paginator';
import { Inject, Injectable } from '@angular/core';
import { I18NEXT_SERVICE, ITranslationService } from 'angular-i18next';

@Injectable()
export class CsdMatPaginatorIntl extends MatPaginatorIntl {
  itemsPerPageLabel = 'Items per page';
  nextPageLabel = 'Next page';
  previousPageLabel = 'Previous page';
  ofString = 'of';

  constructor(@Inject(I18NEXT_SERVICE) private i18NextService: ITranslationService) {
    super();

    this.i18NextService.events.initialized.subscribe((ok) => {
      this.itemsPerPageLabel = i18NextService.t('PAGINATOR.ITEMS_PER_PAGE');
      this.nextPageLabel = i18NextService.t('PAGINATOR.NEXT_PAGE');
      this.previousPageLabel = i18NextService.t('PAGINATOR.PREV_PAGE');
      this.ofString = i18NextService.t('PAGINATOR.OF');
    });
  }

  getRangeLabel = function (page, pageSize, length) {
    if (length === 0 || pageSize === 0) {
      return '0 ' + this.ofString + ' ' + length;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex =
      startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
    return startIndex + 1 + ' - ' + endIndex + ' ' + this.ofString + ' ' + length;
  };
}
