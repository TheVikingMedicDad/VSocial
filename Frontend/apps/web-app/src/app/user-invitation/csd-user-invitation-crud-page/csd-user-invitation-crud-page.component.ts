import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import { UnsubscribeBaseComponent } from '../../shared/unsubscribe-base.component';
import { CrudMode, DirtyPage, ID } from '../../core/core.types';
import { ActivatedRoute, ParamMap, UrlSegment } from '@angular/router';
import { tap } from 'rxjs/operators';
import { PATH_NAME_CRUD_MODEL_NEW, PATH_PARAM_ID } from '../../core/constants/router.constants';
import { combineLatest, Observable, of } from 'rxjs';
import { CsdUserInvitationModelComponent } from '../csd-user-invitation-model/csd-user-invitation-model.component';
import { Invitation } from '../../invitation-system/csd-invitation-system.types';

@Component({
  templateUrl: './csd-user-invitation-crud-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdUserInvitationCrudPageComponent
  extends UnsubscribeBaseComponent
  implements OnInit, DirtyPage {
  modelId: ID = null;
  mode = 'view';
  @ViewChild('csdModelComponent')
  csdModelComponent: CsdUserInvitationModelComponent;

  constructor(
    private activatedRoute: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit() {
    const routeParams$ = this.activatedRoute.paramMap.pipe(
      tap((params: ParamMap) => {
        const invitation = params.get(PATH_PARAM_ID);
        if (!!invitation) this.modelId = Invitation.toGlobalId(+invitation);
      })
    );

    const urlSegments$ = this.activatedRoute.url.pipe(
      tap((segments: UrlSegment[]) => {
        // TODO: dirty hack, we have to refactor all other models before!
        if (segments.length > 0) this.mode = segments[0].path;
        else {
          this.mode = CrudMode.VIEW;
        }
        this.mode = this.mode.replace(PATH_NAME_CRUD_MODEL_NEW, CrudMode.ADD);
      })
    );

    this.addSubscription(
      combineLatest(routeParams$, urlSegments$).subscribe((result: any) => {
        this.changeDetectorRef.markForCheck();
      })
    );
  }

  hasDirtyComponent$(): Observable<boolean> {
    if (this.csdModelComponent === null) return of(false);
    return this.csdModelComponent.isDirty$();
  }
}
