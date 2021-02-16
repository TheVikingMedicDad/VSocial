import { loginDefaultUser } from '../support/utils';
import { getFirstNameField, getSaveButton } from '../support/account-settings.po';

describe('Account settings', () => {
  beforeEach(() => {
    loginDefaultUser();
    cy.visit('/account');
  });

  it('should update user info', () => {
    const updateName = 'UpdatedFirstName';
    getFirstNameField().clear();
    getFirstNameField().type(updateName);
    getSaveButton().click();
    const successMessage = 'User settings saved.';
    cy.get('.csd-message').contains(successMessage).should('exist');
  });
});
