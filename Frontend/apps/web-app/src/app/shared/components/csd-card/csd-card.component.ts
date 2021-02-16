import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  EventEmitter,
  Output,
  Input,
} from '@angular/core';

@Component({
  selector: 'csd-card',
  templateUrl: './csd-card.component.html',
  styleUrls: ['./csd-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdCardComponent implements OnInit {
  @Output() triggerDelete = new EventEmitter();
  @Output() triggerEdit = new EventEmitter();
  @Output() triggerMore = new EventEmitter();
  @Input() titleName: string;
  @Input() subtitleName: string;
  @Input() disabled: boolean;
  activeClass: string;
  disabledClass: string;

  constructor() {
    this.activeClass = '';
  }

  onClick() {
    // toggle active
    this.activeClass = this.activeClass === '' ? 'csd-active' : '';
    this.activeClass = this.disabled ? '' : this.activeClass;
  }

  delete() {
    this.triggerDelete.emit();
  }

  edit() {
    this.triggerEdit.emit();
  }

  more() {
    this.triggerMore.emit();
  }

  ngOnInit() {
    this.disabledClass = this.disabled ? 'csd-disabled' : '';
  }
}
