/// <reference types="cypress" />

export const getUserInvitationListComponent = () => cy.get('csd-user-invitation-list');
export const getAddInvitationButton = () => cy.get('button.csd-add-button');
export const getUserInvitationModelComponent = () => cy.get('csd-user-invitation-model');
export const getUserInvitationModelViewForm = () =>
  cy.get('csd-user-invitation-model form.mode-view');

export const getInviteeEmailInputField = () => cy.get('input[formcontrolname=inviteeEmail]');
export const getInvitationSaveButton = () =>
  cy.get('csd-user-invitation-model button.csd-add-button');

export const getRegisterEmailInputField = () => cy.get('input[formcontrolname=email]');
export const getRegisterPasswordInputField = () => cy.get('input[formcontrolname=password]');
export const getRegisterTosCheckBox = () => cy.get('input[type="checkbox"]');
export const getRegisterSubmitButton = () => cy.get('button.csd-register-button');
export const invitationCheckUrlSnippet = '/invitation/check/';
export const userInvitationAcceptUrlSnippet = '/user-invitations/accept/';
