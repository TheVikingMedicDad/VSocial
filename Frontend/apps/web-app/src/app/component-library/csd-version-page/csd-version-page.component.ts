import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CsdVersionService } from '../../core/services/csd-version.service';
import { UnsubscribeBaseComponent } from '../../shared/unsubscribe-base.component';
import { FrontendInfo, ServerInfo } from '../../core/services/csd-version.types';

@Component({
  selector: 'csd-version-page',
  templateUrl: './csd-version-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdVersionPageComponent extends UnsubscribeBaseComponent implements OnInit {
  serverInfo: ServerInfo = null;
  frontendInfo: FrontendInfo = null;
  loaded = false;

  constructor(
    private csdVersionService: CsdVersionService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super();
    this.frontendInfo = csdVersionService.getFrontendInfo();
  }

  ngOnInit() {
    // load server version
    this.addSubscription(
      this.csdVersionService.getServerInfo$().subscribe(
        (serverInfo: ServerInfo) => {
          this.serverInfo = serverInfo;
          this.loaded = true;
          this.changeDetectorRef.markForCheck();
        },
        (error: any) => {
          console.error(
            'CsdVersionPageComponent.ngOnInit: Error while loading serverVersion:',
            error
          );
        }
      )
    );
  }
}
