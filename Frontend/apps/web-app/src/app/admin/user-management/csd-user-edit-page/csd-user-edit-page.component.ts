import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UnsubscribeBaseComponent } from '../../../shared/unsubscribe-base.component';
import { PATH_PARAM_ID } from '../../../core/constants/router.constants';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { tap } from 'rxjs/operators';
import { CrudMode, ID } from '../../../core/core.types';

@Component({
  selector: 'csd-user-edit-page',
  templateUrl: './csd-user-edit-page.component.html',
  styleUrls: ['./csd-user-edit-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdUserEditPageComponent extends UnsubscribeBaseComponent implements OnInit {
  modelId: ID;
  crudModeEdit: CrudMode = CrudMode.EDIT;

  constructor(
    private activatedRoute: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit() {
    console.log('CsdUserEditPageComponent.ngOnInit');
    this.addSubscription(
      this.activatedRoute.paramMap
        .pipe(
          tap((params: ParamMap) => {
            console.log('CsdUserEditPageComponent.ngOnInit: params: ', params);
            this.modelId = params.get(PATH_PARAM_ID);
            this.changeDetectorRef.markForCheck();
          })
        )
        .subscribe()
    );
  }
}
