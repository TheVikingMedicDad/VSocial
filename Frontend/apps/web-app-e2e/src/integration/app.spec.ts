import { getGreeting } from '../support/app.po';

describe('web-app', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    getGreeting().contains('Login in to');
  });
});
