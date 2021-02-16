import { Component, OnInit, ChangeDetectionStrategy, LOCALE_ID, Inject } from '@angular/core';
import { ID } from '../../core/core.types';
import { SelectionModel } from '@angular/cdk/collections';
import { CsdDataService } from '../../core/services/csd-data.service';
import { CsdRouterUtilsService } from '../../core/csd-router-utils.service';
import { I18NextPipe } from 'angular-i18next';
import { CsdSnackbarService } from '../../features/csd-snackbar/csd-snackbar.service';
import { CsdConfirmDialogService } from '../../core/csd-confirm-dialog/csd-confirm-dialog.service';
import { Router } from '@angular/router';
import { CsdUserInvitationListItem } from './csd-user-invitation-list-data-source';
import { CsdInvitationSystemService } from '../../invitation-system/csd-invitation-system.service';
import { InvitationState } from '../../invitation-system/csd-invitation-system.types';
import { formatDate } from '@angular/common';
import { UserQuery } from '../../admin/user-management/state/user.query';
import { CsdUserInvitationService } from './csd-user-invitation.service';
import { CsdGqlDataSource } from '../../shared/datasource/csd-gql-data-source';
import { UnsubscribeBaseComponent } from '../../shared/unsubscribe-base.component';
import { allMyInvitations } from '../../invitation-system/csd-invitation-system.graphql';
@Component({
  selector: 'csd-user-invitation-list',
  templateUrl: './csd-user-invitation-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdUserInvitationListComponent extends UnsubscribeBaseComponent implements OnInit {
  dataSource: CsdGqlDataSource<CsdUserInvitationListItem>;
  selection = new SelectionModel<CsdUserInvitationListItem>(true, []);

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['select', 'inviteeEmail', 'expires', 'state', 'actions'];

  constructor(
    protected csdDataService: CsdDataService,
    protected csdRouterUtilsService: CsdRouterUtilsService,
    private csdInvitationSystemService: CsdInvitationSystemService,
    private i18NextPipe: I18NextPipe,
    private csdSnackbarService: CsdSnackbarService,
    private csdConfirmDialogService: CsdConfirmDialogService,
    private router: Router,
    private userQuery: UserQuery,
    private csdUserInvitationService: CsdUserInvitationService,
    @Inject(LOCALE_ID) private locale: string
  ) {
    super();
    this.dataSource = new CsdGqlDataSource<CsdUserInvitationListItem>({
      gqlQuery: allMyInvitations,
      gqlQueryVariables: {},
      csdDataService,
      gqlItemsPath: 'me.invitations',
      externalUpdater$: csdInvitationSystemService.getEntityLastModified$(),
    });
  }

  ngOnInit() {}

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.getCurrentTotalElements();
    return numSelected === numRows;
  }

  viewUserInvitation(id: ID) {
    this.csdUserInvitationService.viewUserInvitation(id);
  }

  addNewUserInvitation(): void {
    this.csdUserInvitationService.addNewUserInvitation();
  }

  cancelUserInvitation(id: ID): void {
    this.csdInvitationSystemService.cancel$({ id: id }).subscribe();
  }

  masterToggle() {}

  getExpires(item: CsdUserInvitationListItem) {
    if (item.status === InvitationState.PENDING || item.status === InvitationState.EXPIRED) {
      return formatDate(item.expires, 'medium', this.locale);
    } else {
      return '-';
    }
  }
}
