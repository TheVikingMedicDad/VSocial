import {
  ChangeDetectorRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChange,
  SimpleChanges,
  Directive,
} from '@angular/core';
import { CsdBaseModelService } from '../../../core/state/csd-base-model.service';
import { BehaviorSubject, EMPTY, Observable, of, Subscription } from 'rxjs';
import { BaseGqlInput, BaseModel, CrudMode, ID } from '../../../core/core.types';
import { UnsubscribeBaseComponent } from '../../unsubscribe-base.component';
import { FormArray, FormGroup } from '@angular/forms';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import { CsdSnackbarService } from '../../../features/csd-snackbar/csd-snackbar.service';
import { finalize, first, map, switchMap } from 'rxjs/operators';
import { CsdDataService } from '../../../core/services/csd-data.service';
import { I18NextPipe } from 'angular-i18next';
import { camelCaseToSnakeCase } from '../../utils';
import { CsdDraftService } from '../../../draft/csd-draft.service';
import { CsdMainStateService } from '../../../main/state/csd-main-state.service';
import { Draft } from '../../../draft/state/csd-draft.model';

@Directive()
export abstract class CsdBaseModelComponent<T extends BaseModel>
  extends UnsubscribeBaseComponent
  implements OnInit, OnChanges {
  model$: BehaviorSubject<T> = new BehaviorSubject<T>(null);
  @Input() modelId = null;
  @Input() mode = CrudMode.VIEW;
  @Input() formFieldAppearance: MatFormFieldAppearance = 'outline';
  @Input() draftId: ID;
  _draftId: ID;

  modelForm: FormGroup;
  public title = '';
  crudModes = CrudMode;
  draftUpdateSubscription: Subscription;

  constructor(
    protected modelService: CsdBaseModelService<T>,
    protected csdSnackbarService: CsdSnackbarService,
    protected csdDataService: CsdDataService,
    protected changeDetectorRef: ChangeDetectorRef,
    protected i18NextPipe: I18NextPipe,
    protected csdDraftService: CsdDraftService,
    protected csdMainStateService: CsdMainStateService
  ) {
    super();
  }

  abstract onReloadModel(model: T);

  abstract buildForm(): FormGroup;

  abstract getModelInput(): BaseGqlInput;

  abstract setValues(model: T);

  ngOnInit() {
    console.log('CsdBaseModelComponent.ngOnInit');
    this.modelForm = this.buildForm();
    console.log('CsdBaseModelComponent.ngOnInit: modelForm:', this.modelForm);
    if (this.modelId) {
      this.reloadModel();
    }

    if (this.mode === CrudMode.ADD) {
      const readableModelName = this.i18NextPipe.transform(
        `MODEL.${this.getTranslationFileModelName()}.CLS`
      );
      this.title = this.i18NextPipe.transform(`CRUD.TITLE.ADD`, {
        readableModelName: readableModelName,
      });
    }

    if (this.mode === CrudMode.VIEW) {
      this.modelForm.disable();
      this.formFieldAppearance = 'standard';
    }
    this.setUpDraft();
  }

  private setUpDraft(): void {
    if (this.mode === CrudMode.VIEW || !this.modelForm) {
      return;
    }
    if (this.draftUpdateSubscription) {
      this.draftUpdateSubscription.unsubscribe();
    }

    this.draftUpdateSubscription = this.csdDraftService
      .getOrCreateDraftById$(this.modelService.modelName, this.draftId)
      .pipe(
        first(),
        switchMap((draft: Draft) => {
          this._draftId = draft.id;
          return this.modelForm.valueChanges;
        }),
        map(() => {
          this.csdDraftService.createOrUpdateDraft(
            this.getModelInput(),
            this.modelService.modelName,
            this._draftId
          );
        })
      )
      .subscribe();
    this.addSubscription(this.draftUpdateSubscription);
  }

  private getTranslationFileModelName() {
    return camelCaseToSnakeCase(this.modelService.modelName).toUpperCase();
  }

  ngOnChanges(changes: SimpleChanges) {
    const modelId: SimpleChange = changes.modelId;
    const draftId: SimpleChange = changes.draftId;
    const mode: SimpleChange = changes.mode;
    if ('modelId' in changes && modelId.currentValue) {
      console.log('CsdBaseModelComponent.ngOnChanges: modelId changed to ', modelId.currentValue);
      this.reloadModel();
      this.setUpDraft();
    }
    if ('draftId' in changes && draftId.currentValue) {
      console.log('CsdBaseModelComponent.ngOnChanges: draftId changed to ', draftId.currentValue);
      this.setUpDraft();
    }
    if ('mode' in changes) {
      console.log('CsdBaseModelComponent.ngOnChanges: mode changed to ', mode.currentValue);
      if (mode.currentValue === CrudMode.VIEW && this.modelForm) {
        this.modelForm.disable();
      }
    }
  }

  reloadModel() {
    this.addSubscription(
      this.modelService
        .get$(this.modelId)
        .pipe(
          first(),
          switchMap((model: T) => this.afterModelLoadedSwitchMap$(model).pipe(map(() => model)))
        )
        .subscribe((model) => {
          console.log('CsdBaseModelComponent.reloadModel: reloaded model: ', model);
          if (!model || !('id' in model)) {
            this.csdMainStateService.cancelMainSidenav();
          } else {
            this.model$.next(model);
            this.setValues(model);
            this.setTitle(model);
            this.onReloadModel(model);
            this.changeDetectorRef.detectChanges();
          }
        })
    );
  }

  protected afterModelLoadedSwitchMap$(model: T): Observable<T> {
    /***
     * This is a hook that can be overwritten by children of this base class which want to execute
     * some asymetric queries(fetch additional data from server) before setValues() is beeing called, but after
     * the model got loaded by CsdModelService
     *
     * Note: This function must always return an observable which fires once
     */
    return of<T>(model);
  }

  private setTitle(model) {
    this.title = this.i18NextPipe.transform(`CRUD.TITLE.${this.mode.toUpperCase()}`, {
      readableId: model.toReadableId(),
    });
  }

  save$(): Observable<any> {
    if (!this.modelForm.valid) {
      this.markAllControlsAsTouched(this.modelForm);
      this.csdSnackbarService.error(
        `MODEL.${this.getTranslationFileModelName()}.FORM.ERROR.INVALID_FORM_DATA`,
        'snackbar-error-invalid-data'
      );
      return EMPTY;
    } else {
      this.modelForm.disable();
      return this.modelService
        .update$(this.csdDraftService.getDraftByDraftId(this._draftId).data)
        .pipe(
          finalize(() => {
            this.modelForm.enable();
            //this.csdDraftService.deleteAllDraftsOfModel(this.modelId);
          })
        );
    }
  }

  add$(): Observable<any> {
    if (!this.modelForm.valid) {
      this.markAllControlsAsTouched(this.modelForm);
      this.csdSnackbarService.error(
        `MODEL.${this.getTranslationFileModelName()}.FORM.ERROR.INVALID_FORM_DATA`,
        'snackbar-error-invalid-data'
      );
      return EMPTY;
    } else {
      this.modelForm.disable();
      return this.modelService
        .create$(this.csdDraftService.getDraftByDraftId(this._draftId).data)
        .pipe(
          finalize(() => {
            this.modelForm.enable();
            this.csdDraftService.deleteAllDraftsOfModel(this.modelId);
          })
        );
    }
  }

  saveOrAdd$() {
    return this.modelId ? this.save$() : this.add$();
  }

  cancel() {
    this.csdMainStateService.cancelMainSidenav();
  }

  //based on https://github.com/angular/angular/issues/11774#issuecomment-457168862
  protected markAllControlsAsTouched(
    rootControl: FormGroup | FormArray,
    visitChildren: boolean = true
  ) {
    const stack: (FormGroup | FormArray)[] = [];

    // Stack the root FormGroup or FormArray
    if (rootControl && (rootControl instanceof FormGroup || rootControl instanceof FormArray)) {
      stack.push(rootControl);
    }

    while (stack.length > 0) {
      const currentControl = stack.pop();
      (<any>Object).values(currentControl.controls).forEach((control) => {
        // If there are nested forms or formArrays, stack them to visit later
        if (visitChildren && (control instanceof FormGroup || control instanceof FormArray)) {
          stack.push(control);
        } else {
          control.markAsTouched();
        }
      });
    }
  }
}
