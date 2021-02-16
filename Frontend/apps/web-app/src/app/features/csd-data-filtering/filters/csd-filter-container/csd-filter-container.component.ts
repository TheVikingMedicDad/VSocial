import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  Input,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { CsdBaseFilterComponent } from '../csd-base-filter.component';
import { CsdFilterHostDirective } from '../../csd-filter-host.directive';
import { CONTAINER_FIELD_ID, LogicalFilterOperator } from '../../csd-data-filtering.constants';
import { CsdContainerSeparatorComponent } from './csd-container-separator/csd-container-separator.component';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { remove } from 'lodash-es';
import { I18NextPipe } from 'angular-i18next';
import {
  getChildQueries,
  getOperatorFromFilterQuery,
  isEmptyFilterQuery,
  isFieldIdContainer,
} from '../../csd-data-filtering.utils';

@Component({
  selector: 'csd-filter-container',
  templateUrl: './csd-filter-container.component.html',
  styleUrls: ['./csd-filter-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdFilterContainerComponent extends CsdBaseFilterComponent implements OnInit {
  @ViewChild(CsdFilterHostDirective) filterHost: CsdFilterHostDirective;
  @Input() isRootContainer = false;
  @Input() nestingLevel = 0;
  @Input() hideControls = false;
  logicalFilterOperator = LogicalFilterOperator;
  currentOperator$ = new BehaviorSubject<LogicalFilterOperator>(LogicalFilterOperator.AND);
  dynamicComponentRefs = [];
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private viewContainerRef: ViewContainerRef,
    protected i18NextPipe: I18NextPipe
  ) {
    super(i18NextPipe);
  }

  ngOnInit() {
    this.addSubscription(
      this.currentOperator$
        .pipe(filter((operator) => !!this.filterQuery))
        .subscribe((operator) => this.collectAndTriggerQueryChange())
    );
  }

  createFilter(
    filterHost,
    fieldId,
    filterComponentCls,
    filterQuery,
    filterOptions,
    separatorComponentCls
  ): void {
    const viewContainerRef = filterHost.viewContainerRef;

    // add a separator which allows to change and/or between filters
    const separatorComponentRef = this.createSeparator(separatorComponentCls, viewContainerRef);
    this.dynamicComponentRefs.push(separatorComponentRef);

    // create filter component
    const filterComponentFactory = this.componentFactoryResolver.resolveComponentFactory(
      filterComponentCls
    );

    const filterComponentRef = viewContainerRef.createComponent(filterComponentFactory);
    this.dynamicComponentRefs.push(filterComponentRef);
    const filterComponentInstance = <CsdBaseFilterComponent>filterComponentRef.instance;
    if (
      filterComponentCls.prototype instanceof CsdFilterContainerComponent ||
      filterComponentCls === CsdFilterContainerComponent
    ) {
      (<CsdFilterContainerComponent>filterComponentInstance).nestingLevel = this.nestingLevel + 1;
    }
    filterComponentInstance.availableFilters = this.availableFilters;
    filterComponentInstance.filterOptions = filterOptions;
    filterComponentInstance.fieldId = fieldId;
    filterComponentInstance.filterQuery = filterQuery;
    filterComponentInstance.filterFieldTranslationPattern = this.filterFieldTranslationPattern;
    filterComponentInstance.queryChanged.subscribe((query) => this.collectAndTriggerQueryChange());

    filterComponentInstance.destroyMe.subscribe(() => {
      // when child filter component is destroyed we need to remove the entry from the query object
      filterComponentRef.destroy();
      separatorComponentRef.destroy();
      remove(
        this.dynamicComponentRefs,
        (componentRef) =>
          componentRef === filterComponentRef || componentRef === separatorComponentRef
      );
      this.removeDanglingSeparator();
      this.collectAndTriggerQueryChange();
    });
    this.removeDanglingSeparator();
  }

  _getFilterComponentRefs(): ComponentRef<any>[] {
    const filterComponentRefs: ComponentRef<any>[] = [];
    for (const componentRef of this.dynamicComponentRefs) {
      let filterComponentRef;
      if (Object.getPrototypeOf(componentRef.instance) instanceof CsdBaseFilterComponent) {
        filterComponentRef = <CsdBaseFilterComponent>componentRef;
        filterComponentRefs.push(filterComponentRef);
      }
    }
    return filterComponentRefs;
  }

  private _getEmptyFilterQuery(
    operator: LogicalFilterOperator = this.currentOperator$.getValue()
  ): any {
    const containerQuery = {};
    containerQuery[operator] = [];
    return containerQuery;
  }

  collectAndTriggerQueryChange(): void {
    const operator = this.currentOperator$.getValue();
    const containerQuery = this._getEmptyFilterQuery(operator);
    const childFilterQueries = containerQuery[operator];
    for (const filterComponentRef of this._getFilterComponentRefs()) {
      const childFilterQuery = filterComponentRef.instance.filterQuery;
      if (!!childFilterQuery && !isEmptyFilterQuery(childFilterQuery)) {
        childFilterQueries.push(childFilterQuery);
      }
    }
    this._filterQuery = containerQuery;
    this.triggerQueryChange();
  }

  removeDanglingSeparator(): void {
    // removes separator which are not between two filter, which is the first component and the last
    const numComponentRefs = this.dynamicComponentRefs.length;
    if (numComponentRefs === 0) {
      return;
    }

    // remove first component ref if separator
    const firstComponentRef = this.dynamicComponentRefs[0];

    if (firstComponentRef.componentType === CsdContainerSeparatorComponent) {
      firstComponentRef.destroy();
      this.dynamicComponentRefs.splice(0, 1);
    }

    // remove last component ref if separator
    const lastIndex = this.dynamicComponentRefs.length - 1;
    const lastComponentRef = this.dynamicComponentRefs[lastIndex];
    if (lastComponentRef.componentType === CsdContainerSeparatorComponent) {
      lastComponentRef.destroy();
      this.dynamicComponentRefs.splice(lastIndex, 1);
    }
  }

  private createSeparator(
    separatorComponentCls,
    viewContainerRef: ViewContainerRef
  ): ComponentRef<any> {
    const separatorComponentFactory = this.componentFactoryResolver.resolveComponentFactory(
      separatorComponentCls
    );

    const separatorComponentRef = viewContainerRef.createComponent(separatorComponentFactory);
    const separatorComponentInstance = <CsdContainerSeparatorComponent>(
      separatorComponentRef.instance
    );
    separatorComponentInstance.operatorChanged.subscribe((operator) => {
      this.currentOperator$.next(operator);
    });
    this.addSubscription(
      this.currentOperator$.subscribe((operator) => {
        separatorComponentInstance.currentOperator = operator;
      })
    );
    return separatorComponentRef;
  }

  addNewFilter(fieldId, childFilterQuery = {}): void {
    const filterEntry = this.availableFilters.find((val) => val.fieldId === fieldId);
    this.createFilter(
      this.filterHost,
      fieldId,
      filterEntry.filter,
      childFilterQuery,
      filterEntry.filterOptions,
      CsdContainerSeparatorComponent
    );
    this.collectAndTriggerQueryChange();
  }

  protected destroyAllChildComponents(): void {
    for (const componentRef of this.dynamicComponentRefs) {
      componentRef.destroy();
    }
    this.dynamicComponentRefs = [];
  }

  updateUi(): void {
    console.log('CsdFilterContainerComponent.updateUi: query:', this.filterQuery);
    if (!this.filterQuery) {
      return;
    }
    this.destroyAllChildComponents();
    const operator = getOperatorFromFilterQuery(this.filterQuery);
    const childQueries = getChildQueries(this.filterQuery);
    for (const childQuery of childQueries) {
      const fieldId = this._getFilterFieldIdFromQuery(childQuery);
      if (isFieldIdContainer(fieldId)) {
        this.addNewFilter(CONTAINER_FIELD_ID, childQuery);
      } else {
        this.addNewFilter(fieldId, childQuery);
      }
    }
    this.currentOperator$.next(operator);
  }

  clean() {
    this.filterQuery = this._getEmptyFilterQuery();
    this.destroyAllChildComponents();
    this.triggerQueryChange();
  }
}
