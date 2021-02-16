import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ID } from '../../../core/core.types';
import { PATH_PARAM_ID } from '../../../core/constants/router.constants';
import { tap } from 'rxjs/operators';
import { UnsubscribeBaseComponent } from '../../../shared/unsubscribe-base.component';

@Component({
  selector: 'csd-user-view-page',
  templateUrl: './csd-user-view-page.component.html',
  styleUrls: ['./csd-user-view-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdUserViewPageComponent extends UnsubscribeBaseComponent implements OnInit {
  modelId: ID;

  constructor(
    private activatedRoute: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit() {
    console.log('CsdUserViewPageComponent.ngOnInit');
    this.addSubscription(
      this.activatedRoute.paramMap
        .pipe(
          tap((params: ParamMap) => {
            console.log('CsdUserViewPageComponent.ngOnInit: params: ', params);
            this.modelId = params.get(PATH_PARAM_ID);
            this.changeDetectorRef.markForCheck();
          })
        )
        .subscribe()
    );
  }
}
