import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { CsdDataService } from './csd-data.service';
import { CsdPlatform, CsdVersion, FrontendInfo, ServerInfo } from './csd-version.types';
import { Observable } from 'rxjs';
import { serverInfoQuery } from './csd-version.graphql';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CsdVersionService {
  constructor(
    private csdDataService: CsdDataService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  getServerInfo$(): Observable<ServerInfo> {
    return this.csdDataService.typedQuery<ServerInfo, any>(serverInfoQuery, {}, [
      'data',
      'serverInfo',
    ]);
  }

  getFrontendInfo(): FrontendInfo {
    return {
      platform: isPlatformBrowser(this.platformId) ? CsdPlatform.BROWSER : CsdPlatform.SERVER,
      projectVersion: environment.projectVersion,
      buildTime: new Date(environment.buildTime),
    };
  }
}
