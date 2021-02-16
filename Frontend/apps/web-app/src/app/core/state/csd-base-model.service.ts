import { CsdDataService } from '../services/csd-data.service';
import { merge, Observable, of, throwError } from 'rxjs';
import { DocumentNode } from '@apollo/client';
import { filter, first, map, switchMap, tap } from 'rxjs/operators';
import { BaseGqlInput, BaseModel, ID } from '../core.types';
import { CsdConfirmDialogService } from '../csd-confirm-dialog/csd-confirm-dialog.service';
import { I18NextPipe } from 'angular-i18next';
import { camelCaseToSnakeCase } from '../../shared/utils';
import { CsdMainStateService } from '../../main/state/csd-main-state.service';
import { get } from 'lodash-es';
import { cleanTypename } from '../core.utils';
// 
import { Todo } from '../../todo/todo.types';
import { getTodoQuery } from '../../todo/todo.graphql';
// 

export const NO_DELETE_CONFIRM_DLG_KEY = 'noConfirmationDialog';

export abstract class CsdBaseModelService<T extends BaseModel> {
  modelCls: { new (): T };
  modelName: string;
  needConfirmationDialog = true;
  createMutation: DocumentNode;
  updateMutation: DocumentNode;
  deleteMutation: DocumentNode;

  constructor(
    protected csdDataService: CsdDataService,
    protected csdMainStateService: CsdMainStateService,
    protected csdConfirmDialogService: CsdConfirmDialogService,
    protected i18NextPipe: I18NextPipe
  ) {}

  getOptimisticResponse(kind: 'create' | 'update' | 'delete', input: BaseGqlInput): any {}

  create$(createInput: BaseGqlInput, apolloOptions = {}): Observable<any> {
    return this._modelMutation$('create', createInput, apolloOptions);
  }

  update$(updateInput: BaseGqlInput, apolloOptions = {}): Observable<any> {
    return this._modelMutation$('update', updateInput, apolloOptions);
  }

  protected _modelMutation$(
    kind: 'create' | 'update' | 'delete',
    input: BaseGqlInput,
    apolloOptions
  ) {
    // prepare options
    const _apolloOptions = {};
    const optimisticResponse = this.getOptimisticResponse(kind, input);
    if (optimisticResponse) {
      _apolloOptions['optimisticResponse'] = optimisticResponse;
    }
    apolloOptions = { ..._apolloOptions, ...apolloOptions };

    // select fitting mutation based on kind
    let mutation;
    switch (kind) {
      case 'create': {
        mutation = this.createMutation;
        break;
      }
      case 'update': {
        mutation = this.updateMutation;
        break;
      }
      case 'delete': {
        mutation = this.deleteMutation;
        break;
      }
    }
    // remove evtl __typename from variables (graphene server doesn't like it)
    let cleanInput = cleanTypename(input);

    //do the actual mutation
    return this.csdDataService.mutate$<T>(mutation, { input: cleanInput }, apolloOptions).pipe(
      tap(() => {
        this.updateLastModified();
      })
    );
  }

  // 
  get$(id: ID): Observable<Todo> {
    return this.getObject(getTodoQuery, id);
  }
  // 

  public updateLastModified() {
    return this.csdMainStateService.updateEntityLastModified(this.modelName);
  }

  public getEntityLastModified$() {
    return this.csdMainStateService.getEntityLastModified$(this.modelName);
  }

  protected getObject(query: DocumentNode, id: ID, options?: {}): Observable<T> {
    const modelNameCamelCase = this.modelName.charAt(0).toLowerCase() + this.modelName.substr(1);
    return this.csdDataService
      .typedQuery<ID, T>(query, { id }, ['data', modelNameCamelCase], options)
      .pipe(
        tap((result: any) => {
          if (result && 'error' in result) {
            //todo: raise error
            throwError(result.error);
          }
          return this._flattenStructureDeep(result);
        }),
        map((obj) => Object.assign(new this.modelCls(), obj))
      );
  }

