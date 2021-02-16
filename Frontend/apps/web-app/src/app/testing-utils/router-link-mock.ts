import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  // tslint:disable-next-line
  selector: '[routerLink]',
})
// tslint:disable-next-line
export class RouterLinkDirectiveMock {
  @Input() routerLink: any[] | string;
  navigatedTo: any[] | string = null;

  @HostListener('click', ['$event'])
  onClick() {
    this.navigatedTo = this.routerLink;
  }
}
