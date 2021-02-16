import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CsdDummyComponent } from './csd-dummy.component';

describe('CsdDummyComponent', () => {
  let component: CsdDummyComponent;
  let fixture: ComponentFixture<CsdDummyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CsdDummyComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CsdDummyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
