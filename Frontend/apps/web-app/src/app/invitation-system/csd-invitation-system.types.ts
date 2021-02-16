import { BaseGqlInput, BaseModel, ID, ModelMeta } from '../core/core.types';

export enum InvitationState {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  CANCELED = 'CANCELED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export class Invitation extends BaseModel {
  static _meta = class Meta extends ModelMeta {};

  static typeName = 'Invitation';
  id: ID;

  invitationType: string;
  inviteeEmail: string;
  payload?: string;
  message: string;
  state: InvitationState;

  isValid?: boolean;
  invalidReason?: string;
  acceptPage?: string;

  buildForm() {}

  toReadableId(): string {
    return this.id;
  }
}

export enum InvitationInvalidReason {
  EXPIRED = 'EXPIRED',
  WRONG_EMAIL = 'WRONG_EMAIL',
  ACCEPTED = 'ACCEPTED',
  CANCELED = 'CANCELED',
  REJECTED = 'REJECTED',
}

export class CreateInvitationInput implements BaseGqlInput {
  clientMutationId?: string;
  invitationType: string;
  inviteeEmail: string;
  inviteeUserId?: ID;
  message: string;
  payload?: string;
}

export class AcceptInvitationInput implements BaseGqlInput {
  clientMutationId?: string;
  acceptToken: string;
}

export class CancelInvitationInput implements BaseGqlInput {
  clientMutationId?: string;
  id: ID;
}
