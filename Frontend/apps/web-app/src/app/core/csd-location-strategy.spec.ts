import { TestBed } from '@angular/core/testing';

import { CsdLocationStrategy } from './csd-location-strategy';
import { APP_BASE_HREF, LocationStrategy } from '@angular/common';

describe('CsdLocationStrategy', () => {
  let fixture: CsdLocationStrategy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: APP_BASE_HREF,
          useValue: '/',
        },
        {
          provide: LocationStrategy,
          useClass: CsdLocationStrategy,
        },
      ],
    });
    jest.spyOn(window.history, 'back');
    jest.spyOn(window.history, 'go');
    fixture = TestBed.get(LocationStrategy);
  });

  it('should skip one when go back', () => {
    fixture.pushState(null, '', '/edit/', null);
    fixture.pushState(null, '', '/view/', null);
    fixture.pushState(null, '', '/view/', null);
    fixture.back();
    expect(window.history.go).toHaveBeenCalledWith(-2);
  });

  it('should go back normal', () => {
    fixture.pushState(null, '', '/edit/', null);
    fixture.pushState(null, '', '/view/', null);
    fixture.back();
    expect(window.history.back).toHaveBeenCalled();
  });

  it('should also go back when nothing in interal stack', () => {
    fixture.back();
    expect(window.history.back).toHaveBeenCalled();
  });

  it('should deal with complex workflows', () => {
    fixture.replaceState(null, '', '/view/', null);
    fixture.pushState(null, '', '/edit/', null);
    fixture.replaceState(null, '', '/view/', null);
    fixture.back();
    expect(window.history.go).toHaveBeenCalledWith(-2);
    expect(fixture.getPushHistory().length).toBe(0);

    fixture.pushState(null, '', '/edit/', null);
    fixture.back();
    expect(window.history.back).toHaveBeenCalled();
    expect(fixture.getPushHistory().length).toBe(0);

    fixture.replaceState(null, '', '/test/', null);
    fixture.pushState(null, '', '/test/', null);
    fixture.pushState(null, '', '/view/', null);
    fixture.back(); // we have test -> test
    expect(window.history.back).toHaveBeenCalled();
    expect(fixture.getPushHistory().length).toBe(2); // test and test
    fixture.back();
    expect(window.history.go).toHaveBeenCalledWith(-2);
    expect(fixture.getPushHistory().length).toBe(0); // test and test
  });
});
