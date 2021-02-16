import { Injectable } from '@angular/core';
import { CsdDataService } from '../../core/services/csd-data.service';
import { Observable } from 'rxjs';
import { ROUTER_OUTLET_MAIN_SIDENAV } from '../../core/constants/general.constants';
import { Router } from '@angular/router';
import { CsdMainUiStore } from './csd-main-ui.store';
import { CsdMainUiQuery } from './csd-main-ui.query';

@Injectable({
  providedIn: 'root',
})
export class CsdMainStateService {
  constructor(
    private csdDataService: CsdDataService,
    private router: Router,
    private store: CsdMainUiStore,
    private csdMainUiQuery: CsdMainUiQuery
  ) {}

  setMainSidenavOpen$(open: boolean): Observable<any> {
    return this.store.update({ sidenavOpen: open });
  }

  updateEntityLastModified(entityName: string) {
    this.store.update((state) => {
      let updated = false;
      const lastModified = new Date().getTime();
      let entityLastModified = state.entityLastModified.map((item) => {
        if (item.entityName === entityName) {
          updated = true;
          return {
            ...item,
            lastModified,
          };
        }
        return item;
      });

      if (!updated) {
        entityLastModified = [...state.entityLastModified, { entityName, lastModified }];
      }

      return { entityLastModified };
    });
  }

  getEntityLastModified$(entityName: string) {
    return this.csdMainUiQuery.getEntityLastModified$(entityName);
  }

  cancelMainSidenav() {
    this.router
      .navigate([
        {
          outlets: {
            [ROUTER_OUTLET_MAIN_SIDENAV]: null,
          },
        },
      ])
      .then((navigationWorked) => {
        if (navigationWorked) {
          this.setMainSidenavOpen$(false);
        } else {
          console.log(
            'CsdMainState.cancelMainSidenavAction: Navigation did not work. This can be caused by a guard'
          );
        }
      });
  }
}
