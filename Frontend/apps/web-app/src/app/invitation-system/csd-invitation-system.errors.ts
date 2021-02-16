import { CsdBaseError } from '../shared/errors';

export class CsdInvitationUpdateNotAllowedError extends CsdBaseError {
  constructor(m: string) {
    super(m);
    Object.setPrototypeOf(this, CsdInvitationUpdateNotAllowedError.prototype);
  }
}
