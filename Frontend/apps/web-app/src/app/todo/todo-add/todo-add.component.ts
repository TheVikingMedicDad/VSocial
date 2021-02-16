import { Component, OnInit, ChangeDetectionStrategy, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'dta-todo-add',
  templateUrl: './todo-add.component.html',
  styleUrls: ['./todo-add.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoAddComponent implements OnInit {
  constructor() {}
  @Output() addedTodo = new EventEmitter<string>();

  ngOnInit(): void {}
}
