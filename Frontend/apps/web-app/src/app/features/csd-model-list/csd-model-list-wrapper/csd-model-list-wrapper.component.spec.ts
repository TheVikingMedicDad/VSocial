// 
//
import { CsdModelListWrapperComponent } from './csd-model-list-wrapper.component';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CsdPaginatorDataSourceDirective } from '../../../shared/directives/csd-paginator-data-source.directive';
import { APOLLO_TESTING_CACHE, ApolloTestingModule } from 'apollo-angular/testing';
import { CsdRouterUtilsService } from '../../../core/csd-router-utils.service';
import { provideMock } from '../../../testing-utils/provide-mock';
import { CsdListDataSource } from '../../../shared/datasource/csd-list-data-source';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CsdBaseDataSource } from '../../../shared/datasource/csd-base-data-source';
import { filter, first, map, tap } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';

const FAKE_DATA_LENGTH = 17;
const DISPLAY_SIZE = 5;

describe('CsdModelListWrapperComponent', () => {
  let component: TestingHostComponent;
  let fixture: ComponentFixture<TestingHostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ApolloTestingModule, NoopAnimationsModule, MatPaginatorModule],
      providers: [
        {
          provide: APOLLO_TESTING_CACHE,
        },
        provideMock(CsdRouterUtilsService),
      ],
      declarations: [
        MockMatIconButtonComponent,
        MockCsdFilterButtonComponent,
        CsdModelListWrapperComponent,
        CsdPaginatorDataSourceDirective,
        TestingHostComponent,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestingHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and retrieve some values', (done) => {
    expect(component).toBeTruthy();
    const testTotalLength$ = component.getTotalLength$().pipe(
      first(),
      map((value) => {
        expect(value).toBe(FAKE_DATA_LENGTH);
      })
    );

    const testDisplayedData$ = component.displayedData$.asObservable().pipe(
      filter((data) => data !== -1),
      map((data) => expect(data.length).toBe(DISPLAY_SIZE))
    );

    combineLatest(testTotalLength$, testDisplayedData$).subscribe((ok) => done());
  });
});

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <csd-model-list-wrapper [dataSource]="dataSource" pageSize=${DISPLAY_SIZE}>
      <div *ngIf="data$ | async as data">
        {{ data.length }}
      </div>
    </csd-model-list-wrapper>
  `,
})
class TestingHostComponent {
  dataSource: CsdBaseDataSource<any>;
  data$: Observable<any[]>;

  displayedData$ = new BehaviorSubject<any>(-1);

  public constructor() {
    const fakeData = Array(FAKE_DATA_LENGTH)
      .fill(0)
      .map((key, i) => ({
        id: i,
        firstName: 'blub',
        email: `test${i}@cnc.io`,
      }));

    this.dataSource = new CsdListDataSource<any>(fakeData);
    this.data$ = this.dataSource.connect().pipe(tap((data) => this.displayedData$.next(data)));
  }

  public getTotalLength$() {
    return this.dataSource.getTotalElements$();
  }
}

@Component({
  selector: 'csd-filter-button',
  template: '',
})
class MockCsdFilterButtonComponent {
  @Input() filterSetId: string;
  @Input() buttonTranslationKey: string;
}

@Component({
  selector: 'mat-icon',
  template: '',
})
class MockMatIconButtonComponent {}
// 
