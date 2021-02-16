import { isValidUuidv4 } from '../core/core.utils';

export function isValidInvitationToken(uuidv4Token: string): boolean {
  return isValidUuidv4(uuidv4Token);
}
