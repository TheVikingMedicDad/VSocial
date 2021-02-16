import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UnsubscribeBaseComponent } from '../../../shared/unsubscribe-base.component';
import { CrudMode, ID } from '../../../core/core.types';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { PATH_PARAM_DRAFT_ID } from '../../../core/constants/router.constants';
import { User } from '../../../core/state/user/csd-user.types';
@Component({
  selector: 'csd-user-add-page',
  templateUrl: './csd-user-add-page.component.html',
  styleUrls: ['./csd-user-add-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdUserAddPageComponent extends UnsubscribeBaseComponent implements OnInit {
  crudModeAdd: CrudMode = CrudMode.ADD;
  draftId: ID;

  constructor(
    private activatedRoute: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit() {
    console.log('CsdUserAddPageComponent.ngOnInit');
    this.addSubscription(
      this.activatedRoute.paramMap.subscribe((params: ParamMap) => {
        this.draftId = `${User.typeName}Draft:${params.get(PATH_PARAM_DRAFT_ID)}`;
        this.changeDetectorRef.markForCheck();
      })
    );
  }
}
