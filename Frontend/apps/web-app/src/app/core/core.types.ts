import { FormGroup } from '@angular/forms';
import { TranslationObject } from '../translation/translation.type';
import { CsdVersion } from './services/csd-version.types';
import { Observable } from 'rxjs';

export type ID = string;

export abstract class BaseModel {
  static _meta: any;
  static typeName: string;
  static _graphQlTypename: string;
  private static _defaultGraphQlTypename = 'Type';
  id: ID;

  public static toGlobalId(id: number): ID {
    return this.graphQlTypename + ':' + id;
  }

  public static idFromGlobalId(id: ID): number {
    return parseInt(id.split(':')[1], 10);
  }

  abstract toReadableId(): string;

  static get graphQlTypename() {
    return this._graphQlTypename
      ? this._graphQlTypename
      : this.typeName + this._defaultGraphQlTypename;
  }
}

export abstract class ModelMeta {
  constructor(public configuration: { form: FormGroup }) {}

  static buildForm() {
    //override
  }
}

export enum CrudMode {
  EDIT = 'edit',
  ADD = 'add',
  VIEW = 'view',
}

export interface BaseGqlInput {
  clientMutationId?: string;
}

export class BaseMutationAction {
  variables: { input: BaseGqlInput };

  constructor(input: BaseGqlInput) {
    this.variables = {
      input,
    };
  }
}

export class Tag extends BaseModel {
  id: ID;
  name: string;

  toReadableId(): string {
    return this.name;
  }
}

export class DownloadFile {
  url?: string;
  absoluteUrl?: string;
  name?: string;
  size?: number;
}

export interface DeleteModelInput extends BaseGqlInput {
  id: ID;
}

export class CreateModelSuccessAction<T> {
  static type = 'CreateModelSuccessAction';
  ok = true; //needed for decision if dispatch$ should raise error

  constructor(public clientMutationId: ID, public model: T) {}
}

export interface CsdConfirmDialogConfig {
  title: string | TranslationObject;
  message?: string | TranslationObject;
  messageHtml?: string;
  cancelButtonTitle: string | TranslationObject;
  submitButtonTitle: string | TranslationObject;
}

export interface DirtyPage {
  hasDirtyComponent$(): Observable<boolean>;
}

export interface DirtyComponent {
  isDirty$(): Observable<boolean>;
}

export const CSD_GRAPHQL_UNIVERSAL_HOST = 'CSD_GRAPHQL_UNIVERSAL_HOST';

export interface DeploymentEnvironment {
  production: boolean;
  mainVersion: CsdVersion;
  projectVersion: CsdVersion;
  buildTime: CsdVersion;
}
