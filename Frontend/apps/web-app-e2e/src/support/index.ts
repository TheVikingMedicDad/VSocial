// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';
import { loadTestRecords, restoreDb } from './utils';

before(function() {
  // runs once before all tests in the block
  loadTestRecords();
});

beforeEach(function() {
  // reset database state
  cy.log('Restore database...');
  restoreDb();
});

after(function() {
  // runs once after all tests in the block
  restoreDb();
  cy.log('Restore database...');
});
