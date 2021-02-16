import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Optional,
  HostBinding,
  OnDestroy,
  ElementRef,
  Self,
  DoCheck,
  OnChanges,
  SimpleChanges,
  EventEmitter,
  Output,
  ViewChild,
  ChangeDetectorRef,
  ContentChildren,
  QueryList,
  Directive,
  TemplateRef,
  AfterViewInit,
  ContentChild,
  HostListener,
} from '@angular/core';
import {
  CanUpdateErrorStateCtor,
  ErrorStateMatcher,
  MAT_OPTION_PARENT_COMPONENT,
  MatOption,
  MatOptionSelectionChange,
  mixinDisabled,
  mixinErrorState,
  CanDisableCtor,
  HasTabIndexCtor,
  CanDisableRippleCtor,
  mixinDisableRipple,
  mixinTabIndex,
} from '@angular/material/core';
import { MatFormFieldControl } from '@angular/material/form-field';
import {
  ControlValueAccessor,
  FormBuilder,
  FormGroupDirective,
  NgControl,
  NgForm,
} from '@angular/forms';
import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { CsdSelectService } from './csd-select.service';
import { MatSelectSearchComponent } from 'ngx-mat-select-search';
import { ARROW_DOWN, ARROW_UP, BACKSPACE, ENTER } from '../../../core/constants/general.constants';
import { Subscription } from 'rxjs';
import { UnsubscribeBaseComponent } from '../../unsubscribe-base.component';

//TODO: as long as MatSelectBase is not exported by Angular Material we need to redefine it here
class MatSelectBase {
  constructor(
    public _elementRef: ElementRef,
    public _defaultErrorStateMatcher: ErrorStateMatcher,
    public _parentForm: NgForm,
    public _parentFormGroup: FormGroupDirective,
    public ngControl: NgControl
  ) {}
}

export const _CsdSelectMixinBase: CanUpdateErrorStateCtor & typeof MatSelectBase = mixinDisabled(
  mixinErrorState(MatSelectBase)
);

@Directive({ selector: '[csdItemContent]' })
export class CsdItemContentDirective {}

@Directive({ selector: 'csd-top' })
export class CsdTopDirective {}

@Directive({ selector: 'csd-bottom' })
export class CsdBottomDirective {}

