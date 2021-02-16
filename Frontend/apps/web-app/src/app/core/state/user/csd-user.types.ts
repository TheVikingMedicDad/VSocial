import { BaseGqlInput, BaseModel, ID, ModelMeta, Tag } from '../../core.types';

export interface InterfaceError {
  id: ID;
  message: string;
  data: string;
}

export interface CreateUserInput extends BaseGqlInput {
  email: string;
  firstName?: string;
  lastName?: string;
  salutation?: string;
  country?: string;
  interests?: string[];
  profileImageTemporaryId?: string;
  tags?: NestedTagInput[];
}

export interface UpdateUserInput extends BaseGqlInput {
  id: ID;
  firstName?: string;
  lastName?: string;
  salutation?: string;
  country?: string;
  interests?: string[];
  profileImageTemporaryId?: string;
  tags?: NestedTagInput[];
}

export interface NestedTagInput {
  id?: ID;
  name?: string;
  toDelete?: boolean;
}

export class User extends BaseModel {
  static _meta = class Meta extends ModelMeta {};

  static typeName = 'User';
  readonly id: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly salutation: string;
  readonly country: string;
  readonly interests: string[];
  readonly profileImage: string;
  tags?: Tag[];

  buildForm() {}

  toReadableId(): string {
    const readableNames = this.firstName + ' ' + this.lastName;
    return readableNames.trim() ? readableNames : this.email;
  }
}
