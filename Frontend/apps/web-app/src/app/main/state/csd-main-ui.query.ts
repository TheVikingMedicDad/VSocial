import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { CsdMainUiStore, EntityModification, MainUiState } from './csd-main-ui.store';
import { filter, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CsdMainUiQuery extends Query<MainUiState> {
  isSidenavOpen$ = this.select('sidenavOpen');

  constructor(protected store: CsdMainUiStore) {
    super(store);
  }

  getEntityLastModified$(entityName: string) {
    return this.select('entityLastModified').pipe(
      map((entities: EntityModification[]) =>
        entities.find((item) => item.entityName === entityName)
      ),
      filter((entity) => !!entity)
    );
  }
}
