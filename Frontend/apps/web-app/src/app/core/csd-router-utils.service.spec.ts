import { TestBed } from '@angular/core/testing';

import { CsdRouterUtilsService } from './csd-router-utils.service';
import { Router } from '@angular/router';
import { ROUTER_OUTLET_MAIN_SIDENAV } from './constants/general.constants';

const OLD_ADD_PAGE_URL = '/mainpage(main-sidenav:testModel/add)';
const OLD_VIEW_PAGE_URL = '/mainpage(main-sidenav:testModel/view/TestModelType:8)';
const OLD_EDIT_PAGE_URL = '/mainpage(main-sidenav:testModel/edit/TestModelType:8)';

const ADD_PAGE_URL_WITH_KEY = '/mainpage(main-sidenav:my-model/new;someKey=2)';
const ADD_PAGE_URL = '/mainpage(main-sidenav:my-model/new)';

const VIEW_PAGE_URL = '/mainpage(main-sidenav:my-model/1)';
const EDIT_PAGE_URL = 'https://example.com/mainpage(main-sidenav:my-model/1/edit)';

const SOME_URL_THAT_DOESNT_HAVE_TO_BE_REPLACED = '/foo';

const TEST_ROUTING_COMMAND = [
  {
    outlets: {
      [ROUTER_OUTLET_MAIN_SIDENAV]: 'modelName/4',
    },
  },
];

describe('CsdRouterUtilsService', () => {
  let fixture: CsdRouterUtilsService;
  let router: RouterMock;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Router,
          useClass: RouterMock,
        },
      ],
    });
    router = TestBed.get(Router);
    fixture = TestBed.inject(CsdRouterUtilsService);
  });

  it('should replace add and edit links having `old` format', () => {
    // coming from the add Page to view page:
    router.setMockUrl(OLD_ADD_PAGE_URL);
    fixture.navigate(TEST_ROUTING_COMMAND);
    expectLastRouterExtras().toEqual({ replaceUrl: true });

    // coming from the add Page to view page:
    router.setMockUrl(OLD_EDIT_PAGE_URL);
    fixture.navigate(TEST_ROUTING_COMMAND);
    expectLastRouterExtras().toEqual({ replaceUrl: true });
  });

  it('should replace add and edit links having `new` format', () => {
    // coming from the add Page to view page:
    router.setMockUrl(ADD_PAGE_URL);
    fixture.navigate(TEST_ROUTING_COMMAND, {});
    expectLastRouterExtras().toEqual({ replaceUrl: true });

    // coming from the add Page to view page with keys:
    router.setMockUrl(ADD_PAGE_URL_WITH_KEY);
    fixture.navigate(TEST_ROUTING_COMMAND, {});
    expectLastRouterExtras().toEqual({ replaceUrl: true });

    // coming from the edit Page to view page:
    router.setMockUrl(EDIT_PAGE_URL);
    fixture.navigate(TEST_ROUTING_COMMAND);
    expectLastRouterExtras().toEqual({ replaceUrl: true });
  });

  it('should not replace view pages and other random stuff', () => {
    // coming from the view Page to view page:
    router.setMockUrl(VIEW_PAGE_URL);
    fixture.navigate(TEST_ROUTING_COMMAND);
    expectLastRouterExtras().toEqual({});

    // coming from the old view Page to view page:
    router.setMockUrl(OLD_VIEW_PAGE_URL);
    fixture.navigate(TEST_ROUTING_COMMAND);
    expectLastRouterExtras().toEqual({});

    // other random stuff:
    router.setMockUrl(SOME_URL_THAT_DOESNT_HAVE_TO_BE_REPLACED);
    fixture.navigate(TEST_ROUTING_COMMAND);
    expectLastRouterExtras().toEqual({});
  });

  it('should still replace if i want to', () => {
    router.setMockUrl(SOME_URL_THAT_DOESNT_HAVE_TO_BE_REPLACED);
    fixture.navigate(TEST_ROUTING_COMMAND, { replaceUrl: true });
    expectLastRouterExtras().toEqual({ replaceUrl: true });
  });

  it('should not replace if i dont want to', () => {
    router.setMockUrl(EDIT_PAGE_URL);
    fixture.navigate(TEST_ROUTING_COMMAND, { replaceUrl: false });
    expectLastRouterExtras().toEqual({ replaceUrl: false });
  });

  function expectLastRouterExtras() {
    return expect(router.navigate.mock.calls[router.navigate.mock.calls.length - 1][1]);
  }
});

class RouterMock {
  url: string;
  navigate = jest.fn();

  setMockUrl(url: string) {
    this.url = url;
  }
}