  protected _flattenStructureDeep(object) {
    const objectsToFlatten = [object];

    while (objectsToFlatten.length > 0) {
      const currentObjectToFlatten = objectsToFlatten.pop();
      for (const key of Object.keys(currentObjectToFlatten)) {
        if (currentObjectToFlatten[key] && currentObjectToFlatten[key].edges) {
          currentObjectToFlatten[key] = currentObjectToFlatten[key].edges.map((edge) => edge.node);
        }
        if (!!currentObjectToFlatten[key] && typeof currentObjectToFlatten[key] === 'object') {
          objectsToFlatten.push(currentObjectToFlatten[key]);
        }
      }
    }
    return object;
  }

  public delete$(entityId: ID, apolloOptions = {}): Observable<boolean> {
    let needConfirm = this.needConfirmationDialog;

    // override class based preset by method argument in apolloOptions
    const noConfirmOption = !!get(apolloOptions, NO_DELETE_CONFIRM_DLG_KEY);
    if (noConfirmOption) {
      needConfirm = !noConfirmOption;
    }

    // if we don't need confirmation we simple return true (as confirmation always accepted
    const noConfirmObs$: Observable<boolean> = of(true);

    // if we need confirmation then the dialog returns either true (confirmed) or false (denied)
    const needConfirmObs$: Observable<boolean> = this.get$(entityId).pipe(
      first(),
      map((model: T) => model.toReadableId()),
      switchMap((readableId) => {
        const confirmDialogConfig = {
          title: {
            key: 'CRUD.DELETE_CONFIRMATION',
            payload: {
              readableModelName: this.i18NextPipe.transform(
                `MODEL.${camelCaseToSnakeCase(this.modelName).toUpperCase()}.CLS`
              ),
              readableModelId: readableId,
            },
          },
          message: '',
          cancelButtonTitle: 'BUTTON.CANCEL',
          submitButtonTitle: 'BUTTON.DELETE',
        };
        return this.csdConfirmDialogService.openConfirmDialog(confirmDialogConfig).afterClosed();
      })
    );

    // depending if we need confirmation decide which obs
    const confirmObs$ = needConfirm ? needConfirmObs$ : noConfirmObs$;

    // return the assembled obs
    return confirmObs$.pipe(
      switchMap((confirmResult) => {
        if (!confirmResult) {
          return of(false);
        }
        return this._modelMutation$('delete', { id: entityId } as BaseGqlInput, apolloOptions);
      }),
      map((result) => !!result)
    );
  }

  /** Here the If-Else Operator of RxJS is used for handling conditional actions.
   *  (https://rangle.io/blog/rxjs-where-is-the-if-else-operator/)
   * */
  public destroy$(entityId: ID, mutationObs$: Observable<T>) {
    // DEPRECATED use delete$() instead
    const source$ = of(this.needConfirmationDialog);
    const useConfirmationDialog$ = source$.pipe(
      filter((needConfirmationDialog) => needConfirmationDialog),
      switchMap(() => this.get$(entityId).pipe(first())),
      map((model: T) => model.toReadableId()),
      switchMap((readableId) => {
        const confirmDialogConfig = {
          title: {
            key: 'CRUD.DELETE_CONFIRMATION',
            payload: {
              readableModelName: this.i18NextPipe.transform(
                `MODEL.${camelCaseToSnakeCase(this.modelName).toUpperCase()}.CLS`
              ),
              readableModelId: readableId,
            },
          },
          message: '',
          cancelButtonTitle: 'BUTTON.CANCEL',
          submitButtonTitle: 'BUTTON.DELETE',
        };
        return this.csdConfirmDialogService.openConfirmDialog(confirmDialogConfig).afterClosed();
      }),
      filter((result) => result)
    );
    const skipConfirmation$ = source$.pipe(
      filter((needConfirmationDialog) => !needConfirmationDialog)
    );
    return merge(useConfirmationDialog$, skipConfirmation$).pipe(
      tap(() => {
        return mutationObs$.subscribe();
      })
    );
  }
}
