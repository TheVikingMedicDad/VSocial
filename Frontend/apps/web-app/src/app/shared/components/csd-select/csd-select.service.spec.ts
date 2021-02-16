import { inject, TestBed } from '@angular/core/testing';

import { CsdSelectService } from './csd-select.service';
import { CsdSelectItemComponent } from './csd-select.component';
import { QueryList } from '@angular/core';
import { filter, tap } from 'rxjs/operators';
import { BehaviorSubject, combineLatest } from 'rxjs';

describe('CsdSelectService', () => {
  let service: CsdSelectService;
  const fullDataArray = [
    { a: 1, b: 2 },
    { a: 1, b: 3 },
    { a: 1, b: 4 },
    { a: 1, b: 5 },
    { a: 2, b: 1 },
    { a: 2, b: 3 },
    { a: 2, b: 4 },
  ];
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CsdSelectService],
    });
  });
  beforeEach(inject([CsdSelectService], (_service) => {
    service = _service;
  }));
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should have functioning setters and getters', function () {
    let fullData;
    let selectedData;
    let unselectedData;
    let allItems;
    let firstClicked;
    let multiple;

    service.setFullData([1, 2]);
    service.setSelectedData([1]);
    service.setUnselectedData([2]);
    service.setAllItems(new QueryList<CsdSelectItemComponent>());
    service.setFirstClicked(true);
    service.setMultiple(true);

    fullData = service.getFullData();
    selectedData = service.getSelectedData();
    unselectedData = service.getUnselectedData();
    allItems = service.getAllItems();
    firstClicked = service.getFirstClicked();
    multiple = service.getMultiple();

    expect(fullData).toEqual([1, 2]);
    expect(selectedData).toEqual([1]);
    expect(unselectedData).toEqual([2]);
    expect(allItems).toEqual(new QueryList<CsdSelectItemComponent>());
    expect(firstClicked).toEqual(true);
    expect(multiple).toEqual(true);
  });

  it('should have array getter that return an empty array if array is empty', function () {
    service.setFullData(null);
    service.setSelectedData(null);
    service.setUnselectedData(null);
    expect(service.getFullData()).toEqual([]);
    expect(service.getSelectedData()).toEqual([]);
    expect(service.getUnselectedData()).toEqual([]);
  });

  it('should have functioning observables', (done) => {
    const fullDataObs$ = service.getFullData$().pipe(
      filter((array) => array.length > 0),
      tap((array) => {
        expect(array).toEqual([1, 2]);
      })
    );
    const selectedDataObs$ = service.getSelectedData$().pipe(
      filter((array) => array.length > 0),
      tap((array) => {
        expect(array).toEqual([1, 2]);
      })
    );
    const unselectedDataObs$ = service.getUnselectedData$().pipe(
      filter((array) => array.length > 0),
      tap((array) => {
        expect(array).toEqual([1, 2]);
      })
    );
    const shouldCloseDropDownObs$ = service.getShouldCloseDropdown$().pipe(
      filter((close) => close),
      tap((close) => expect(close).toEqual(true))
    );

    combineLatest(
      fullDataObs$,
      selectedDataObs$,
      unselectedDataObs$,
      shouldCloseDropDownObs$
    ).subscribe(() => done());

    service.setFullData([1, 2]);
    service.setSelectedData([1, 2]);
    service.setUnselectedData([1, 2]);
    service.setShouldCloseDropdown(true);
  });

  it('should be able to filter fullData and return filtered data', function () {
    let filterKeys = ['a', 'b'];
    service.setFullData(fullDataArray);
    let filteredData = service.filterData('1', filterKeys);
    expect(filteredData.length).toBe(service.getFullData().length);
    expect(filteredData.length).toBe(5);

    filterKeys = ['b'];
    filteredData = service.filterData('1', filterKeys);
    expect(filteredData.length).toBe(1);

    filteredData = service.filterData(null, filterKeys);
    expect(filteredData).toEqual(fullDataArray);

    service.setFullData(null);
    filteredData = service.filterData('1', filterKeys);
    expect(filteredData.length).toBe(0);
  });

  it('should change the selection state of values', function () {
    service.setFullData(fullDataArray);
    service.setUnselectedData(fullDataArray);
    service.changeSelection(true, fullDataArray[1]);
    expect(service.getSelectedData().length).toBe(1);
    expect(service.getUnselectedData().length).toBe(6);

    service.changeSelection(false, fullDataArray[1]);
    expect(service.getSelectedData().length).toBe(0);
    expect(service.getUnselectedData().length).toBe(7);
  });

  it('should find data in one BehaviorSubject, remove it and add it to other', function () {
    const object = { a: 1, b: 2 };
    const _selectedData$: BehaviorSubject<any[]> = new BehaviorSubject([object]);
    const _unselectedData$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    service.findDataInBehaviorSubjectAndAddToOther(_selectedData$, _unselectedData$, object);
    expect(_selectedData$.getValue()).toEqual([]);
    expect(_unselectedData$.getValue()).toEqual([object]);
  });

  it('should return if object is in object array', function () {
    expect(() => service.isObjectInObjectArray(1, fullDataArray)).toThrow(Error);
    expect(service.isObjectInObjectArray(fullDataArray[1], [])).toBe(false);
    expect(service.isObjectInObjectArray(fullDataArray[1], fullDataArray)).toBe(true);
  });
});
