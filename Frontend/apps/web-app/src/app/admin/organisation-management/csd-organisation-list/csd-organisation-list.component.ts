import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { CsdDataService } from '../../../core/services/csd-data.service';
import {
  CsdOrganisationListDataSource,
  CsdOrganisationListItem,
} from './csd-organisation-list-datasource';
import { BaseModelListComponent } from '../../../shared/components/base-model-list/base-model-list.component';
import { CsdFilterService } from '../../../features/csd-data-filtering/csd-filter.service';
import { CsdRouterUtilsService } from '../../../core/csd-router-utils.service';

@Component({
  selector: 'csd-organisation-list',
  templateUrl: './csd-organisation-list.component.html',
  styleUrls: ['./csd-organisation-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdOrganisationListComponent extends BaseModelListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource: CsdOrganisationListDataSource;
  selection = new SelectionModel<CsdOrganisationListItem>(true, []);

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['select', 'id', 'name', 'owner'];

  constructor(
    protected csdDataService: CsdDataService,
    protected csdFilterService: CsdFilterService,
    protected csdRouterUtilsService: CsdRouterUtilsService
  ) {
    super(csdDataService, csdFilterService, csdRouterUtilsService);
  }

  ngOnInit() {
    this.dataSource = new CsdOrganisationListDataSource(
      this.paginator,
      this.sort,
      this.csdDataService
    );
    this.addSubscription(
      this.dataSource.getResetPagination$().subscribe(() => this.paginator.firstPage())
    );
  }

  viewUser(id: string) {
    console.log('CsdOrganisationListComponent.viewUser: id: ', id);
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.totalCount;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    // this.isAllSelected() ?
    //   this.selection.clear() :
    //   this.dataSource.data.forEach(row => this.selection.select(row));
  }

  addNewOrganisation() {
    // this.csdUserService.create$({
    //   firstName: 'new',
    //   lastName: 'last',
    //   email: Math.random().toString(36).substring(7) + 'cool@cnc.io',
    //   //email:'coola1@cnc.io',
    //   clientMutationId: '1234'
    // });
    //this.csdDataService.dispatch(new CsdViewUserAddAction());
  }
}
