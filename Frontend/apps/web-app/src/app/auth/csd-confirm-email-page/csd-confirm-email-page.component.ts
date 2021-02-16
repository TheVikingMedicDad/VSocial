import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UnsubscribeBaseComponent } from '../../shared/unsubscribe-base.component';
import { PATH_PARAM_TOKEN } from '../../core/constants/router.constants';

@Component({
  selector: 'csd-confirm-email-page',
  templateUrl: './csd-confirm-email-page.component.html',
  styleUrls: ['./csd-confirm-email-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdConfirmEmailPageComponent extends UnsubscribeBaseComponent implements OnInit {
  token: string;

  constructor(private route: ActivatedRoute) {
    super();
  }

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get(PATH_PARAM_TOKEN);
    console.log('CsdConfirmEmailPageComponent.ngOnInit: token: ' + this.token);
  }
}
