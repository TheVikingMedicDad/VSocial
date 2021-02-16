import { BaseGqlInput } from '../../core/core.types';

export interface LogBiEventInput extends BaseGqlInput {
  event: BiEvent;
  value: number;
  userId: number;
  metadata: any;
}

export enum BiEvent {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  SIGNUP = 'SIGNUP',
  USER_ACCOUNT_SETTINGS_SAVED = 'USER_ACCOUNT_SETTINGS_SAVED',
  USER_PASSWORD_CHANGED = 'USER_PASSWORD_CHANGED',
  USER_ACCOUNT_DELETED = 'USER_ACCOUNT_DELETED',
  VIEWED_ACCOUNT_SETTINGS = 'VIEWED_ACCOUNT_SETTINGS',
  VIEWED_DASHBOARD = 'VIEWED_DASHBOARD',
}
