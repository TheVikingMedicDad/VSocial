import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';

export interface MainUiState {
  sidenavOpen: boolean;
  entityLastModified: EntityModification[];
}

export interface EntityModification {
  entityName: string;
  lastModified: number;
}

const initialState = {
  sidenavOpen: false,
  entityLastModified: [],
};

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'mainUi' })
export class CsdMainUiStore extends Store<MainUiState> {
  constructor() {
    super(initialState);
  }
}
