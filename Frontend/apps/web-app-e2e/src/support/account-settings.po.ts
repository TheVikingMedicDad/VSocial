/// <reference types="cypress" />

export const getFirstNameField = () => cy.get('input[formcontrolname=firstName]');
export const getSaveButton = () => cy.get('button#save-user-settings');
