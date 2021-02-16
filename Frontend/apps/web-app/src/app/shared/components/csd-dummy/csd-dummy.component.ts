import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'csd-dummy',
  templateUrl: './csd-dummy.component.html',
  styleUrls: ['./csd-dummy.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdDummyComponent implements OnInit {
  constructor() {}
  ngOnInit(): void {}
}
