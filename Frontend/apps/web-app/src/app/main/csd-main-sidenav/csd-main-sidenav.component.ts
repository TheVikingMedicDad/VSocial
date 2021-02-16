import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CsdMainStateService } from '../state/csd-main-state.service';

@Component({
  selector: 'csd-main-sidenav',
  templateUrl: './csd-main-sidenav.component.html',
  styleUrls: ['./csd-main-sidenav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdMainSidenavComponent implements OnInit {
  constructor(private csdMainStateService: CsdMainStateService) {}

  ngOnInit() {}
}
