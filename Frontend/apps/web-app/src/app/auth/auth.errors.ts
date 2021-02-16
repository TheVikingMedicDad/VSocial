import { CsdBaseError } from '../shared/errors';

export class CsdDuplicateEmailError extends CsdBaseError {
  static key = 'DUPLICATE_EMAIL_ERROR';
  constructor(m: string, data?: string) {
    super(m, CsdDuplicateEmailError.key, data);
    Object.setPrototypeOf(this, CsdDuplicateEmailError.prototype);
  }
}

export class CsdInvalidCredentialsError extends CsdBaseError {
  static key = 'INVALID_CREDENTIALS_ERROR';
  constructor(m: string, data?: string) {
    super(m, CsdInvalidCredentialsError.key, data);
    Object.setPrototypeOf(this, CsdInvalidCredentialsError.prototype);
  }
}

export class CsdInvalidTokenError extends CsdBaseError {
  static key = 'INVALID_TOKEN_ERROR';

  constructor(m: string, data?: string) {
    super(m, CsdInvalidTokenError.key, data);
    Object.setPrototypeOf(this, CsdInvalidTokenError.prototype);
  }
}

export class CsdInvalidEmailError extends CsdBaseError {
  static key = 'INVALID_EMAIL_ERROR';

  constructor(m: string, data?: string) {
    super(m, CsdInvalidEmailError.key, data);
    Object.setPrototypeOf(this, CsdInvalidEmailError.prototype);
  }
}

export class CsdIntegrityError extends CsdBaseError {
  static key = 'INTEGRITY_ERROR';

  constructor(m: string, data?: string) {
    super(m, CsdIntegrityError.key, data);
    Object.setPrototypeOf(this, CsdIntegrityError.prototype);
  }
}

export class CsdNotAuthenticatedError extends CsdBaseError {
  static key = 'NOT_AUTHENTICATED_ERROR';

  constructor(m: string, data?: string) {
    super(m, CsdNotAuthenticatedError.key, data);
    Object.setPrototypeOf(this, CsdNotAuthenticatedError.prototype);
  }
}

export class CsdPermissionDeniedError extends CsdBaseError {
  static key = 'PERMISSION_DENIED_ERROR';

  constructor(m: string, data?: string) {
    super(m, CsdPermissionDeniedError.key, data);
    Object.setPrototypeOf(this, CsdPermissionDeniedError.prototype);
  }
}

export class CsdNoStepIdError extends CsdBaseError {
  static key = 'NO_STEP_ID_ERROR';

  constructor(m: string, id?: string, data?: string) {
    super(m, CsdNoStepIdError.key, data);
    Object.setPrototypeOf(this, CsdNoStepIdError.prototype);
  }
}

export class CsdDuplicateStepError extends CsdBaseError {
  static key = 'DUPLICATE_STEP_ERROR';

  constructor(m: string, data?: string) {
    super(m, CsdDuplicateStepError.key, data);
    Object.setPrototypeOf(this, CsdDuplicateStepError.prototype);
  }
}
