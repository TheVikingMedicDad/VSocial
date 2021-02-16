import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CsdCurrentPageService } from '../../../core/services/csd-current-page.service';
import { PAGE_KEY_USER_MANAGEMENT } from '../../../core/constants/page.constants';

@Component({
  selector: 'csd-user-management-page',
  templateUrl: './csd-user-management-page.component.html',
  styleUrls: ['./csd-user-management-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdUserManagementPageComponent implements OnInit {
  constructor(private csdCurrentPageService: CsdCurrentPageService) {}

  ngOnInit() {
    this.csdCurrentPageService.setCurrentPageKey$(PAGE_KEY_USER_MANAGEMENT);
  }
}
