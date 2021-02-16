import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { Location } from '@angular/common';
import { UnsubscribeBaseComponent } from '../../unsubscribe-base.component';
import { CrudMode } from '../../../core/core.types';

@Component({
  selector: 'csd-crud-header',
  templateUrl: './csd-crud-header.component.html',
  styleUrls: ['./csd-crud-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdCrudHeaderComponent extends UnsubscribeBaseComponent implements OnInit {
  @Input() mode: CrudMode;
  @Input() title: string;
  @Output() save = new EventEmitter<null>();
  @Output() cancel = new EventEmitter<null>();
  @Output() edit = new EventEmitter<null>();
  @Output() destroy = new EventEmitter<null>();
  crudModes = CrudMode;

  constructor(private changeDetectorRef: ChangeDetectorRef, private _location: Location) {
    super();
  }

  ngOnInit() {}

  back() {
    //TODO: make this an output and from the there an action
    this._location.back();
  }
}
