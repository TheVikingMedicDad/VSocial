export const getEmailField = () => cy.get('input[formcontrolname=email]');
export const getPasswordField = () => cy.get('input[formcontrolname=password]');
export const getLoginButton = () => cy.get('button.csd-login-button');
export const getDashboardComponent = (options?) => cy.get('csd-dashboard-component-page', options);
export const getGermanDashboardComponent = () =>
  cy.get('csd-main-layout[data-language="de"] csd-dashboard-component-page', { timeout: 10000 });
export const getUserMenuButton = () => cy.get('button.csd-user-menu-button');
export const getUserMenu = () => cy.get('div.mat-menu-content');
export const getAccountReminder = () => cy.get('csd-user-confirm-account-reminder');
export const accountReminderGermanText = 'Ihr Benutzerkonto';
export const getPlatformBrowser = () => cy.get('csd-main-layout[data-platform="BROWSER"]');
export const getUserListComponent = () => cy.get('csd-user-list');
export const getSnackBarMessage = () => cy.get('.csd-message');
// 
export const getTodoPage = (options?) => cy.get('.dta-todo-list-page', options);
// 
