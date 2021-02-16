import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CsdUserInvitationAcceptPageComponent } from './csd-user-invitation-accept-page.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CsdInvitationSystemService } from '../../invitation-system/csd-invitation-system.service';
import { provideMock, TestingMock } from '../../testing-utils/provide-mock';
import { I18NextPipe } from 'angular-i18next';
import { CsdCurrentPageService } from '../../core/services/csd-current-page.service';
import { PATH_NAME_APP_ENTRY_PAGE, PATH_PARAM_TOKEN } from '../../core/constants/router.constants';
import { CsdSnackbarService } from '../../features/csd-snackbar/csd-snackbar.service';
import { Invitation } from '../../invitation-system/csd-invitation-system.types';
import { of } from 'rxjs';

describe('CsdUserInvitationAcceptPageComponent', () => {
  let component: CsdUserInvitationAcceptPageComponent;
  let fixture: ComponentFixture<CsdUserInvitationAcceptPageComponent>;
  let router: any;
  let csdInvitationService: CsdInvitationSystemServiceMock;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CsdUserInvitationAcceptPageComponent],
      providers: [
        provideMock(CsdInvitationSystemService),
        provideMock(I18NextPipe),
        provideMock(CsdCurrentPageService),
        provideMock(Router),
        provideMock(CsdSnackbarService),
        {
          provide: ActivatedRoute,
          useClass: ActivatedRouteMock,
        },
        {
          provide: CsdInvitationSystemService,
          useClass: CsdInvitationSystemServiceMock,
        },
      ],
    }).compileComponents();
    router = TestBed.inject(Router);
    csdInvitationService = TestBed.get(CsdInvitationSystemService);
    csdInvitationService.setUp({});
  }));

  it('should create', () => {
    fixture = TestBed.createComponent(CsdUserInvitationAcceptPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(router.navigateByUrl.mock.calls[0][0]).toBe(PATH_NAME_APP_ENTRY_PAGE);
  });
});

class ActivatedRouteMock {
  public snapshot = {
    paramMap: new Map<string, string>([[PATH_PARAM_TOKEN, 'a1a0fc51-56fd-47ba-8e38-adb99ffa748f']]),
  };
}

class CsdInvitationSystemServiceMock {
  private invitation: Invitation;

  public setUp(invitationInput: any): void {
    this.invitation = Object.assign(new Invitation(), invitationInput);
  }

  accept$(token: string) {
    return of(this.invitation);
  }
}
