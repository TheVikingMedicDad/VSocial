import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CsdBaseFilterComponent } from '../csd-base-filter.component';
import { ID } from '../../../../core/core.types';
import { TextFilterVariant } from '../../csd-data-filtering.constants';
import { I18NextPipe } from 'angular-i18next';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import { isEmpty } from 'lodash-es';
import { uuidv4 } from '../../../../core/core.utils';

interface FilterVariant {
  id: ID;
  value: string;
}

interface CsdTextFilterUi {
  filterTerm;
  selectedFilterVariantId;
}

export interface CsdTextFilterOptions {
  filterVariants?: TextFilterVariant[];
}

@Component({
  selector: 'csd-text-filter',
  templateUrl: './csd-text-filter.component.html',
  styleUrls: ['./csd-text-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdTextFilterComponent
  extends CsdBaseFilterComponent<CsdTextFilterOptions>
  implements OnInit, OnDestroy {
  filterVariants: FilterVariant[] = [];
  filterTerm: string;
  selectedFilterVariantId: string;
  title: string;
  ui$: BehaviorSubject<CsdTextFilterUi> = new BehaviorSubject<CsdTextFilterUi>(null);
  selectedFilterInputId = uuidv4();

  constructor(private changeDetectorRef: ChangeDetectorRef, protected i18NextPipe: I18NextPipe) {
    super(i18NextPipe);
  }

  ngOnInit(): void {
    this._initAvailableFilterVariants();

    this.addSubscription(
      this.ui$
        .pipe(
          filter((ui) => !!ui),
          tap(({ filterTerm, selectedFilterVariantId }) => {
            this.changeTitle(filterTerm, selectedFilterVariantId);
            this.filterTerm = filterTerm;
            this.selectedFilterVariantId = selectedFilterVariantId;
            this.changeDetectorRef.markForCheck();
          }),
          filter(({ filterTerm, selectedFilterVariantId }) => !!selectedFilterVariantId),
          tap(({ filterTerm, selectedFilterVariantId }) => {
            this.changeQuery(filterTerm, selectedFilterVariantId);
            // timeout is needed to get the DOM render let work out the changes so that the element is accessible
            setTimeout(() => document.getElementById(this.selectedFilterInputId).focus(), 100);
          })
        )
        .subscribe()
    );
    //needs to be last
    this.updateUi();
  }

  private _initAvailableFilterVariants(): void {
    this.filterVariants = [];
    if (
      this.filterOptions &&
      this.filterOptions.filterVariants &&
      this.filterOptions.filterVariants.length >= 1
    ) {
      const filterVariantValues = this.filterOptions.filterVariants;
      for (const filterVariantValue of filterVariantValues) {
        const index = this._getVariantIdFromVariantValue(filterVariantValue);
        this.filterVariants.push({ id: index, value: filterVariantValue });
      }
    } else {
      for (const index of Object.keys(TextFilterVariant)) {
        const value = TextFilterVariant[index];
        if (!this.filterOptions || this.filterOptions.filterVariants.includes(value)) {
          this.filterVariants.push({ id: index, value: TextFilterVariant[index] });
        }
      }
    }
  }

  changeTitle(filterTerm: string, selectedFilterVariantId: ID): void {
    const translatedFieldId = this.translateFieldId(this.fieldId);
    const translatedFilterVariant = this.translateFilterVariant(selectedFilterVariantId);
    if (!selectedFilterVariantId) {
      this.title = translatedFieldId;
    } else {
      if (filterTerm) {
        this.title = translatedFieldId + ' ' + translatedFilterVariant + ' ' + filterTerm;
      } else {
        this.title = translatedFieldId + ' ' + translatedFilterVariant;
      }
    }
  }

  changeQuery(filterTerm, selectedFilterVariantId): void {
    if (!filterTerm || !selectedFilterVariantId) {
      this._filterQuery = null;
    } else if (TextFilterVariant[selectedFilterVariantId] === TextFilterVariant.EXACT) {
      const newQuery = {};
      newQuery[this.fieldId] = filterTerm;
      this._filterQuery = newQuery;
    } else {
      const newQuery = {};
      newQuery[this.fieldId + '_' + TextFilterVariant[selectedFilterVariantId]] = filterTerm;
      this._filterQuery = newQuery;
    }
    this.triggerQueryChange();
  }

  setSelectedFilterVariantId(filterVariantId: string): void {
    if (!!filterVariantId) {
      let ui = this.ui$.getValue();
      if (!ui) {
        ui = { selectedFilterVariantId: null, filterTerm: null };
      }
      ui.selectedFilterVariantId = filterVariantId;
      this.ui$.next(ui);
    }
  }

  setFilterTerm(filterTerm: string): void {
    let ui = this.ui$.getValue();
    if (!ui) {
      ui = { selectedFilterVariantId: null, filterTerm: null };
    }
    ui.filterTerm = filterTerm;
    this.ui$.next(ui);
  }

  private _getVariantIdFromVariantValue(value: string): string {
    for (const variantId of Object.keys(TextFilterVariant)) {
      const variantVal = TextFilterVariant[variantId];
      if (variantVal === value) {
        return variantId;
      }
    }
  }

  updateUi(): void {
    this._initAvailableFilterVariants();
    this.changeTitle(null, null);
    if (isEmpty(this.filterQuery)) {
      return;
    }
    this.filterTerm = this._getFilterTermFromQuery(this.filterQuery);
    const filterVariant = this._getFilterVariantFromQuery(this.filterQuery);
    this.selectedFilterVariantId = this._getVariantIdFromVariantValue(filterVariant);
    this.changeDetectorRef.markForCheck();
    this.ui$.next({
      selectedFilterVariantId: this.selectedFilterVariantId,
      filterTerm: this.filterTerm,
    });
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
