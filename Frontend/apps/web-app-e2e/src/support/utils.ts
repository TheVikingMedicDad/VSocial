/// <reference types="cypress" />

export function getServerUrl() {
  return '';
}

export function getApiUrl() {
  return `${getServerUrl()}/api/graphql/`;
}

export function restoreDb() {
  cy.request({
    url: `${getServerUrl()}/api/testing/restore-testing-env/`,
    failOnStatusCode: true,
  });
}

export function getEmails() {
  return cy
    .request({
      url: `${getServerUrl()}/api/testing/emails/`,
      failOnStatusCode: true,
    })
    .then((response) => {
      console.log(response.body);
      const data = response.body;
      return data as Email[];
    });
}

export interface Email {
  to: string[];
  cc: string[];
  bcc: string[];
  replyTo: string;
  fromEmail: string;
  subject: string;
  body: string;
}

export function loadTestRecords() {
  cy.request({
    url: `${getServerUrl()}/api/testing/testing-record-settings/`,
    failOnStatusCode: true,
  }).then((response) => {
    console.log('#### TestRecordBody: ', response.body);
    const testingRecords = response.body;
    Cypress.env('CSD_TESTING_RECORDS', testingRecords);
  });
}

export function getTestRecord(path: string) {
  //return Cypress.env(key);
  const testingRecords = Cypress.env('CSD_TESTING_RECORDS');
  const keys = path.split('.');
  console.log('#### TestRecordPath: ', path);
  let tmpResult = testingRecords;
  for (const key of keys) {
    tmpResult = tmpResult[key];
  }
  return tmpResult;
}

const loginUserMutation = `
  mutation LoginUserMutation($input: LoginUserMutationInput!) {
    loginUser(input: $input) {
      token
      error {
        id
        message
      }
      clientMutationId
      user {
        username
        firstName
        lastName
        registrationCompleted
        emailVerified
        email
        salutation
        interests
        language
        country
        groups
        permissions
      }
    }
  }
`;

/**
 * Logs in a user via an API call and sets the localStorage authtoken
 */
export function loginUser(email, password): void {
  cy.request({
    url: getApiUrl(),
    method: 'POST',
    body: {
      query: loginUserMutation,
      variables: {
        input: {
          email: email,
          password: password,
        },
      },
    },
  }).then((res) => {
    const gqlData = res.body.data.loginUser;
    expect(gqlData.error).to.equal(null);
    window.localStorage.setItem('authtoken', gqlData.token);
  });
}

export function loginDefaultUser(): void {
  loginUser(getTestRecord('users.1.username'), getTestRecord('users.1.password'));
}

export function loginGermanUser(): void {
  loginUser(getTestRecord('users.4.username'), getTestRecord('users.4.password'));
}

export function removeAuthToken(): void {
  window.localStorage.removeItem('authtoken');
}

export function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
