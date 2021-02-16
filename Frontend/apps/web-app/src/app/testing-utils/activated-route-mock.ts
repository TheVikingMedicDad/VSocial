import { convertToParamMap, Data, ParamMap } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

export class ActivatedRouteMock {
  private dataSubject = new BehaviorSubject<Data>({});
  private paramMapSubject = new BehaviorSubject<ParamMap>(convertToParamMap({}));

  constructor({
    initialData = {},
    initialParamMap = convertToParamMap({}),
  }: {
    initialData?: Data;
    initialParamMap?: ParamMap;
  }) {
    this.setData(initialData);
    this.setParamMap(initialParamMap);
  }

  get data(): Observable<Data> {
    return this.dataSubject.asObservable();
  }

  get paramMap(): Observable<ParamMap> {
    return this.paramMapSubject.asObservable();
  }

  setData(data: Data) {
    this.dataSubject.next(data);
  }

  setParamMap(paramMap: ParamMap) {
    this.paramMapSubject.next(paramMap);
  }
}
