import {
  // 
  getTodoPage,
  // 
  getPlatformBrowser
} from '../support/login.po';
import {
  getRegisterEmailField,
  getRegisterPasswordField,
  getRegisterSubmitButton,
  getRegisterTosCheckBox,
} from '../support/register.po';

describe('User Register', () => {
  beforeEach(() => {
    cy.visit('/signup');
    // wait for the app to be loaded:
    getPlatformBrowser();
  });

  it('should register a user', () => {
    const email = `test_${1000 + Math.floor(Math.random() * 20)}@example.com`;
    const pwd = '123456';
    getRegisterEmailField().type(email);
    getRegisterPasswordField().type(pwd);
    getRegisterTosCheckBox().check({ force: true });
    getRegisterSubmitButton().click();
    // 
    getTodoPage();
    // 
  });
});
