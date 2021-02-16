import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { allUsersQuery, CsdUserListItem } from './csd-user-list-datasource';
import { SelectionModel } from '@angular/cdk/collections';
import { CsdUserService } from '../../../core/state/user/csd-user.service';
import { CsdDataService } from '../../../core/services/csd-data.service';
import { User } from '../../../core/state/user/csd-user.types';
import {
  CsdDownloadPrepareDialogComponent,
  ProgressIndicatorDialogData,
} from '../../../core/csd-download-prepare-dialog/csd-download-prepare-dialog.component';
import { BaseGqlInput, ID, Tag } from '../../../core/core.types';
import {
  CsdTextFilterComponent,
  CsdTextFilterOptions,
} from '../../../features/csd-data-filtering/filters/csd-text-filter/csd-text-filter.component';
import { CsdDraftService } from '../../../draft/csd-draft.service';
import { TEMP_MODEL_ID } from '../../../core/constants/general.constants';
import {
  CsdChoiceFilterComponent,
  CsdChoiceFilterOptions,
} from '../../../features/csd-data-filtering/filters/csd-choice-filter/csd-choice-filter.component';
import {
  createDefaultTextFilterOptions,
  TextFilterVariant,
} from '../../../features/csd-data-filtering/csd-data-filtering.constants';
import { CsdFilterEntry } from '../../../features/csd-data-filtering/csd-data-filtering.types';
import { UnsubscribeBaseComponent } from '../../../shared/unsubscribe-base.component';
import { CsdGqlDataSource } from '../../../shared/datasource/csd-gql-data-source';

@Component({
  selector: 'csd-user-list',
  templateUrl: './csd-user-list.component.html',
  styleUrls: ['./csd-user-list.component.scss'],
})
export class CsdUserListComponent extends UnsubscribeBaseComponent implements OnInit {
  dataSource: CsdGqlDataSource<CsdUserListItem>;
  selection = new SelectionModel<CsdUserListItem>(true, []);
  avatarUrl = '/assets/images/avatar_dark.svg';
  draftModelId: ID;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = [
    'select',
    'userImage',
    'firstName',
    'lastName',
    'email',
    'language',
    'tags',
    'lastLogin',
    'dateJoined',
    // 
    'actions',
  ];

  choiceFilterOptions: CsdChoiceFilterOptions = {
    choices: [
      { choiceTranslationKey: 'LANG.DE', value: 'de' },
      { choiceTranslationKey: 'LANG.EN', value: 'en' },
    ],
  };

  textFilterOptions = createDefaultTextFilterOptions();

  // 

  filterFieldTranslationPattern = 'MODEL.USER.FORM.<fieldId>.LABEL';
  filters: CsdFilterEntry[] = [
    { fieldId: 'firstName', filter: CsdTextFilterComponent, filterOptions: this.textFilterOptions },
    { fieldId: 'lastName', filter: CsdTextFilterComponent, filterOptions: this.textFilterOptions },
    // 
    {
      fieldId: 'language',
      filter: CsdChoiceFilterComponent,
      filterOptions: this.choiceFilterOptions,
    },
  ];

  constructor(
    protected csdDataService: CsdDataService,
    protected csdUserService: CsdUserService,
    private csdDraftService: CsdDraftService,
    private matDialog: MatDialog
  ) {
    super();
    this.dataSource = new CsdGqlDataSource<CsdUserListItem>({
      gqlQuery: allUsersQuery,
      gqlQueryVariables: {},
      csdDataService,
      gqlItemsPath: 'allUsers',
      externalUpdater$: csdUserService.getEntityLastModified$(),
    });
  }

  ngOnInit() {}

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.getCurrentTotalElements();
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    // this.isAllSelected() ?
    //   this.selection.clear() :
    //   this.dataSource.data.forEach(row => this.selection.select(row));
  }

  addNewUser() {
    User.toGlobalId(TEMP_MODEL_ID);
    this.draftModelId = User.toGlobalId(TEMP_MODEL_ID);
    const draftId = this.csdDraftService.createOrUpdateDraft(
      { id: this.draftModelId },
      User.typeName
    );
    this.csdUserService.viewUserAdd(draftId);
  }

  viewUser(id: string) {
    console.log('CsdUserListComponent.viewUser: id: ', id);
    this.csdUserService.viewUserView(id);
  }

  editUser(id: string) {
    this.draftModelId = id;
    console.log('CsdUserListComponent.editUser: id: ', id);
    this.csdUserService.userEdit(id);
  }

  deleteUser(id: string) {
    this.csdUserService.userDelete$({ id: id }).subscribe();
  }

  resetPassword(id: string) {
    // TODO: Implement CsdChangePasswordDialogComponent to work with arbitrary user ids
    // this.csdUserService.userResetPassword(id);
  }

  exportUserList() {
    const downloadFileObs = this.csdUserService.exportUserList$({ type: 'csv' } as BaseGqlInput);

    // open the progressIndicatorDialog
    const dialogData: ProgressIndicatorDialogData = {
      downloadFileObs: downloadFileObs,
      minShowingTime: 2000,
      closeWhenDownloadStarts: true,
    };

    this.matDialog.open(CsdDownloadPrepareDialogComponent, {
      data: dialogData,
    });
  }

  getTags(row: any): Tag[] {
    const edges: any[] = row.tags.edges;
    return edges.map((x) => x.node);
  }
}
