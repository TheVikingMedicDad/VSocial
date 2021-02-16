import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { PAGE_KEY_ORGANISATION_MANAGEMENT } from '../../../core/constants/page.constants';
import { CsdCurrentPageService } from '../../../core/services/csd-current-page.service';

@Component({
  selector: 'csd-organisation-management-page',
  templateUrl: './csd-organisation-management-page.component.html',
  styleUrls: ['./csd-organisation-management-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdOrganisationManagementPageComponent implements OnInit {
  constructor(private csdCurrentPageService: CsdCurrentPageService) {}

  ngOnInit() {
    this.csdCurrentPageService.setCurrentPageKey$(PAGE_KEY_ORGANISATION_MANAGEMENT);
  }
}
