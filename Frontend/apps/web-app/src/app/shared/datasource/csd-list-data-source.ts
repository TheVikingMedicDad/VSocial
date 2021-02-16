import { CsdBaseDataSource, Page, PageDirection, PageRequest } from './csd-base-data-source';
import { Observable, of } from 'rxjs';

export class CsdListDataSource<T> extends CsdBaseDataSource<T> {
  private _data: T[];

  constructor(data: TDataList<T>) {
    super({
      onPageRequest: (req, current) => this.onPageRequest(req, current),
    });
    this._data = data;
  }

  public setData(dataList: T[]) {
    this._data = dataList;
    this.triggerUpdate();
  }

  protected onPageRequest(pageRequest: PageRequest<T>, currentPage: Page<T>): Observable<Page<T>> {
    const pageSize = !!pageRequest.pageSize ? pageRequest.pageSize : this._data.length;

    // calculate startIndex:
    let startIndex: number;
    if (currentPage) {
      startIndex = 0;
      switch (pageRequest.pageDirection) {
        case PageDirection.Initial:
          startIndex = 0;
          break;
        case PageDirection.Next:
          startIndex = currentPage.cursorInfo.startCursor + pageSize;
          break;
        case PageDirection.Previous:
          startIndex = currentPage.cursorInfo.startCursor - pageSize;
          break;
        default:
          startIndex = currentPage.cursorInfo.startCursor;
      }
    } else {
      // there is no page yet
      startIndex = 0;
    }

    const endIndex = Math.min(startIndex + pageSize, this._data.length);

    // create the cursor info
    return of({
      content: this._data.slice(startIndex, endIndex),
      totalElements: this._data.length,
      cursorInfo: {
        startCursor: startIndex,
        endCursor: endIndex,
        hasNextPage: this._data.length > endIndex + 1,
        hasPreviousPage: startIndex > 0,
      },
    });
  }
}

export type TDataList<T> = T[];
