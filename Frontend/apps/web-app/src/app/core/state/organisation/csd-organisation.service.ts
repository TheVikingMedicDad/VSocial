import { Injectable } from '@angular/core';
import { Organisation } from './csd-organisation.types';
import { CsdDataService } from '../../services/csd-data.service';
import { CsdBaseModelService } from '../csd-base-model.service';
import { BaseGqlInput, CreateModelSuccessAction, ID } from '../../core.types';
import { getOrganisationQuery } from './csd-organisation.graphql';
import { Observable } from 'rxjs';
import { CsdConfirmDialogService } from '../../csd-confirm-dialog/csd-confirm-dialog.service';
import { I18NextPipe } from 'angular-i18next';
import { CsdMainStateService } from '../../../main/state/csd-main-state.service';

@Injectable({
  providedIn: 'root',
})
export class CsdOrganisationService extends CsdBaseModelService<Organisation> {
  modelName = 'Organisation';
  modelCls = Organisation;

  constructor(
    protected csdDataService: CsdDataService,
    protected csdMainStateService: CsdMainStateService,
    public csdConfirmDialogService: CsdConfirmDialogService,
    public i18NextPipe: I18NextPipe
  ) {
    super(csdDataService, csdMainStateService, csdConfirmDialogService, i18NextPipe);
  }

  get$(id: ID) {
    return this.getObject(getOrganisationQuery, id);
  }

  create$(createInput: BaseGqlInput): Observable<CreateModelSuccessAction<Organisation>> {
    throw Error('CsdOrganisationService.create$: Not implemented yet.');
    return null;
  }

  update$(updateInput: BaseGqlInput): Observable<CreateModelSuccessAction<Organisation>> {
    throw Error('CsdOrganisationService.create$: Not implemented yet.');
    return null;
  }
}
