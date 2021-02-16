import {
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  ViewContainerRef,
  Directive,
} from '@angular/core';
import { UnsubscribeBaseComponent } from '../../../shared/unsubscribe-base.component';
import { CsdFilterEntry } from '../csd-data-filtering.types';
import { I18NextPipe } from 'angular-i18next';
import {
  AllFilterVariants,
  CONTAINER_FIELD_ID,
  LogicalFilterOperator,
} from '../csd-data-filtering.constants';
import { camelCaseToSnakeCase } from '../../../shared/utils';
import { ID } from '../../../core/core.types';
import { isEqual } from 'lodash-es';
import { isFieldIdContainer } from '../csd-data-filtering.utils';

@Directive()
export abstract class CsdBaseFilterComponent<OptionsType = any>
  extends UnsubscribeBaseComponent
  implements OnInit, OnDestroy {
  private placeholderFieldId = '<fieldId>';
  @Input() availableFilters: CsdFilterEntry[];
  @Input() filterFieldTranslationPattern;
  @Input() fieldId: string;
  @Input() containerFieldNameTranslationKey =
    'FILTER_CONFIGURATOR.FILTER_CONTAINER.CONTAINER_FIELD_NAME';
  @Input() filterVariantTranslationPrefix = 'FILTER_CONFIGURATOR.FILTER_VARIANTS';
  @Output() queryChanged: EventEmitter<any> = new EventEmitter();
  @Output() destroyMe: EventEmitter<any> = new EventEmitter();
  @Input() placeholderFilterTermTranslationKey =
    'FILTER_CONFIGURATOR.FILTERS.BASE_FILTER.PLACEHOLDER_FILTER_TERM';

  protected _filterQuery = {};
  protected _filterOptions: OptionsType;

  @Input()
  set filterQuery(value: any) {
    //check if new value is same as existing
    if (!isEqual(value, this._filterQuery)) {
      console.log('CsdBaseFilterComponent.filterQuery changed: ', this.constructor['name'], value);
      this._filterQuery = value;
      this.updateUi();
    }
  }
  get filterQuery() {
    return this._filterQuery;
  }

  @Input()
  set filterOptions(options: OptionsType) {
    this._filterOptions = options;
  }
  get filterOptions(): OptionsType {
    return this._filterOptions;
  }

  abstract updateUi(): void;

  constructor(protected i18NextPipe: I18NextPipe) {
    super();
  }

  ngOnInit(): void {
    this.updateUi();
  }

  triggerQueryChange(): void {
    this.queryChanged.emit(this.filterQuery);
  }

  destroy(): void {
    this.filterQuery = null;
    this.destroyMe.emit();
  }

  protected _getFilterFieldIdFromQuery(query: any): string {
    const field = Object.keys(query)[0];
    if (isFieldIdContainer(field)) {
      return field;
    } else {
      return field.split('_')[0];
    }
  }

  protected _getFilterVariantFromQuery(query: any): string {
    const field = Object.keys(query)[0];
    const fieldId = field.split('_')[0];
    return field.replace(fieldId + '_', '');
  }

  protected _getFilterTermFromQuery(query: any): string {
    if (!query) {
      return null;
    }
    return Object.values<string>(query)[0];
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  translateFieldId(fieldId: ID): string {
    if (fieldId === CONTAINER_FIELD_ID) {
      return this.i18NextPipe.transform(this.containerFieldNameTranslationKey);
    }
    const upperSnakeCaseedFieldId = camelCaseToSnakeCase(fieldId).toUpperCase();

    if (!this.filterFieldTranslationPattern) {
      return '';
    }
    const translationKey = this.filterFieldTranslationPattern.replace(
      this.placeholderFieldId,
      upperSnakeCaseedFieldId
    );

    return this.i18NextPipe.transform(translationKey);
  }

  translateFilterVariant(filterVariantId: string) {
    return this.i18NextPipe.transform(`${this.filterVariantTranslationPrefix}.${filterVariantId}`);
  }
}
