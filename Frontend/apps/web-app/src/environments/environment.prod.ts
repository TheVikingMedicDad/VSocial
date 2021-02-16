import { defaultEnvironment } from './default-environment';
import { DeploymentEnvironment } from '../app/core/core.types';

export const environment = {
  ...defaultEnvironment,
  production: true,
} as DeploymentEnvironment;