@Component({
  selector: 'csd-item',
  templateUrl: './csd-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdSelectItemComponent extends UnsubscribeBaseComponent implements OnInit {
  @Input() value: any;
  multiple = false;
  @ViewChild('option') option: MatOption;
  _active = false;
  set active(isActive: boolean) {
    this._active = isActive;
    this.changeDetectorRef.markForCheck();
  }

  get active(): boolean {
    return this._active;
  }

  constructor(
    private csdSelectService: CsdSelectService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.multiple = this.csdSelectService.getMultiple();
    this.addSubscription(
      this.csdSelectService.getSelectedData$().subscribe((selectedArray) => {
        this.csdSelectService.isObjectInObjectArray(this.value, selectedArray)
          ? this.option.select()
          : this.option.deselect();
      })
    );
  }

  getClassIfActive(): string {
    return this.active ? 'csd-active-item' : '';
  }

  selectionChange(selectionChange: MatOptionSelectionChange) {
    if (this.csdSelectService.getFirstClicked()) {
      this.csdSelectService.changeSelection(this.option.selected, this.value);
    }
  }

  deselectOthersOnClick(): void {
    if (!this.multiple) {
      this.csdSelectService.deselectOptionsWithoutGivenValue(this.value);
      this.csdSelectService.setShouldCloseDropdown(true);
    }
  }

  deselect(): void {
    if (this.option.selected) {
      this.option.deselect();
    }
  }

  select(): void {
    if (!this.option.selected) {
      this.option.select();
      this.deselectOthersOnClick();
    }
  }

  get selected(): boolean {
    return this.option.selected;
  }
}

@Component({
  selector: 'csd-select',
  templateUrl: './csd-select.component.html',
  styleUrls: ['./csd-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: MatFormFieldControl, useExisting: CsdSelectComponent },
    { provide: MAT_OPTION_PARENT_COMPONENT, useExisting: CsdSelectComponent },
    { provide: CsdSelectService, useClass: CsdSelectService },
  ],
})
export class CsdSelectComponent
  extends _CsdSelectMixinBase
  implements
    ControlValueAccessor,
    OnInit,
    MatFormFieldControl<any>,
    OnDestroy,
    DoCheck,
    OnChanges,
    AfterViewInit {
  static nextId = 0; //used to return the ID of an element in component template
  @HostBinding() id = 'csd-select-${CsdSelectComponent.nextId++}';
  @HostBinding('attr.aria-describedby') describedBy = '';
  private set firstClicked(firstClicked: boolean) {
    this.csdSelectService.setFirstClicked(firstClicked);
  }

  private get firstClicked(): boolean {
    return this.csdSelectService.getFirstClicked();
  }
  filteredData: Array<any>;
  @ViewChild('matSelect') matSelect;
  @ViewChild('matSearch') matSearch: MatSelectSearchComponent;
  @ViewChild('csdTop') csdTopDiv;
  @ViewChild('csdChipList') csdChipList;
  @ViewChild('csdNumberChip') csdNumberChip;

  private _csdTopDivHeightInOptionHeight: number;
  focused = false;
  private dropdownOpen = false;
  private deselectedChip = false; //states if a chip was recently deselected
  valuesToShow: Array<any>;
  controlType = 'csd-select';
  @Input() searchLabel = 'Search...';
  @Input() noEntriesFoundLabel = 'No entries found';
  searchInput = '';
  filteredSelectedData: Array<any>;
  filteredUnselectedData: Array<any>;
  notUpdatedSelectedData: Array<any>;
  notUpdatedUnselectedData: Array<any>;
  @ContentChildren(CsdSelectItemComponent) csdItems: QueryList<CsdSelectItemComponent>;
  @ContentChild(CsdItemContentDirective, { read: TemplateRef })
  csdItemContentTemplate;
  @ContentChild(CsdTopDirective) csdTop: CsdTopDirective;
  @ContentChild(CsdBottomDirective) csdBottom: CsdBottomDirective;
  _currentSelectedItem = null;
  private _selectedDataSubscription: Subscription;
  private _subscriptionList: Subscription[] = [];
  @Output() enterKeyPressed: EventEmitter<string> = new EventEmitter();
  @Output() noEntriesEnterKeyPressed: EventEmitter<string> = new EventEmitter();
  private _isEnterKeyPressedUsed = false;
  private _isNoEntriesEnterKeyPressedUsed = false;

  _errorState = false;
  set errorState(error: boolean) {
    this._errorState = error;
    if (!!this.matSelect) {
      this.matSelect.errorState = error;
    }
  }
  get errorState(): boolean {
    return this._errorState;
  }

  _chipKey: string = null;

  @Input()
  set chipKey(key: string) {
    this._chipKey = this.getKeyIfValid(key);
    this.stateChanges.next();
  }
  get chipKey(): string {
    if (this._chipKey) {
      return this._chipKey;
    }

    if (this.inputData && this.inputData.length > 0) {
      return Object.keys(this.inputData[0])[0];
    }

    return '';
  }

  _searchKeys: string[];

  @Input()
  set searchKeys(keys: string[]) {
    this._searchKeys = keys && keys.length > 0 ? keys : null;
  }
  get searchKeys(): string[] {
    if (this._searchKeys) {
      return this._searchKeys;
    }

    if (this.inputData && this.inputData.length > 0) {
      return Object.keys(this.inputData[0]);
    }

    return [];
  }

  set selectedData(newData: Array<any>) {
    this.csdSelectService.setSelectedData(newData);
    this.stateChanges.next();
  }

  get selectedData(): Array<any> {
    return this.csdSelectService.getSelectedData();
  }

  set unselectedData(newData: Array<any>) {
    this.csdSelectService.setUnselectedData(newData);
    this.stateChanges.next();
  }

  get unselectedData(): Array<any> {
    return this.csdSelectService.getUnselectedData();
  }

  /***
   * if true, search functionality is enabled
   */
  private _search = false;

  @Input()
  get search(): boolean {
    return this._search;
  }

  set search(shouldSearch: boolean) {
    this._search = coerceBooleanProperty(shouldSearch);
    this.stateChanges.next();
  }

  _chipRemovable = false;
  @Input()
  get chipRemovable(): boolean {
    return this._chipRemovable;
  }

  set chipRemovable(chipRemovable: boolean) {
    this._chipRemovable = coerceBooleanProperty(chipRemovable);
    this.stateChanges.next();
  }
  /***
   * if true multi selection is enabled
   */

  @Input()
  get multiple(): boolean {
    return this.csdSelectService.getMultiple();
  }

  set multiple(isMultiple: boolean) {
    this.csdSelectService.setMultiple(coerceBooleanProperty(isMultiple));
    this.stateChanges.next();
  }

  /***
   * this is the value of the selected data
   */
  private _value: Array<any> = [];

  @Input()
  get value(): Array<any> {
    return this._value;
  }

  set value(value: Array<any>) {
    this._value = value;
    if (this.matSearch) {
      this.matSearch._reset(true);
    }
    this.stateChanges.next();
    if (this.firstClicked) {
      this.onChange(value);
      this.onTouch(value);
    }
  }

  @Output() readonly valueChange: EventEmitter<any> = new EventEmitter<any>();

  /***
   *  contains the data that csdSelect is working with
   */
  @Input()
  get inputData(): Array<any> {
    return this.csdSelectService.getFullData();
  }

  set inputData(data: Array<any>) {
    this.csdSelectService.setFullData(data ? data : []);
    this._inputDataChanged();
  }

  /***
   * if not empty, a placeholder is shown
   */
  private _placeholder: string;

  @Input()
  get placeholder(): string {
    return this._placeholder;
  }

  set placeholder(placeholder: string) {
    this._placeholder = placeholder;
    this.stateChanges.next();
  }

  /***
   * if true, the value of csd-select must not be null
   */
  private _required = false;

  @Input()
  get required(): boolean {
    return this._required;
  }

  set required(isRequired: boolean) {
    this._required = coerceBooleanProperty(isRequired);
    this.stateChanges.next();
  }

  /***
   * if true, the component is disabled
   */
  _disabled = false;

  set disabled(disable: boolean) {
    this.changeDetectorRef.markForCheck();
    this.focused = false;
    this._disabled = disable;
  }

  get disabled(): boolean {
    return this._disabled;
  }

  @HostListener('keydown') _handleKeydown(event: KeyboardEvent): void {
    if (this.disabled || !this.dropdownOpen || event.key === BACKSPACE) {
      return;
    }
    const keyCode = event.key;
    // length of the array of all the data in the dropdown
    const allItemsLength = this.multiple
      ? this.csdSelectService.getFullData().length
      : this.filteredUnselectedData.length;
    const csdItemArray = this.csdItems.toArray();
    // array of all the data in the dropdown, selected data is first then comes unselected data (if single select: only unselected data)
    const selectedAndUnselectedData = this.multiple
      ? this.filteredSelectedData.concat(this.filteredUnselectedData)
      : this.filteredUnselectedData;
    let selectedItemIndex = selectedAndUnselectedData.indexOf(this._currentSelectedItem);

    if (
      !selectedAndUnselectedData ||
      selectedAndUnselectedData.length === 0 ||
      csdItemArray.length === 0
    ) {
      if (
        this._isNoEntriesEnterKeyPressedUsed &&
        this.inputData.length === 0 &&
        keyCode === ENTER
      ) {
        this.noEntriesEnterKeyPressed.emit(this.searchInput);
      }
      return;
    }
    if (keyCode === ARROW_UP || keyCode === ARROW_DOWN) {
      // the selected index is decreased/increased by one depending on the arrowKey. If it is -1, it should be the index of the last item.
      // If it is the index of the last item + 1, it should be the index of the first item.
      selectedItemIndex =
        selectedItemIndex >= 0
          ? (allItemsLength + selectedItemIndex + (keyCode === ARROW_UP ? -1 : 1)) % allItemsLength
          : keyCode === ARROW_UP
          ? selectedAndUnselectedData.length - 1
          : 0;
      this._currentSelectedItem = selectedAndUnselectedData[selectedItemIndex];
      this.scrollPanelToPosition(selectedItemIndex);
      this.setSelectedToActive();
    }

    if (keyCode === ENTER) {
      if (this._isEnterKeyPressedUsed) {
        this.enterKeyPressed.emit(this.searchInput);
      } else {
        this.filterDropdown('');
        // the default behavior is to select the active item and mark all items as inactive
        csdItemArray.forEach((item) => {
          if (item.value === this._currentSelectedItem) {
            item.option.selected ? item.deselect() : item.select();
          }
        });
      }
    }
  }

  /**
   * returns true if nothing is selected
   */
  get empty(): boolean {
    return this.selectedData.length === 0;
  }

  /***
   * mat-form uses this to define if mat-label should float
   */
  @HostBinding('class.floating')
  get shouldLabelFloat(): boolean {
    return (this.deselectedChip && !this.empty) || (!this.dropdownOpen && !this.empty);
  }

  constructor(
    formBuilder: FormBuilder,
    private focusMonitor: FocusMonitor,
    @Optional() @Self() public ngControl: NgControl,
    private elRef: ElementRef<HTMLElement>,
    _elementRef: ElementRef,
    _defaultErrorStateMatcher: ErrorStateMatcher,
    @Optional() _parentForm: NgForm,
    _parentFormGroup: FormGroupDirective,
    private changeDetectorRef: ChangeDetectorRef,
    private csdSelectService: CsdSelectService
  ) {
    super(_elementRef, _defaultErrorStateMatcher, _parentForm, _parentFormGroup, ngControl);
    focusMonitor.monitor(elRef.nativeElement, true).subscribe((origin) => {
      this.focused = !!origin || this.errorState;
      this.stateChanges.next();
    });
    if (this.ngControl != null) {
      // Setting the value accessor directly (instead of using
      // the providers) to avoid running into a circular import.
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit() {
    this._inputDataChanged();
    this._subscriptionList.push(
      this.csdSelectService.getShouldCloseDropdown$().subscribe((shouldClose) => {
        if (shouldClose) {
          this.matSelect.close();
          this.csdSelectService.setShouldCloseDropdown(false);
        }
      })
    );
    this._subscriptionList.push(
      this.matSelect.openedChange.subscribe((dropdown) => {
        this.handleDataAccordingToDropdownState(dropdown);
      })
    );
  }

  private _inputDataChanged() {
    if (this._selectedDataSubscription) {
      this._selectedDataSubscription.unsubscribe();
    }
    this._isEnterKeyPressedUsed = this.enterKeyPressed.observers.length > 0;
    this._isNoEntriesEnterKeyPressedUsed = this.noEntriesEnterKeyPressed.observers.length > 0;

    // mat-select lets appear his dropdown panel always on the same height, if overlayOffsetY === 0
    this.matSelect._calculateOverlayOffsetY = function () {
      return -CHIP_CONFIG_DATA.DISTANCE_TO_TOP;
    };

    this.unselectedData = this.inputData.filter(
      (item) => !this.csdSelectService.isObjectInObjectArray(item, this.value)
    );
    this.selectedData = this.value;
    this.notUpdatedUnselectedData = this.unselectedData;
    this.notUpdatedSelectedData = this.selectedData;
    this.updateDropdownData();

    // shows data in dropdown list, if csd-select is single-select
    this.filteredData = this.inputData;
    this._selectedDataSubscription = this.csdSelectService.getSelectedData$().subscribe((data) => {
      this.value = data ? data : [];
      this.valueChange.emit(this.value);
      this.valuesToShow = this.calculateShowArray(this.value);
    });
  }

  ngAfterViewInit(): void {
    this.csdSelectService.setAllItems(this.csdItems);
  }

  // in case of an validation error, mat-form needs to be informed
  ngDoCheck(): void {
    if (this.ngControl) {
      this.updateErrorState();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // Updating the disabled state is handled by `mixinDisabled`, but we need to additionally let
    // the parent form field know to run change detection when the disabled state changes.
    if (changes['disabled']) {
      this.stateChanges.next();
    }
  }

  ngOnDestroy() {
    this.stateChanges.complete();
    this.focusMonitor.stopMonitoring(this.elRef.nativeElement);
    this._subscriptionList.forEach((subscription) => subscription.unsubscribe());
    this._selectedDataSubscription.unsubscribe();
  }

  /**
   * Is used by mat-form-field to specify the IDs that should be used by the aria-describedby attribute
   *
   * @param ids
   */
  setDescribedByIds(ids: string[]) {
    this.describedBy = ids.join(' ');
  }

  /***
   * Component should only do something if it is not disabled and states should only
   * be changed after the component is first clicked. The dropdown should also open if a part
   * of the component is clicked that is not part of mat-select
   *
   * @param event
   */
  onContainerClick(event: any): void {
    if (!this.disabled) {
      this.firstClicked = true;
      try {
        if (event && event.srcElement.className.toLowerCase().includes('mat-form-field-infix')) {
          this.matSelect.toggle();
        }
      } catch (e) {
        console.log('An error occurred');
      }
      this.onTouch();
    }
  }

  /**
   * Disables the select. Part of the ControlValueAccessor interface required
   * to integrate with Angular's core forms API.
   *
   * @param isDisabled Sets whether the component is disabled.
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.stateChanges.next();
  }

  /***
   * The callback function to register on UI change. Part of the ControlValueAccessor interface
   * required to integrate with Angular's core forms API.
   */
  onChange: any = () => {};
  /***
   * The callback function to register on element touch. Part of the ControlValueAccessor interface
   * required to integrate with Angular's core forms API.
   */
  onTouch: any = () => {};

  /***
   * This will will write the value to the view if the the value changes occur on the model
   * programmatically. Part of the ControlValueAccessor interface required to integrate with
   * Angular's core forms API.
   *
   * @param value New value
   */
  writeValue(value: any) {
    this.value = value;
  }

  /***
   * When the value in the UI is changed, this method will invoke a callback function.Part of the
   * ControlValueAccessor interface required to integrate with Angular's core forms API.
   *
   * @param fn Function that is called when a change is registered
   */
  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  /***
   * When the element is touched, this method will get called. Part of the ControlValueAccessor interface
   * required to integrate with Angular's core forms API.
   *
   * @param fn Function that is called when component is touched
   */
  registerOnTouched(fn: any) {
    this.onTouch = fn;
  }

  /***
   * filters the dropdown elements to keep only those that contain the input string of the search
   * element.
   *
   * @param input Search string
   */
  filterDropdown(input: any) {
    this.searchInput = input;
    this.filteredData = this.csdSelectService.filterData(input, this.searchKeys);

    this.filteredSelectedData = this.filteredData.filter(
      (data) => this.notUpdatedUnselectedData.indexOf(data) < 0
    );

    this.filteredUnselectedData = this.filteredData.filter(
      (data) => this.notUpdatedUnselectedData.indexOf(data) >= 0
    );

    const dropdownArray = [].concat(this.filteredSelectedData, this.filteredUnselectedData);
    if (dropdownArray.indexOf(this._currentSelectedItem) >= 0) {
      this.scrollPanelToPosition(dropdownArray.indexOf(this._currentSelectedItem));
      this.setSelectedToActive();
    }
  }

  /***
   * deselects the chip that was clicked
   *
   * @param arrayValue Value of the chip that needs to be unselected
   */
  deselect(arrayValue: any) {
    if (!this.disabled) {
      if (!this.firstClicked) {
        this.onContainerClick(null);
      }
      this.deselectedChip = true;
      this.selectedData = this.selectedData.filter((data) => data !== arrayValue);
      this.updateDropdownData();
    }
  }

  /***
   * calculates the list of chips that can be shown in one line of the input element.
   *
   * @param array Array that contains the maximum of elements that can be shown
   */
  calculateShowArray(array: Array<any>): Array<any> {
    if (!array || array.length === 0) {
      return [];
    }
    this.changeDetectorRef.detectChanges();
    let showArray = [];
    const csdNumberChipWidth = this.csdNumberChip
      ? this.csdNumberChip.nativeElement.clientWidth
      : 0;
    let pixelLeft = this.csdChipList
      ? this.csdChipList._elementRef.nativeElement.clientWidth -
        csdNumberChipWidth -
        CHIP_CONFIG_DATA.THREE_DOTS_WIDTH
      : 0;
    let currentIndex = 0;
    while ((pixelLeft > 0 || currentIndex === 0) && currentIndex < array.length) {
      pixelLeft -=
        array[currentIndex][this.chipKey].toString().length * CHIP_CONFIG_DATA.MEAN_SYMBOL_WIDTH +
        CHIP_CONFIG_DATA.EMPTY_CHIP_WIDTH;
      if (pixelLeft > 0 || currentIndex === 0) {
        showArray.push(array[currentIndex]);
      }
      currentIndex++;
    }
    showArray = Array.from(new Set(showArray));

    return showArray.length > 0 ? showArray : null;
  }

  /***
   * Handles different component states and data according to the state of the dropdown list.
   *
   * @param dropdown Represents the dropdown
   */
  handleDataAccordingToDropdownState(dropdown: any) {
    // is one of the factors that lets the label float
    // label should not float of dropdown is open
    this.dropdownOpen = dropdown;
    if (dropdown) {
      this.deselectedChip = false;
      this._currentSelectedItem = null;
      this.csdItems.forEach((item) => (item.active = false));
    } else {
      this.notUpdatedSelectedData = this.selectedData;
      this.notUpdatedUnselectedData = this.unselectedData;
    }
    this.updateDropdownData();
    this.matSelect.errorState = this.errorState;
  }

  updateDropdownData() {
    this.filteredSelectedData = this.inputData.filter((item) =>
      this.csdSelectService.isObjectInObjectArray(item, this.selectedData)
    );
    this.filteredUnselectedData = this.inputData.filter(
      (item) => !this.csdSelectService.isObjectInObjectArray(item, this.selectedData)
    );
  }

  scrollPanelToPosition(index: number): void {
    if (!!this.dropdownOpen) {
      this.changeDetectorRef.detectChanges();
      this._csdTopDivHeightInOptionHeight = !this.csdTop
        ? 0
        : Math.ceil(this.csdTopDiv.nativeElement.clientHeight / CHIP_CONFIG_DATA.OPTION_HEIGHT);

      this.matSelect.panel.nativeElement.scrollTop =
        CHIP_CONFIG_DATA.OPTION_HEIGHT *
        (index + this._csdTopDivHeightInOptionHeight < 3
          ? 0
          : index + this._csdTopDivHeightInOptionHeight - 2);
      this.changeDetectorRef.markForCheck();
    }
  }

  setSelectedToActive() {
    // csdItem that belongs to the currentSelectedItem is marked active. If a csdItem is active
    // it gets an additional css-class.
    this.changeDetectorRef.detectChanges();
    this.csdItems
      .toArray()
      .forEach((item) => (item.active = item.value === this._currentSelectedItem));
    this.changeDetectorRef.markForCheck();
  }

  getKeyIfValid(keyToCheck: string): string {
    return keyToCheck && keyToCheck !== '' ? keyToCheck : null;
  }
}
export const CHIP_CONFIG_DATA = {
  DISTANCE_TO_TOP: 22,
  OPTION_HEIGHT: 42,
  EMPTY_CHIP_WIDTH: 26,
  MEAN_SYMBOL_WIDTH: 10,
  THREE_DOTS_WIDTH: 15,
};
