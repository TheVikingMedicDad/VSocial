import { getTestRecord } from '../support/utils';
import {
  accountReminderGermanText,
  getAccountReminder,
  getDashboardComponent,
  getEmailField,
  getGermanDashboardComponent,
  getLoginButton,
  getPasswordField,
  getPlatformBrowser,
  getSnackBarMessage,
  getUserListComponent,
  getUserMenu,
  getUserMenuButton,
  // 
  getTodoPage,
  // 
} from '../support/login.po';

describe('User Login', () => {
  beforeEach(() => {
    cy.visit('/');
    // wait for the app to be loaded:
    getPlatformBrowser();
  });

  it('should login with default user', () => {
    getEmailField().type(getTestRecord('users.1.username'));
    getPasswordField().type(getTestRecord('users.1.password'));
    getLoginButton().click();
    // 
    getTodoPage();
    // 
  });

  it('should login the german user', () => {
    getEmailField().type(getTestRecord('users.4.username'));
    getPasswordField().type(getTestRecord('users.4.password'));
    getLoginButton().click();
    getPlatformBrowser();
    // 
    getTodoPage();
    // 
  });

  it('Invalid credentials error message', () => {
    getEmailField().type(getTestRecord('users.1.username'));
    const wrongPassword = getTestRecord('users.1.password') + 'wrong';
    getPasswordField().type(wrongPassword);
    getLoginButton().click();
    getPlatformBrowser();
    getSnackBarMessage().contains('E-mail address or password is wrong.');
  });
});

describe('User Login with target redirect', () => {
  beforeEach(() => {
    cy.visit('/admin/user-management/list/');
    // wait for the app to be loaded:
    getPlatformBrowser();
  });

  it('should login the admin user and go to saved target', () => {
    getEmailField().type(getTestRecord('users.0.username'));
    getPasswordField().type(getTestRecord('users.0.password'));
    getLoginButton().click();
    // check if we are at the user management page:
    getUserListComponent();
    // check if we have access to the Admin Menu:
    getUserMenuButton().click();
    getUserMenu().contains('Admin');
  });
});
