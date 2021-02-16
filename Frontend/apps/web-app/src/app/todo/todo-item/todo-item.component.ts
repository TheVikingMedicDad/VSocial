import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { cloneDeep } from '@apollo/client/utilities';
import { Todo, TodoDeleteEvent } from '../todo.types';

@Component({
  selector: 'dta-todo-item',
  templateUrl: './todo-item.component.html',
  styleUrls: ['./todo-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoItemComponent {
  @Input() todoItem: Todo;
  @Output() deletedItem = new EventEmitter<TodoDeleteEvent>();
  @Output() savedItem = new EventEmitter<Todo>();

  editMode = false;

  changeTitle(text: string) {
    // change title will emit the change event with a new title
    // unless the title text is blank than we assume the user wants
    // to delete the todo.
    if (!text) {
      this.deletedItem.emit({ todo: this.todoItem, noConfirm: false });
      return;
    }

    let changedTodo = cloneDeep(this.todoItem);
    changedTodo.text = text;
    this.savedItem.emit(changedTodo);
    this.editMode = false;
  }

  changeCompleted(isDone: boolean) {
    // emits a change to the isDone state of a todo
    let changedTodo = cloneDeep(this.todoItem);
    changedTodo.isDone = isDone;
    this.savedItem.emit(changedTodo);
  }

  deleteItem(todoItem: Todo, event: any) {
    const noConfirm = event.ctrlKey || event.metaKey;
    this.deletedItem.emit({ todo: todoItem, noConfirm: noConfirm });
  }
}
