import { BaseGqlInput, ID } from '../core/core.types';

export interface User {
  readonly id: ID;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly emailVerified: boolean;
  readonly interests: string[];
  readonly salutation: string;
  readonly language: string;
  readonly country: string;
  readonly groups: string[];
  readonly permissions: string[];
}

export interface ConfirmAccountInfo {
  readonly firstName: string;
  readonly lastName: string;
  readonly interests: string[];
  readonly salutation: string;
  readonly country: string;
}

export interface AuthCheckDialogData {
  actionKey: AuthCheckActions;
}

export interface RequestPasswordResetInput extends BaseGqlInput {
  email: string;
}

export interface ResetPasswordInput extends BaseGqlInput {
  resetToken: string;
  newPassword: string;
}

export interface ChangePasswordInput extends BaseGqlInput {
  newPassword: string;
}

export enum AuthMethod {
  PASSWORD = 'PASSWORD',
}

// NOTE: These values must be in sync with the server!
export enum AuthCheckActions {
  CHANGE_PASSWORD = 'CHANGE_PASSWORD_ACTION',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  CHANGE_EMAIL = 'CHANGE_EMAIL',
}

export interface RequestEmailChangeInput extends BaseGqlInput {
  newEmail: string;
}

export interface ConfirmEmailInput extends BaseGqlInput {
  key: string;
}

export interface LoginUserInput extends BaseGqlInput {
  email: string;
  password: string;
}

export interface RegisterUserInput extends BaseGqlInput {
  email: string;
  password: string;
  language: string;
}

export interface AuthCheckInput extends BaseGqlInput {
  actionKey: AuthCheckActions;
  currentPassword?: string;
}

export interface UserUpdateMeInput extends BaseGqlInput {
  id: ID;
  firstName: string;
  lastName: string;
  salutation: string;
  interests: string[];
  language: string;
  country: string;
}

export interface ConfirmUserInput extends BaseGqlInput {
  key: string;
  confirmAccountInfo: ConfirmAccountInfo;
}

export interface AuthUserMutationResponse {
  token: string;
}

export interface MeMutationResponse {
  user: User;
}
