import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CsdFilterEntry } from '../../features/csd-data-filtering/csd-data-filtering.types';
import { CsdTextFilterComponent } from '../../features/csd-data-filtering/filters/csd-text-filter/csd-text-filter.component';
import { createDefaultTextFilterOptions } from '../../features/csd-data-filtering/csd-data-filtering.constants';
import { CsdGqlDataSource } from '../../shared/datasource/csd-gql-data-source';
import { CsdDataService } from '../../core/services/csd-data.service';
import { Observable, of } from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';
import { debounceTime, delay, map, switchMap } from 'rxjs/operators';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { gql } from '@apollo/client';
import { DocumentNode } from '@apollo/client';

@Component({
  selector: 'csd-example-gql-datasource-section',
  templateUrl: './csd-example-gql-datasource-section.component.html',
  styleUrls: ['./csd-example-gql-datasource-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('loadingAnimationTrigger', [
      transition(':enter', [style({ opacity: 0 }), animate('0ms', style({ opacity: 1 }))]),
      transition(':leave', [animate('100ms', style({ opacity: 0 }))]),
    ]),
  ],
})
export class CsdExampleGqlDatasourceSectionComponent implements OnInit {
  filterFieldTranslationPattern = 'MODEL.USER.FORM.<fieldId>.LABEL';
  filters: CsdFilterEntry[] = [
    {
      fieldId: 'firstName',
      filter: CsdTextFilterComponent,
      filterOptions: createDefaultTextFilterOptions(),
    },
  ];

  dataSource: CsdGqlDataSource<any>;
  showIsLoading$: Observable<boolean>;
  availableColumns = ['id', 'firstName', 'email'];
  columnsForm: FormGroup;

  constructor(private csdDataService: CsdDataService, private formBuilder: FormBuilder) {
    this.dataSource = new CsdGqlDataSource<any>({
      gqlQuery: () => this.gqlQueryFactory(),
      gqlQueryVariables: {},
      csdDataService,
      gqlItemsPath: 'allUsers',
    });

    // we want to show the loading indicator as soon as we are loading, but we want to delay the hiding of
    // the indicator because we would be to fast otherwise
    this.showIsLoading$ = this.dataSource.isLoading$.pipe(
      debounceTime(10),
      switchMap((isLoading) => {
        const delayTime = isLoading ? 0 : 500;
        return of(isLoading).pipe(delay(delayTime));
      })
    );

    // initialize the columns form
    this.columnsForm = formBuilder.group({
      columns: formBuilder.array(
        this.availableColumns.map(
          (column, idx) =>
            new FormControl({
              disabled: idx === 0,
              value: idx === 0,
            })
        )
      ),
    });

    this.columnsForm
      .get('columns')
      .valueChanges.subscribe((change) => this.dataSource.triggerUpdate());
  }

  getColumnsSelected() {
    const selected = [true, ...this.columnsForm.get('columns').value];
    return this.availableColumns.filter((column, idx) => selected[idx]);
  }

  ngOnInit() {}

  gqlQueryFactory(): DocumentNode {
    const columns = [...this.getColumnsSelected()];
    return gql`
      ${allUsersQueryTemplate.replace('<fields>', columns.join(', '))}
    `;
  }
}

const allUsersQueryTemplate = `
  query allUsers(
    $orderBy: [String]
    $after: String
    $first: Int
    $before: String
    $last: Int
    $filter: UserTypeFilterConnectionFilter
  ) {
    allUsers(
      orderBy: $orderBy
      after: $after
      first: $first
      before: $before
      last: $last
      filter: $filter
    ) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }

      edges {
        node {
          <fields>
        }
        cursor
      }
    }
  }
`;
