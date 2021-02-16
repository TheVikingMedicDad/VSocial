import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { TodoListPageComponent } from './todo-list-page/todo-list-page.component';
import { TodoModule } from './todo.module';

const routes: Routes = [
  {
    path: '',
    canActivate: [],
    pathMatch: 'full',
    component: TodoListPageComponent,
  },
] as Routes;

@NgModule({
  declarations: [],
  imports: [TodoModule, RouterModule.forChild(routes)],
})
export class TodoRoutingModule {}
