import { Directive, ElementRef, OnInit } from '@angular/core';
import { UnsubscribeBaseComponent } from '../unsubscribe-base.component';
import { NavigationEnd, Router } from '@angular/router';
import { distinctUntilChanged, filter } from 'rxjs/operators';

//inspired on https://medium.com/simars/manage-scrolls-on-router-outlets-angular-bca7338fabeb

@Directive({
  selector: 'router-outlet',
})
export class CsdRouterOutletScrollDirective extends UnsubscribeBaseComponent implements OnInit {
  // I initialize the router-outlet directive.
  constructor(private elementRef: ElementRef, private router: Router) {
    super();
  }
  public ngOnInit(): void {
    this.addSubscription(
      this.router.events
        .pipe(
          filter((event) => event instanceof NavigationEnd),
          distinctUntilChanged(
            (prev: NavigationEnd, next: NavigationEnd) => next && next.url === prev.url
          )
        )
        .subscribe((event: any): void => {
          const node = this.elementRef.nativeElement.parentNode;
          node.scrollTop = 0;
        })
    );
  }
}
