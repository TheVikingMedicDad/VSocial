import { CsdDataService } from '../../core/services/csd-data.service';
import { BiEvent, LogBiEventInput } from './csd-bi.types';
// 
import { CsdAuthQuery } from '../../auth/state/csd-auth.query';
import { Injectable } from '@angular/core';

const ENABLE_DEBUG_BI_LOGGING = false;

@Injectable({
  providedIn: 'root',
})
export class CsdBiService {
  constructor(private csdDataService: CsdDataService, private csdAuthQuery: CsdAuthQuery) {}

  // 

  logEvent(event: BiEvent, metadata: any = {}, value: number = 1): void {
    // Empty implementation, upgrade for real implementation
    // 
  }
}
