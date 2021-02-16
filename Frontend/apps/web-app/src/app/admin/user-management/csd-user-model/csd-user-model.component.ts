import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  CreateUserInput,
  NestedTagInput,
  UpdateUserInput,
  User,
} from '../../../core/state/user/csd-user.types';
import { CsdUserService } from '../../../core/state/user/csd-user.service';
import { CsdBaseModelComponent } from '../../../shared/components/csd-base-model/csd-base-model.component';
import { I18NextPipe } from 'angular-i18next';
import { FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { CsdSnackbarService } from '../../../features/csd-snackbar/csd-snackbar.service';
import { CsdDataService } from '../../../core/services/csd-data.service';
import { CrudMode, ID, Tag } from '../../../core/core.types';
import { CsdValidationService } from '../../../core/csd-validation.service';
import { get } from 'lodash-es';
import { TranslationObject } from '../../../translation/translation.type';
import { CsdDraftService } from '../../../draft/csd-draft.service';
import { first, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { TEMP_MODEL_ID } from '../../../core/constants/general.constants';
import { CsdMainStateService } from '../../../main/state/csd-main-state.service';

@Component({
  selector: 'csd-user-model',
  templateUrl: './csd-user-model.component.html',
  styleUrls: ['./csd-user-model.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdUserModelComponent extends CsdBaseModelComponent<User> implements OnInit {
  interests: string[];
  salutations: string[];
  countries: string[];
  model: User = null;
  @Input() draftId: ID;
  new_tag_id = Tag.toGlobalId(TEMP_MODEL_ID);

  currentUploadedFile: string;
  profileImage: string;
  public profileImageReseted = false;

  avatarUrl = '/assets/images/avatar_dark.svg';

  labelIdle: TranslationObject = {
    key: 'ACCOUNT_SETTINGS.PERSONAL_INFORMATION.FORM.PROFILE_IMAGE.CHANGE',
    payload: {},
  };
  labelFileProcessing: TranslationObject = {
    key: 'ACCOUNT_SETTINGS.PERSONAL_INFORMATION.FORM.PROFILE_IMAGE.PROCESSING',
    payload: {},
  };
  labelFileProcessingComplete: TranslationObject = {
    key: 'ACCOUNT_SETTINGS.PERSONAL_INFORMATION.FORM.PROFILE_IMAGE.COMPLETE',
    payload: {},
  };
  labelTapToCancel: TranslationObject = {
    key: 'ACCOUNT_SETTINGS.PERSONAL_INFORMATION.FORM.PROFILE_IMAGE.CANCEL',
    payload: {},
  };
  labelTapToUndo: TranslationObject = {
    key: 'ACCOUNT_SETTINGS.PERSONAL_INFORMATION.FORM.PROFILE_IMAGE.UNDO',
    payload: {},
  };

  @ViewChild('profileImagePond') profileImagePond: any;

  pondOptions = {
    allowMultiple: false,
    allowReplace: true,
    labelIdle: this.i18NextPipe.transform(this.labelIdle.key),
    labelFileProcessing: this.i18NextPipe.transform(this.labelFileProcessing.key),
    labelFileProcessingComplete: this.i18NextPipe.transform(this.labelFileProcessingComplete.key),
    labelTapToCancel: this.i18NextPipe.transform(this.labelTapToCancel.key),
    labelTapToUndo: this.i18NextPipe.transform(this.labelTapToUndo.key),
    instantUpload: true,
    acceptedFileTypes: 'image/jpeg, image/png',
    server: {
      url: '',
      process: '/api/file-upload/process/',
      revert: '/api/file-upload/revert/',
      restore: '/api/file-upload/restore/?id=',
      fetch: '/api/file-upload/fetch/',
      load: '',
    },
    allowImagePreview: true,
    imagePreviewHeight: 170,
    stylePanelLayout: 'compact circle',
    styleLoadIndicatorPosition: 'right bottom',
    styleProgressIndicatorPosition: 'right bottom',
    styleButtonProcessItemPosition: 'right bottom',
    styleButtonRemoveItemPosition: 'left bottom',
    allowImageResize: true,
    imageResizeMode: 'cover',
    imageResizeUpscale: true,
    allowImageCrop: true,
    imageCropAspectRatio: '1:1',
  };

  pondFiles = [];
  allUserTagsCsdSelectData = [];

  constructor(
    protected i18NextPipe: I18NextPipe,
    protected csdUserService: CsdUserService,
    protected changeDetectorRef: ChangeDetectorRef,
    protected csdSnackbarService: CsdSnackbarService,
    protected formBuilder: FormBuilder,
    protected csdDataService: CsdDataService,
    protected csdDraftService: CsdDraftService,
    protected csdMainStateService: CsdMainStateService
  ) {
    super(
      csdUserService,
      csdSnackbarService,
      csdDataService,
      changeDetectorRef,
      i18NextPipe,
      csdDraftService,
      csdMainStateService
    );
  }

  ngOnInit() {
    this.interests = Object.keys(
      this.i18NextPipe.transform('MODEL.USER.INTERESTS.OPTIONS', { returnObjects: true })
    );
    this.salutations = Object.keys(
      this.i18NextPipe.transform('MODEL.USER.FORM.SALUTATION.OPTIONS', { returnObjects: true })
    );
    this.countries = Object.keys(
      this.i18NextPipe.transform('COUNTRY_SELECTOR.OPTIONS', { returnObjects: true })
    );
    super.ngOnInit();
    this.fillTagsCsdSelect$().subscribe();
  }

  onReloadModel(model: User) {}

  private fillTagsCsdSelect() {
    this.fillTagsCsdSelect$().subscribe((ok) => this.changeDetectorRef.markForCheck());
  }

  private fillTagsCsdSelect$(): Observable<void> {
    return this.csdUserService.getAllUserTags$().pipe(
      first(),
      map((tags: Tag[]) => {
        this.allUserTagsCsdSelectData = tags.map(
          (tag) => new Object({ id: tag.id, name: tag.name })
        );
      })
    );
  }

  protected afterModelLoadedSwitchMap$(model: User): Observable<any> {
    return this.fillTagsCsdSelect$();
  }

  setValues(model: User) {
    this.model = model;
    this.modelForm.get('salutation').setValue(model.salutation);
    this.modelForm.get('firstName').setValue(model.firstName);
    this.modelForm.get('lastName').setValue(model.lastName);
    this.modelForm.get('country').setValue(model.country);
    this.profileImage = model.profileImage;

    if (this.profileImage) {
      const profileImage = this.profileImage.slice(1);
      this.pondOptions.instantUpload = true;
      this.pondFiles = [
        {
          source: profileImage,
          options: {
            type: 'local',
          },
        },
      ];
    } else {
      this.pondOptions.instantUpload = false;
    }

    if (model.interests) {
      this.interests.forEach((interest, i) => {
        this.modelForm.get(`interests.${i}`).setValue(model.interests.includes(interest));
      });
    }

    if (this.mode !== CrudMode.EDIT) {
      this.modelForm.get('email').setValue(model.email);
    }

    // set selected tags
    const selectedTags = model.tags.map((tag) => new Object({ id: tag.id, name: tag.name }));
    this.tagsForm.setValue(selectedTags);
  }

  buildForm() {
    const form = this.formBuilder.group({
      salutation: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      country: ['', [Validators.required]],
      tags: [{ value: [], disabled: false }, []],
      interests: this.formBuilder.array([]) as FormArray,
    });

    this.interests.forEach((interest) => {
      (<FormArray>form.get('interests')).push(new FormControl(false));
    });
    if (this.mode !== CrudMode.EDIT) {
      form.addControl(
        'email',
        new FormControl('', [Validators.required, CsdValidationService.emailValidator])
      );
    }

    return form;
  }

  getModelInput() {
    switch (this.mode) {
      case CrudMode.EDIT: {
        const updateModelInput: UpdateUserInput = {
          id: this.model$.getValue().id,
          firstName: this.modelForm.get('firstName').value,
          lastName: this.modelForm.get('lastName').value,
          salutation: this.modelForm.get('salutation').value,
          country: this.modelForm.get('country').value,
          interests: this.interests.filter((x, i) => !!this.modelForm.get('interests').value[i]),
          profileImageTemporaryId:
            this.profileImageReseted === true ? '' : this.currentUploadedFile,
          tags: this.getUpdateTagInput(),
        };
        return updateModelInput;
      }
      case CrudMode.ADD: {
        const newModelInput: CreateUserInput = {
          email: this.modelForm.get('email').value,
          firstName: this.modelForm.get('firstName').value,
          lastName: this.modelForm.get('lastName').value,
          salutation: this.modelForm.get('salutation').value,
          country: this.modelForm.get('country').value,
          interests: this.interests.filter((x, i) => !!this.modelForm.get('interests').value[i]),
          profileImageTemporaryId:
            this.profileImageReseted === true ? '' : this.currentUploadedFile,
          tags: this.getUpdateTagInput(),
        };
        return newModelInput;
      }
    }
  }

  get tagsForm() {
    return this.modelForm.get('tags');
  }

  addNewTag(tagInput: string): void {
    if (tagInput === '') return;

    const newVal = {
      id: this.new_tag_id,
      name: tagInput,
    };
    this.allUserTagsCsdSelectData.push(newVal);

    const newSelected = this.tagsForm.value;
    newSelected.push(newVal);
    this.tagsForm.setValue(newSelected);
  }

  getUpdateTagInput(): NestedTagInput[] {
    const selectedTags = this.tagsForm.value;
    const oldTags = this.model ? this.model.tags : [];

    // build input: all which we are selected
    const input = selectedTags.map((value) => {
      if (value.id === this.new_tag_id) return { name: value.name };
      return { id: value.id };
    });
    //find old ones and delete them
    const tagsToDelete = [];
    oldTags.forEach((oldTag) => {
      if (!input.find((inputElem) => inputElem.id == oldTag.id)) {
        tagsToDelete.push(oldTag.id);
      }
    });
    tagsToDelete.forEach((id) => input.push({ id: id, toDelete: true }));
    return input;
  }

  saveOrAdd() {
    this.saveOrAdd$().subscribe((response) => {
      this.csdUserService.viewUserView(response.user.id);
    });
  }

  edit() {
    this.csdUserService.userEdit(this.modelId);
  }

  destroy() {
    //TODO: Switch to CsdViewUserDeleteAction and add confirmation dialog as effect
    this.csdUserService.userDelete$({ id: this.modelId }).subscribe();
  }

  cancel() {
    this.csdDraftService.deleteAllDraftsOfModel(this.modelId);
    super.cancel();
  }

  pondHandleAddFile() {
    this.profileImageReseted = false;
  }

  pondHandleProcessFile(event: any) {
    this.currentUploadedFile = get(event, 'file.serverId');
  }

  pondHandleRemoveFile() {
    this.pondOptions.instantUpload = true;
    this.profileImage = null;
    this.profileImageReseted = true;
  }
}
