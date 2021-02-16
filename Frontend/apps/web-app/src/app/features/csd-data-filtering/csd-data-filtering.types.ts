import { ID } from '../../core/core.types';
import { CsdBaseFilterComponent } from './filters/csd-base-filter.component';

export interface CsdFilterSet {
  availableFilters: CsdFilterEntry[];
  filterQuery: any;
  filterFieldTranslationPattern: string;
}

export interface CsdFilterEntry {
  fieldId: string;
  filter: new (...args: any[]) => CsdBaseFilterComponent;
  filterOptions?: any;
}

export interface CsdFilterOptions {
  availableFilters: CsdFilterEntry[];
  filterQuery: any;
}
