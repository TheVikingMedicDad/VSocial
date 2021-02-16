import { BaseGqlInput, BaseModel, ID } from '../core/core.types';

// The core model class. We extend from BaseModel to have some convenience
// methods. The toReadableId is used eg. for the "Are you sure"-Dialog
// to present the user with a short representation of the item she wants
// deleted.
export class Todo extends BaseModel {
  static typeName = 'Todo';
  id: ID;
  text?: string;
  isDone?: boolean;
  createdById?: string;
  clientMutationId?: string;

  toReadableId(): string {
    return this.text;
  }
}

// Needed to have typed input arguments in typescript when we call
// the createTodoMutation
export class CreateTodoInput implements BaseGqlInput {
  text: string;
  clientMutationId?: string;
  isDone?: boolean;
}

// Same for the updateTodoMutation
export class UpdateTodoInput implements BaseGqlInput {
  id: ID;
  text?: string;
  isDone?: boolean;
  clientMutationId?: string;
}

export interface TodoDeleteEvent {
  todo: Todo;
  noConfirm: boolean;
}
