import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CsdBaseModelComponent } from '../../shared/components/csd-base-model/csd-base-model.component';

import { I18NextPipe } from 'angular-i18next';
import { CsdSnackbarService } from '../../features/csd-snackbar/csd-snackbar.service';
import { FormBuilder, Validators } from '@angular/forms';
import { CsdDataService } from '../../core/services/csd-data.service';
import { CrudMode, DirtyComponent } from '../../core/core.types';
import { Observable, of } from 'rxjs';
import {
  CreateInvitationInput,
  Invitation,
} from '../../invitation-system/csd-invitation-system.types';
import { CsdInvitationSystemService } from '../../invitation-system/csd-invitation-system.service';
import { CsdValidationService } from '../../core/csd-validation.service';
import { CsdDraftService } from '../../draft/csd-draft.service';
import { CsdUserInvitationService } from '../csd-user-invitation-list/csd-user-invitation.service';
import { CsdMainStateService } from '../../main/state/csd-main-state.service';

@Component({
  selector: 'csd-user-invitation-model',
  templateUrl: './csd-user-invitation-model.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdUserInvitationModelComponent
  extends CsdBaseModelComponent<Invitation>
  implements OnInit, OnDestroy, DirtyComponent {
  crudMode = CrudMode;

  constructor(
    protected i18NextPipe: I18NextPipe,
    protected csdInvitationSystemService: CsdInvitationSystemService,
    protected changeDetectorRef: ChangeDetectorRef,
    protected csdSnackbarService: CsdSnackbarService,
    protected formBuilder: FormBuilder,
    protected csdDataService: CsdDataService,
    protected csdDraftService: CsdDraftService,
    protected csdUserInvitationService: CsdUserInvitationService,
    protected csdMainStateService: CsdMainStateService
  ) {
    super(
      csdInvitationSystemService,
      csdSnackbarService,
      csdDataService,
      changeDetectorRef,
      i18NextPipe,
      csdDraftService,
      csdMainStateService
    );
  }

  ngOnInit() {
    super.ngOnInit();
  }

  saveOrAdd() {
    this.saveOrAdd$().subscribe(
      (action) => {
        this.modelForm.markAsPristine();
        this.csdUserInvitationService.viewUserInvitation(action.invitation.id);
      },
      (error) => {
        this.csdSnackbarService.error(error);
      }
    );
  }

  destroy(): void {
    this.csdInvitationSystemService.cancel$({ id: this.modelId }).subscribe();
  }

  isDirty$(): Observable<boolean> {
    if (this.mode !== CrudMode.VIEW) {
      if (this.modelForm.dirty) return of(true);
    }

    return of(false);
  }

  edit() {
    return null;
  }

  setValues(model: Invitation) {
    this.modelForm.get('inviteeEmail').setValue(model.inviteeEmail);
    this.modelForm.get('message').setValue(model.message);
  }

  buildForm() {
    const form = this.formBuilder.group({
      inviteeEmail: ['', [Validators.required, CsdValidationService.emailValidator]],
      message: ['', []],
    });

    return form;
  }

  getModelInput() {
    switch (this.mode) {
      case CrudMode.ADD: {
        const createInvitationInput: CreateInvitationInput = {
          inviteeEmail: this.modelForm.get('inviteeEmail').value,
          message: this.modelForm.get('message').value,
          invitationType: 'USER',
        };
        return createInvitationInput;
      }
      case CrudMode.EDIT: {
        return null;
      }
    }
    return null;
  }

  onReloadModel(model: Invitation) {}

  ngOnDestroy() {
    super.ngOnDestroy();
  }
}
