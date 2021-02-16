import { BaseModel, ModelMeta } from '../../core.types';

export class Organisation extends BaseModel {
  static _meta = class Meta extends ModelMeta {};

  static typeName = 'Organisation';
  readonly id: string;
  readonly name: string;
  readonly owner: string;

  buildForm() {}

  toReadableId(): string {
    return this.name;
  }
}
