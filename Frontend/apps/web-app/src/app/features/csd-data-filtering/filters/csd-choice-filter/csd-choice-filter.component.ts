import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { CsdBaseFilterComponent } from '../csd-base-filter.component';
import { I18NextPipe } from 'angular-i18next';
import { cloneDeep } from 'lodash-es';

export interface CsdChoiceFilterChoice {
  choiceTranslationKey: string;
  value: any;
}

export interface CsdChoiceFilterOptions {
  choices: CsdChoiceFilterChoice[];
}

@Component({
  selector: 'csd-choice-filter',
  templateUrl: './csd-choice-filter.component.html',
  styleUrls: ['./csd-choice-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdChoiceFilterComponent
  extends CsdBaseFilterComponent<CsdChoiceFilterOptions>
  implements OnInit {
  @Input() operatorTranslationKey = 'FILTER_CONFIGURATOR.FILTERS.CHOICE_FILTER.IS';
  public selectedChoice: any;
  constructor(protected i18NextPipe: I18NextPipe) {
    super(i18NextPipe);
  }

  ngOnInit(): void {
    this.updateUi();
  }

  changeQuery(choice): void {
    this.selectedChoice = choice;
    const tempDict = [];
    tempDict[this.fieldId] = choice.value;
    // needed when user changes the selected input (read-only problem)
    const deepClone = cloneDeep(this.filterQuery);
    Object.assign(deepClone, tempDict);
    this.filterQuery = deepClone;
    this.triggerQueryChange();
  }

  getTitle(): string {
    const translatedFieldId = this.translateFieldId(this.fieldId);
    if (!this.selectedChoice) {
      return translatedFieldId;
    }
    const translatedOperator = this.i18NextPipe.transform(this.operatorTranslationKey);
    const translatedChoice = this.i18NextPipe.transform(this.selectedChoice.choiceTranslationKey);
    return translatedFieldId + ' ' + translatedOperator + ' ' + translatedChoice;
  }

  updateUi(): void {
    this.selectedChoice = this.filterOptions.choices.find(
      (option) => option.value === this._getFilterTermFromQuery(this.filterQuery)
    );
  }
}
