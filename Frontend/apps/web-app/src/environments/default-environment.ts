import { DeploymentEnvironment } from '../app/core/core.types';
import { CSD_BUILD_TIME, CSD_MAIN_VERSION, CSD_PROJECT_VERSION } from './generated-environment';

export const defaultEnvironment: DeploymentEnvironment = {
  production: false,
  mainVersion: CSD_MAIN_VERSION,
  projectVersion: CSD_PROJECT_VERSION,
  buildTime: CSD_BUILD_TIME,
};
