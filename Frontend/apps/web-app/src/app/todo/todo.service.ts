import { Injectable } from '@angular/core';
import { CsdDataService } from '../core/services/csd-data.service';
import {
  createTodoMutation,
  deleteTodoMutation,
  getTodoQuery,
  updateTodoMutation,
} from './todo.graphql';
import { CreateTodoInput, Todo, UpdateTodoInput } from './todo.types';
import { BaseGqlInput, ID } from '../core/core.types';
import { CsdBaseModelService } from '../core/state/csd-base-model.service';
import { Observable } from 'rxjs';
import { CsdConfirmDialogService } from '../core/csd-confirm-dialog/csd-confirm-dialog.service';
import { I18NextPipe } from 'angular-i18next';
import { CsdMainStateService } from '../main/state/csd-main-state.service';
import { getRandomInt } from '../core/core.utils';

@Injectable({
  providedIn: 'root',
})
export class TodoService extends CsdBaseModelService<Todo> {
  // here we need to define the Name of the model and also the model class (we defined earlier)
  // the class is needed to create instances of the model
  modelName = 'Todo';
  modelCls = Todo;
  // Here we connect the CRUD graphql queries and mutatuib with the
  // actual http fetching logic from apollo (although it is encapsulated in the CsdBaseModelService)
  createMutation = createTodoMutation;
  updateMutation = updateTodoMutation;
  deleteMutation = deleteTodoMutation;
  getQuery = getTodoQuery;

  constructor(
    protected csdDataService: CsdDataService,
    protected csdMainStateService: CsdMainStateService,
    protected csdConfirmDialogService: CsdConfirmDialogService,
    protected i18NextPipe: I18NextPipe
  ) {
    super(csdDataService, csdMainStateService, csdConfirmDialogService, i18NextPipe);
  }

  getOptimisticResponse(kind, input: BaseGqlInput): any {
    // This is needed if we want optimistic UI (= UI should update immediately not waiting for the
    // server response. Here we construct a fake server response so that the UI can continue while
    // hoping that the server will succeed. If server errors apollo will handle the restoration of
    // a valid state.
    const fakeResponse = {
      __typename: 'Mutation',
    };
    fakeResponse[kind + this.modelName] = {
      todo: {
        isDone: false,
        // we use a negative ID here for unpersisted temporary objects
        id: kind === 'create' ? Todo.toGlobalId(-getRandomInt()) : input['id'],
        __typename: Todo.graphQlTypename,
        ...input,
      },
    };

    return fakeResponse;
  }

  // the following methods are only implemented in this class to
  // ensure the correct input data type. If that's not needed you can skip implementing them
  // and the parents methods are directly called then.
  delete$(id: ID, apolloOptions = {}): Observable<boolean> {
    return super.delete$(id, apolloOptions);
  }

  create$(createTodoInput: CreateTodoInput, apolloOptions): Observable<Todo> {
    return super.create$(createTodoInput, apolloOptions);
  }

  update$(updateTodoInput: UpdateTodoInput, apolloOptions = {}): Observable<Todo> {
    return super.update$(updateTodoInput, apolloOptions);
  }
}
