import { loginDefaultUser } from '../support/utils';
import { getTodoPage } from '../support/login.po';
import {
  getDeleteButton,
  getConfirmDeleteButton,
  getEditButton,
  getAddTodoInput,
  getTodoItemText,
  getTodoItem,
  getEditTodoInput,
} from '../support/todo.po';

describe('Todo List', () => {
  beforeEach(() => {
    loginDefaultUser();
    cy.visit('/');
    // wait for the app to be loaded:
    getTodoPage();
  });

  it('should create todo', () => {
    const todoText = 'This needs to be done!';
    getAddTodoInput().type(todoText + '{enter}');
    getTodoItemText().contains(todoText);
  });

  it('should delete todo', () => {
    const todoText = 'This needs to be done!';
    getAddTodoInput().type(todoText + '{enter}');
    getTodoItemText()
      .contains(todoText)
      .parent()
      .within(() => getDeleteButton().click());
    getConfirmDeleteButton().click();
    getTodoItem().contains(todoText).should('not.exist');
  });

  it('should update todo', () => {
    const todoText = 'This needs to be done!';
    const newTodoText = 'This is updated text';

    getAddTodoInput().type(todoText + '{enter}');
    getTodoItemText()
      .contains(todoText)
      .parent()
      .within(() => {
        getEditButton().click();
        getEditTodoInput()
          .clear()
          .type(newTodoText + '{enter}');
      });
    getTodoItemText().contains(newTodoText).should('exist');
  });
});
