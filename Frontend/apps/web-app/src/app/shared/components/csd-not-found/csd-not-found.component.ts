import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'csd-not-found',
  templateUrl: './csd-not-found.component.html',
  styleUrls: ['./csd-not-found.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdNotFoundComponent implements OnInit {
  iconPath = '/assets/images/404.svg';

  constructor() {}

  ngOnInit() {}
}
