export type CsdVersion = string;

export enum CsdPlatform {
  BROWSER = 'BROWSER',
  SERVER = 'SERVER',
}

export interface ServerInfo {
  mainVersion: CsdVersion;
  projectVersion: CsdVersion;
  buildTime: Date;
}

export interface FrontendInfo {
  platform: CsdPlatform;
  projectVersion: CsdVersion;
  buildTime: Date;
}
