import { v4 } from 'uuid';
import { camelCaseToSnakeCase } from '../shared/utils';

export function uuidv4(): string {
  return v4();
}

export function isValidUuidv4(uuidv4Token: string): boolean {
  const match = uuidv4Token.match(
    /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
  );
  return match !== null;
}

export function omitTypename(key, value) {
  return key === '__typename' ? undefined : value;
}

export function cleanTypename(input: any) {
  return JSON.parse(JSON.stringify(input), omitTypename);
}

export function getRandomInt(max = 65000) {
  return Math.floor(Math.random() * Math.floor(max));
}
