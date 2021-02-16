import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CsdCurrentPageService {
  private currentPageKey: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  getCurrentPageKey$() {
    return this.currentPageKey.asObservable();
  }

  setCurrentPageKey$(key: string) {
    this.currentPageKey.next(key);
  }
}
