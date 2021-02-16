import { Injectable, QueryList } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CsdSelectItemComponent } from './csd-select.component';

@Injectable()
export class CsdSelectService {
  private _fullData$: BehaviorSubject<any[]> = new BehaviorSubject([]);
  private _filteredFullData$: BehaviorSubject<any[]> = new BehaviorSubject([]);
  private _selectedData$: BehaviorSubject<any[]> = new BehaviorSubject([]);
  private _unselectedData$: BehaviorSubject<any[]> = new BehaviorSubject([]);
  private _allItems: QueryList<CsdSelectItemComponent>;
  private _shouldCloseDropdown$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private _firstClicked$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private _multiple: boolean;

  filterData(filterInput: string, keysToFilter: string[]): Array<any> {
    if (filterInput) {
      let filteredData = this._fullData$.getValue() ? this._fullData$.getValue() : [];
      filteredData = filteredData.filter((item) =>
        keysToFilter.reduce(
          (previousValue, currentValue) =>
            previousValue ||
            item[currentValue].toString().toLowerCase().includes(filterInput.toLowerCase()),
          false
        )
      );
      this._filteredFullData$.next(filteredData);
      return filteredData;
    } else {
      this._filteredFullData$.next(this._fullData$.getValue());
      return this._fullData$.getValue();
    }
  }

  changeSelection(selected: boolean, value: any): void {
    selected ? this.addToSelected(value) : this.addToUnselected(value);
  }

  deselectOptionsWithoutGivenValue(value: any): void {
    this._allItems.forEach((item) => {
      if (item.value !== value) {
        item.deselect();
      }
    });
  }

  addToSelected(value: any): void {
    if (!this._multiple) {
      if (
        this._allItems &&
        !this.isObjectInObjectArray(
          value,
          this._allItems.map((item) => item.value)
        )
      ) {
        this.addToUnselected(value);
        return;
      }
    }
    this.findDataInBehaviorSubjectAndAddToOther(
      this._unselectedData$,
      this._selectedData$,
      value,
      this._fullData$
    );
  }

  addToUnselected(value: any): void {
    this.findDataInBehaviorSubjectAndAddToOther(
      this._selectedData$,
      this._unselectedData$,
      value,
      this._fullData$
    );
  }

  findDataInBehaviorSubjectAndAddToOther(
    fromSubject: BehaviorSubject<any[]>,
    toSubject: BehaviorSubject<any[]>,
    value: any,
    parentSubject: BehaviorSubject<any[]> = null
  ): void {
    let fromArray = fromSubject.getValue();
    let toArray = toSubject.getValue();
    fromArray = fromArray.filter((item) => !this.isObjectInObjectArray(value, [item]));

    toArray.push(value);

    if (parentSubject) {
      toArray = this.getOrderedSubArrayLikeArray(toArray, parentSubject.getValue());
    }
    fromSubject.next(fromArray);
    toSubject.next(toArray);
  }

  isObjectInObjectArray(value: any, array: any[]): boolean {
    // if the value or the content of the array is no object, an error is thrown
    if (
      typeof value !== 'object' ||
      (array && array.length > 0 ? typeof array[0] !== 'object' : false)
    ) {
      throw Error(
        'parameters of CsdSelectService.isObjectInObjectArray need to be an object/ array of Objects!'
      );
    }
    let isInArray = false;
    if (array && array.length > 0) {
      array.forEach((item) => {
        if (Object.keys(item).length !== Object.keys(value).length) {
          return;
        }
        // this checks if the content of two dictionaries is the same
        // 1.) compare each array[index][key] with value[key] and put in Array<boolean>
        // 2.) reduce Array<boolean> to boolean
        //
        // if one of the key contents is different => array[index] !=== value
        // this is necessary, because even thou the objects are identical, they are not necessary the same object
        const itemIsEqual = Object.keys(value).reduce(
          (previousValue, currentValue) =>
            previousValue && value[currentValue] === item[currentValue],
          true
        );

        if (itemIsEqual) {
          isInArray = true;
        }
      });
    }
    return isInArray;
  }

  getOrderedSubArrayLikeArray(subArray: Array<any>, parentArray: Array<any>): Array<any> {
    // orders sub array the way the parent Array is ordered
    return parentArray.filter((data) => this.isObjectInObjectArray(data, subArray));
  }

  getFullData$(): Observable<any[]> {
    return this._filteredFullData$.asObservable();
  }

  getFullData(): Array<any> {
    return this._filteredFullData$.getValue() ? this._filteredFullData$.getValue() : [];
  }

  setFullData(fullData: Array<any>) {
    this._fullData$.next(fullData);
    this._filteredFullData$.next(fullData);
  }

  getSelectedData$(): Observable<any[]> {
    return this._selectedData$.asObservable();
  }

  getSelectedData(): Array<any> {
    return this._selectedData$.getValue() ? this._selectedData$.getValue() : [];
  }

  setSelectedData(selectedData: Array<any>) {
    this._selectedData$.next(selectedData);
  }

  getUnselectedData$(): Observable<any[]> {
    return this._unselectedData$.asObservable();
  }

  getUnselectedData(): Array<any> {
    return this._unselectedData$.getValue() ? this._unselectedData$.getValue() : [];
  }

  setUnselectedData(unselectedData: Array<any>) {
    this._unselectedData$.next(unselectedData);
  }

  setAllItems(items: QueryList<CsdSelectItemComponent>): void {
    this._allItems = items;
  }

  getAllItems(): QueryList<CsdSelectItemComponent> {
    return this._allItems;
  }

  getShouldCloseDropdown$(): Observable<boolean> {
    return this._shouldCloseDropdown$.asObservable();
  }

  setShouldCloseDropdown(shouldClose: boolean): void {
    this._shouldCloseDropdown$.next(shouldClose);
  }

  getFirstClicked(): boolean {
    return this._firstClicked$.getValue();
  }

  setFirstClicked(firstClicked: boolean): void {
    this._firstClicked$.next(firstClicked);
  }

  getMultiple(): boolean {
    return this._multiple;
  }

  setMultiple(multiple: boolean): void {
    this._multiple = multiple;
  }
}
