import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'csd-card-overview',
  templateUrl: './csd-card-overview.component.html',
  styleUrls: ['./csd-card-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdCardOverviewComponent implements OnInit {
  constructor() {}

  ngOnInit() {}

  onDelete() {
    console.log('CsdComponentOverview.onDelete');
  }

  onEdit() {
    console.log('CsdComponentOverview.onEdit');
  }

  onMore() {
    console.log('CsdComponentOverview.onMore');
  }
}
