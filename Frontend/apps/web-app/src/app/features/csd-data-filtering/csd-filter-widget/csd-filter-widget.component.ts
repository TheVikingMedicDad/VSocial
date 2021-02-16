import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  EventEmitter,
  Output,
} from '@angular/core';

@Component({
  selector: 'csd-filter-widget',
  templateUrl: './csd-filter-widget.component.html',
  styleUrls: ['./csd-filter-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdFilterWidgetComponent implements OnInit {
  @Input() title: string;
  @Output() close: EventEmitter<any> = new EventEmitter();
  constructor() {}

  ngOnInit() {}
}
