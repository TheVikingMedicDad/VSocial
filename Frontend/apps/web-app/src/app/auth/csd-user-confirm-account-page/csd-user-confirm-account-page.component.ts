import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PATH_PARAM_TOKEN } from '../../core/constants/router.constants';

@Component({
  selector: 'csd-user-confirm-account-page',
  templateUrl: './csd-user-confirm-account-page.component.html',
  styleUrls: ['./csd-user-confirm-account-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdUserConfirmAccountPageComponent implements OnInit {
  token: string;
  inProgress = true;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get(PATH_PARAM_TOKEN);
    console.log('CsdUserConfirmAccountPageComponent.ngOnInit: token: ' + this.token);
  }
}
