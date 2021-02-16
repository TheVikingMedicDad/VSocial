import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { CsdGqlDataSource } from '../../shared/datasource/csd-gql-data-source';
import { UnsubscribeBaseComponent } from '../../shared/unsubscribe-base.component';
import { Todo, TodoDeleteEvent } from '../todo.types';

@Component({
  selector: 'dta-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoListComponent extends UnsubscribeBaseComponent implements OnInit {
  @Input() dataSource: CsdGqlDataSource<Todo>;
  @Output() deletedItem = new EventEmitter<TodoDeleteEvent>();
  @Output() savedItem = new EventEmitter<Todo>();

  ngOnInit() {}
}
