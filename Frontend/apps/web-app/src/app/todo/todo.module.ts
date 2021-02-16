import { NgModule } from '@angular/core';
import { TodoListComponent } from './todo-list/todo-list.component';
import { TodoListPageComponent } from './todo-list-page/todo-list-page.component';
import { TodoAddComponent } from './todo-add/todo-add.component';
import { TodoItemComponent } from './todo-item/todo-item.component';
import { I18NextModule } from 'angular-i18next';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [TodoListPageComponent, TodoListComponent, TodoItemComponent, TodoAddComponent],
  imports: [
    SharedModule,
    // Translations
    I18NextModule,
    // Material Imports
    MatCheckboxModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
  ],
})
export class TodoModule {}
