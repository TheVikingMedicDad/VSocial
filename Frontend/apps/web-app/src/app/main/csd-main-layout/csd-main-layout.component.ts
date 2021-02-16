import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  Inject,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { MatSidenav } from '@angular/material/sidenav';
import { CsdMainStateService } from '../state/csd-main-state.service';
import { UnsubscribeBaseComponent } from '../../shared/unsubscribe-base.component';
import { NavigationEnd, Router } from '@angular/router';
import { CsdCurrentUserService } from '../../auth/csd-current-user.service';
import { isPlatformBrowser } from '@angular/common';
import { CsdMainUiQuery } from '../state/csd-main-ui.query';
import { CsdUserToolbarComponent } from '../csd-user-toolbar/csd-user-toolbar.component';

@Component({
  selector: 'csd-main-layout',
  templateUrl: './csd-main-layout.component.html',
  styleUrls: ['./csd-main-layout.component.scss'],
})
export class CsdMainLayoutComponent
  extends UnsubscribeBaseComponent
  implements OnInit, AfterViewInit {
  publicPage = true;
  isModalNotifcation = false;
  isSidenavOpen$: Observable<boolean> = this.mainUiQuery.isSidenavOpen$;
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(map((result) => result.matches));

  @ViewChild('mainSidenav') mainSidenav: MatSidenav;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private csdMainStateService: CsdMainStateService,
    private mainUiQuery: CsdMainUiQuery,
    private csdCurrentUserService: CsdCurrentUserService,
    public router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    super();
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.setViewPortHeight();
    }
  }

  onToolbarActivate(componentRef: any) {
    const hasUserToolbar = componentRef instanceof CsdUserToolbarComponent;
    // TODO: rename publicPage class, should be more like hasUserToolbar;
    this.publicPage = !hasUserToolbar;
  }

  onToolbarDeactivate(event: any) {
    this.publicPage = true;
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('resize', () => {
        this.setViewPortHeight();
      });
    }
    this.addSubscription(
      this.isSidenavOpen$
        .pipe(
          filter(() => !!this.mainSidenav),
          tap((open) => (open ? this.mainSidenav.open() : this.mainSidenav.close()))
        )
        .subscribe()
    );

    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        if (e.url.includes('(main-sidenav:')) {
          this.csdMainStateService.setMainSidenavOpen$(true);
        } else {
          this.csdMainStateService.setMainSidenavOpen$(false);
        }
      });

    this.addSubscription(
      this.csdCurrentUserService.getUser$().subscribe((user) => {
        //TODO: modal notifcations can happen in various situations, make it more generic
        this.isModalNotifcation = user === null ? false : !user.emailVerified;
      })
    );
  }
  // https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
  // --vh is used in _csd-sidenav-container.scss
  setViewPortHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
}
