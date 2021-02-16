import { Injectable } from '@angular/core';
import { merge, Observable, of } from 'rxjs';
import { CsdDataService } from '../core/services/csd-data.service';
import { BaseModel, ID } from '../core/core.types';
import { uuidv4 } from '../core/core.utils';
import { TEMP_MODEL_ID } from '../core/constants/general.constants';
import { filter, map, switchMap } from 'rxjs/operators';
import { csdDraftEntityId, CsdDraftStore } from './state/csd-draft.store';
import { Draft } from './state/csd-draft.model';
import { arrayAdd, arrayFind, arrayRemove, arrayUpdate } from '@datorama/akita';
import { DraftQuery } from './state/csd-draft.query';

@Injectable({
  providedIn: 'root',
})
export class CsdDraftService {
  constructor(
    protected csdDataService: CsdDataService,
    private store: CsdDraftStore,
    private csdDraftQuery: DraftQuery
  ) {}

  addDraft(draft: Draft) {
    this.store.update(csdDraftEntityId, (entity) => ({
      drafts: arrayAdd(entity.drafts, draft),
    }));
  }

  updateDraftList(draft: Draft) {
    this.store.update(csdDraftEntityId, (entity) => ({
      drafts: arrayUpdate(entity.drafts, draft.id, draft),
    }));
  }

  deleteDraft(id: ID) {
    this.store.update(csdDraftEntityId, (entity) => ({
      drafts: arrayRemove(entity.drafts, id),
    }));
  }

  getDraftByDraftId$(draftId: ID): Observable<any> {
    if (!this.csdDraftQuery.hasEntity(csdDraftEntityId)) {
      return of({});
    }
    return this.getAllDrafts$().pipe(
      arrayFind((draft) => draft.id === draftId),
      // arrayFind always returns list of objects
      map((list) => list[0])
    );
  }

  getDraftByDraftId(draftId: ID): Draft {
    if (!this.csdDraftQuery.hasEntity(csdDraftEntityId)) {
      return null;
    }
    return this.csdDraftQuery
      .getEntity(csdDraftEntityId)
      .drafts.filter((draft) => draft.id === draftId)[0];
  }

  getAllDrafts$(): Observable<Draft[]> {
    return this.csdDraftQuery.selectEntity(csdDraftEntityId, 'drafts');
  }

  getAllDraftsOfModel$(modelCls: new () => BaseModel): Observable<Draft[]> {
    return this.getAllDrafts$().pipe(
      // dataId looks like UserType:1
      arrayFind(
        (draft) => draft.dataId.toString().split(':')[0] === this.getModelTypeName(modelCls)
      )
    );
  }

  getDraftByModelId$(id: ID): Observable<Draft> {
    // resulting list length of selected query should always be 1
    return this.getAllDrafts$().pipe(
      arrayFind((draft) => draft.dataId === id),
      map((list) => list[0])
    );
  }

  deleteAllDraftsOfModel(modelId: ID): void {
    // case when provided id is non existing (no saved drafts)
    if (!modelId) return;

    // all drafts of a specific model (e.g. UserType:1) are deleted
    this.store.update(csdDraftEntityId, (entity) => ({
      drafts: arrayRemove(entity.drafts, (draft) => draft.dataId.toString() === modelId.toString()),
    }));
  }

  getModelTypeName(modelCls: new () => BaseModel): string {
    return (<any>modelCls).graphQlTypename;
  }

  createOrUpdateDraft(
    data: BaseModel | {},
    modelClsOrTypeName: (new (...args: any[]) => BaseModel) | string,
    id: ID = null
  ): ID {
    let modelType = '';
    if (typeof modelClsOrTypeName === 'string') {
      modelType = modelClsOrTypeName as string;
    } else {
      modelType = this.getModelTypeName(modelClsOrTypeName);
    }

    const currentTime = new Date();

    const inputDict = {
      id: id ? id : modelType + 'Draft:' + uuidv4(),
      data: data,
      dataId:
        data.hasOwnProperty('id') && (data as BaseModel).id
          ? (data as BaseModel).id
          : `${modelType}:${TEMP_MODEL_ID}`,
      created: currentTime,
      updated: currentTime,
      __typename: 'Draft',
    };

    const draft = this.getDraftByDraftId(inputDict.id);

    if (!draft) {
      // if the draft was not among them, we create and add it
      this.addDraft(inputDict);
    } else {
      delete inputDict['created'];
      // if it is among them, we update it with the draft of the args
      this.updateDraftList(inputDict);
    }

    return inputDict.id;
  }

  getOrCreateDraftById$(modelName: string, draftId: ID = null): Observable<Draft> {
    const draftById$ = this.getDraftByDraftId$(draftId);

    const getDraftIdIfExisting$ = draftById$.pipe(
      filter((draft) => !!draft),
      map((draft) => draft.id)
    );

    const createDraftIfNotExisting$ = draftById$.pipe(
      filter((draft) => !draft),
      map(() => this.createOrUpdateDraft({}, modelName, draftId))
    );

    return merge(getDraftIdIfExisting$, createDraftIfNotExisting$).pipe(
      switchMap((result) => {
        return this.getDraftByDraftId$(result);
      })
    );
  }
}
