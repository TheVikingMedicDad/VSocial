import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { allUsersQuery } from '../../admin/user-management/csd-user-list/csd-user-list-datasource';
import { CsdDataService } from '../../core/services/csd-data.service';
import { CsdFilterEntry } from '../../features/csd-data-filtering/csd-data-filtering.types';
import { CsdFilterService } from '../../features/csd-data-filtering/csd-filter.service';
import { createDefaultTextFilterOptions } from '../../features/csd-data-filtering/csd-data-filtering.constants';
import { CsdTextFilterComponent } from '../../features/csd-data-filtering/filters/csd-text-filter/csd-text-filter.component';
import { CsdGqlDataSource } from '../../shared/datasource/csd-gql-data-source';
import { UnsubscribeBaseComponent } from '../../shared/unsubscribe-base.component';

@Component({
  selector: 'csd-example-table-page',
  templateUrl: './csd-example-table-page.component.html',
  styleUrls: ['./csd-example-table-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdExampleTablePageComponent extends UnsubscribeBaseComponent implements OnInit {
  constructor() {
    super();
  }

  ngOnInit() {}
}
