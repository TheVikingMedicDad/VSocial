export class CsdBaseError extends Error {
  id: string;
  data: string;

  constructor(m: string, id?: string, data?: string) {
    super(m);
    this.id = id;
    this.data = data;
    Object.setPrototypeOf(this, CsdBaseError.prototype);
  }
}

export class CsdNetworkError extends CsdBaseError {
  static key = 'NETWORK_ERROR';

  constructor(m: string) {
    super(m);
    Object.setPrototypeOf(this, CsdNetworkError.prototype);
  }
}

export class CsdUnauthorizedError extends CsdBaseError {
  static key = 'UNAUTHORIZED_ERROR';

  constructor() {
    super('Unauthorized');
    Object.setPrototypeOf(this, CsdUnauthorizedError.prototype);
  }
}

export const REGISTERED_ERROR_CLASSES = {
  NETWORK_ERROR: CsdNetworkError,
};
