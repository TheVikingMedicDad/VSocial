/// <reference types="cypress" />

export const getRegisterEmailField = () => cy.get('input[formcontrolname=email]');
export const getRegisterPasswordField = () => cy.get('input[formcontrolname=password]');
export const getRegisterTosCheckBox = () => cy.get('input[type="checkbox"]');
export const getRegisterSubmitButton = () => cy.get('button.csd-register-button');
