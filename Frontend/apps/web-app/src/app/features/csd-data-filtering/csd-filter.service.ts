import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CsdFilterSet } from './csd-data-filtering.types';
import { FAKE_FILTER_MODEL_NAME } from './csd-data-filtering.constants';
import { CsdDraftService } from '../../draft/csd-draft.service';
import { map, filter } from 'rxjs/operators';
import { ROUTER_OUTLET_MAIN_SIDENAV } from '../../core/constants/general.constants';
import {
  PATH_NAME_DATA_FILTERING,
  PATH_NAME_FILTER_CONFIGURATOR,
} from '../../core/constants/router.constants';
import { CsdRouterUtilsService } from '../../core/csd-router-utils.service';
import { ID } from '../../core/core.types';

@Injectable({
  providedIn: 'root',
})
export class CsdFilterService {
  constructor(
    private csdDraftService: CsdDraftService,
    private csdRouterUtilsService: CsdRouterUtilsService
  ) {}

  createOrUpdateGlobalFilterSet(filterSet: CsdFilterSet, id?: ID): ID {
    const draftId = this.csdDraftService.createOrUpdateDraft(filterSet, FAKE_FILTER_MODEL_NAME, id);
    return draftId;
  }

  getGlobalFilterSetById$(filterSetId): Observable<CsdFilterSet> {
    return this.csdDraftService.getDraftByDraftId$(filterSetId).pipe(
      filter((draft) => !!draft),
      map((draft) => draft.data)
    );
  }

  deleteGlobalFilterSet(id: ID): void {
    this.csdDraftService.deleteDraft(id);
  }

  showFilterConfigurator(filterId: ID) {
    this.csdRouterUtilsService.go([
      {
        outlets: {
          [ROUTER_OUTLET_MAIN_SIDENAV]: [
            PATH_NAME_DATA_FILTERING,
            PATH_NAME_FILTER_CONFIGURATOR,
            filterId,
          ],
        },
      },
    ]);
  }
}
