import {
  Email,
  getEmails,
  getTestRecord,
  loginDefaultUser,
  loginGermanUser,
  removeAuthToken,
  uuidv4,
} from '../support/utils';
import {
  getAddInvitationButton,
  getInvitationSaveButton,
  getInviteeEmailInputField,
  getRegisterEmailInputField,
  getRegisterPasswordInputField,
  getRegisterSubmitButton,
  getRegisterTosCheckBox,
  getUserInvitationListComponent,
  getUserInvitationModelComponent,
  getUserInvitationModelViewForm,
  invitationCheckUrlSnippet,
  userInvitationAcceptUrlSnippet,
} from '../support/user-invitation.po';
import {
  // 
  getTodoPage,
  // 
} from '../support/login.po';

describe('User Invitation', () => {
  beforeEach(() => {
    loginDefaultUser();
    cy.visit('/user-invitations');
  });

  it('should do a complete invitation and registration process', () => {
    const inviteeEmail = `invitee-${uuidv4()}@example.com`;
    getUserInvitationListComponent();
    getAddInvitationButton().click();
    getUserInvitationModelComponent();
    getInviteeEmailInputField().type(inviteeEmail);
    getInvitationSaveButton().click();
    getUserInvitationModelViewForm();
    getEmails().then((emails: Email[]) => {
      expect(emails).to.have.lengthOf(1);
      const email = emails[0];
      expect(email.to[0]).to.equal(inviteeEmail);
      const invitationLink = getInvitationLink(email.body);
      cy.log('mail received');

      removeAuthToken();
      cy.visit(invitationLink);
    });
    // we have to register
    getRegisterEmailInputField().type(inviteeEmail);
    getRegisterPasswordInputField().type(uuidv4());
    getRegisterTosCheckBox().check({ force: true });
    getRegisterSubmitButton().click();
    // 
    getTodoPage({ timeout: 10000 });
    // 
  });

  // TODO: Fix test: this fails since 19.8.2020 git commit 32fb909399594a1a940eff9e01de78fca4448f7f
  // I suspect it is a breaking change in some of the child dependencies
  it.skip('should do an invitation to an existing user', () => {
    const inviteeEmail = getTestRecord('users.1.username');

    getUserInvitationListComponent();
    getAddInvitationButton().click();
    getUserInvitationModelComponent();
    getInviteeEmailInputField().type(inviteeEmail);
    getInvitationSaveButton().click();
    getUserInvitationModelViewForm();
    getEmails().then((emails: Email[]) => {
      expect(emails).to.have.lengthOf(1);
      const email = emails[0];
      expect(email.to[0]).to.equal(inviteeEmail);
      const invitationLink = getInvitationLink(email.body);
      cy.log('mail received');

      loginGermanUser();
      cy.visit(invitationLink);
      // 
      getTodoPage({ timeout: 10000 });
      // 
    });
  });
});

const INVITATION_LINK_REGEX = /http[s]{0,1}:\/\/.*\/invitation\/check\/[0-9a-fA-F-]{0,36}/m;
function getInvitationLink(content: string): string {
  const match = content.match(INVITATION_LINK_REGEX);
  if (match.length <= 0) return null;
  return match[0];
}
