import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CsdInvitationCheckPageComponentComponent } from './csd-invitation-check-page-component.component';
import { ActivatedRoute, Router } from '@angular/router';
import { PATH_PARAM_TOKEN } from '../../core/constants/router.constants';
import { provideMock, TestingMock } from '../../testing-utils/provide-mock';
import { I18NextPipe } from 'angular-i18next';
import { I18nextPipeMock } from '../../testing-utils/i18next-pipe-mock';
import { CsdCurrentPageService } from '../../core/services/csd-current-page.service';
import { CsdInvitationSystemService } from '../csd-invitation-system.service';
import { Invitation } from '../csd-invitation-system.types';
import { of } from 'rxjs';

describe('CsdInvitationCheckPageComponentComponent', () => {
  let component: CsdInvitationCheckPageComponentComponent;
  let fixture: ComponentFixture<CsdInvitationCheckPageComponentComponent>;
  let csdInvitationSystemServiceMock: CsdInvitationSystemServiceMock;
  let router: any;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CsdInvitationCheckPageComponentComponent, I18nextPipeMock],
      providers: [
        {
          provide: ActivatedRoute,
          useClass: ActivatedRouteMock,
        },
        {
          provide: CsdInvitationSystemService,
          useClass: CsdInvitationSystemServiceMock,
        },
        provideMock(I18NextPipe),
        provideMock(CsdCurrentPageService),
        provideMock(Router),
      ],
    }).compileComponents();
    csdInvitationSystemServiceMock = TestBed.get(CsdInvitationSystemService);
    csdInvitationSystemServiceMock.setUp(null);
    router = TestBed.inject(Router);
  }));

  it('should redirect at valid token', () => {
    const acceptPage = 'some-accept-page';
    csdInvitationSystemServiceMock.setUp({
      isValid: true,
      acceptPage: acceptPage,
    });
    fixture = TestBed.createComponent(CsdInvitationCheckPageComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(router.navigateByUrl.mock.calls[0][0]).toBe(acceptPage);
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

  getInvitationByToken$(token: string) {
    return of(this.invitation);
  }
}
