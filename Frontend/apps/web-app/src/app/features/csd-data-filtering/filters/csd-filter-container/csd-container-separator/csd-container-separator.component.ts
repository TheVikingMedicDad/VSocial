import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnChanges,
  SimpleChanges,
  SimpleChange,
  ChangeDetectorRef,
} from '@angular/core';
import { LogicalFilterOperator } from '../../../csd-data-filtering.constants';

@Component({
  selector: 'csd-container-separator',
  templateUrl: './csd-container-separator.component.html',
  styleUrls: ['./csd-container-separator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdContainerSeparatorComponent implements OnInit {
  _currentOperator = LogicalFilterOperator.AND;
  logicalFilterOperator = LogicalFilterOperator;
  @Output() operatorChanged: EventEmitter<LogicalFilterOperator> = new EventEmitter();

  @Input()
  set currentOperator(operator: LogicalFilterOperator) {
    this._currentOperator = operator;
    this.changeDetectorRef.markForCheck();
  }

  constructor(public changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit() {}

  changeOperator() {
    const newOperator =
      this._currentOperator === LogicalFilterOperator.AND
        ? LogicalFilterOperator.OR
        : LogicalFilterOperator.AND;
    this.operatorChanged.emit(newOperator);
  }
}
