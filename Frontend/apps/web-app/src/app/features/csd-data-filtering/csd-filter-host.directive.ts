import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[csd-filter-host]',
})
export class CsdFilterHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) {}
}
