import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CsdDataService } from '../../core/services/csd-data.service';
import { allUserTodosQuery } from '../todo.graphql';
import { Todo, TodoDeleteEvent } from '../todo.types';
import { CsdGqlDataSource } from '../../shared/datasource/csd-gql-data-source';
import { CsdSnackbarService } from '../../features/csd-snackbar/csd-snackbar.service';
import { TodoService } from '../todo.service';

@Component({
  selector: 'dta-todo-list-page',
  templateUrl: './todo-list-page.component.html',
  styleUrls: ['./todo-list-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoListPageComponent implements OnInit {
  dataSource: CsdGqlDataSource<Todo>;

  constructor(
    protected csdDataService: CsdDataService,
    protected csdSnackbarService: CsdSnackbarService,
    protected todoService: TodoService
  ) {
    // A datasource is an abstraction which lets you handle large quantities of data
    // in an easy way. It helps with filtering, sorting, and pagination.
    this.dataSource = new CsdGqlDataSource<Todo>({
      gqlQuery: allUserTodosQuery, // our todo list fetch query
      gqlQueryVariables: {},
      gqlItemsPath: 'me.ownedOrganisation.todos', // path in the query to the todo connection
      csdDataService, // the http link which uses apollo underneath
    });

    this.dataSource.connect();
  }

  ngOnInit(): void {}

  addTodo(title: string) {
    // Here we create a new todo. We use optimistic UI to get an enhanced UX which is extremely
    // responsive also on bad internet connections
    console.log('TodoListPageComponent.addTodo');

    if (!title) {
      // show an error in case the user doesn't provide a todo tile
      this.csdSnackbarService.error('MODEL.TODO.FORM.TEXT.ERROR.REQUIRED');
      return;
    }

    // here we use the create$ method of the todoService which returns an observable,
    // so don't forget to subscribe to it.
    this.todoService
      .create$(
        // the typed input
        { text: title },
        {
          // this is optionally but we need it for the opmistic UI to also update the our
          // datasource query which leads to an updated todolist locally although it is not
          // yet saved on the server. CsdGqlDataSource provides the optimisticUpdate
          // helper methods to keep it short.
          // For a detailed explanation see https://apollo-angular.com/docs/performance/optimistic-ui
          update: (store, mutationData) =>
            this.dataSource.optimisticUpdate(
              'create',
              this.todoService.modelName,
              store,
              mutationData
            ),
        }
      )
      .subscribe(
        (result) => {
          console.log('TodoListPageComponent.addTodo completed: ', result);
        },
        (error) => {
          console.error('TodoListPageComponent.addTodo failed: ', error);
          this.csdSnackbarService.error();
        }
      );
  }

  saveTodo(todo: Todo) {
    // very similar to the addTodo()
    console.log('TodoListPageComponent.saveTodo');
    this.todoService
      .update$(todo, {
        update: (store, mutationData) =>
          this.dataSource.optimisticUpdate(
            'update',
            this.todoService.modelName,
            store,
            mutationData
          ),
      })
      .subscribe(
        (result) => {
          console.log('TodoListPageComponent.saveTodo completed: ', result);
        },
        (error) => {
          console.error('TodoListPageComponent.saveTodo failed: ', error);
          this.csdSnackbarService.error();
        }
      );
  }

  deleteTodo(event: TodoDeleteEvent) {
    const todo = event.todo;
    const noConfirm = event.noConfirm;
    // and also very similar to the addTodo()
    console.log('TodoListPageComponent.deleteTodo');
    this.todoService
      .delete$(todo.id, {
        update: (store, mutationData) =>
          this.dataSource.optimisticUpdate(
            'delete',
            this.todoService.modelName,
            store,
            mutationData
          ),
        noConfirmationDialog: noConfirm,
      })
      .subscribe(
        (result) => {
          console.log('TodoListPageComponent.deleteTodo completed: ', result);
        },
        (error) => {
          console.error('TodoListPageComponent.deleteTodo failed: ', error);
          this.csdSnackbarService.error();
        }
      );
  }
}
