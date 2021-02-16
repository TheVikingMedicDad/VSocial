import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { PATH_PARAM_TOKEN } from '../../core/constants/router.constants';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'csd-password-reset-page',
  templateUrl: './csd-password-reset-page.component.html',
  styleUrls: ['./csd-password-reset-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdPasswordResetPageComponent implements OnInit {
  token: string;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get(PATH_PARAM_TOKEN);
  }
}
