import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Location } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'csd-last-email-preview-frame',
  templateUrl: './csd-last-email-preview-frame.component.html',
  styleUrls: ['./csd-last-email-preview-frame.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdLastEmailPreviewFrameComponent {
  _src = '/api/testing/last-email';
  src: SafeUrl;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private location: Location
  ) {
    this.src = this._src;
    this.setSrc();
  }

  setSrc() {
    this.src = this.sanitizer.bypassSecurityTrustResourceUrl(window.location.origin + this._src);
  }

  public doRefresh() {
    this.setSrc();
    this.changeDetectorRef.markForCheck();
  }
}
