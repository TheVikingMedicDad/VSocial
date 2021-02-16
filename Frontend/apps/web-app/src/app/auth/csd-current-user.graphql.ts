import { gql } from '@apollo/client/core';

export const exportUserListMutation = gql`
  mutation ExportUserList($input: ExportUserListMutationInput!) {
    exportUserList(input: $input) {
      clientMutationId
      file {
        absoluteUrl
        url
        name
      }
      error {
        id
        message
      }
    }
  }
`;

export const loginUserMutation = gql`
  mutation LoginUserMutation($input: LoginUserMutationInput!) {
    loginUser(input: $input) {
      token
      error {
        id
        message
      }
      clientMutationId
      user {
        id
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

export const meQuery = gql`
  query Me {
    me {
      id
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
`;

export const allUserTagsQuery = gql`
  query allUserTags {
    allUserTags {
      edges {
        node {
          id
          name
        }
      }
      totalCount
    }
  }
`;

export const logoutUserMutation = gql`
  mutation logoutUser($input: LogoutUserMutationInput!) {
    logoutUser(input: $input) {
      error {
        id
        message
      }
      clientMutationId
    }
  }
`;

export const registerUserMutation = gql`
  mutation registerUser($input: RegisterUserMutationInput!) {
    registerUser(input: $input) {
      error {
        id
        message
      }
      clientMutationId
      token
    }
  }
`;

export const confirmUserMutation = gql`
  mutation ConfirmUser($input: ConfirmUserMutationInput!) {
    confirmUser(input: $input) {
      error {
        id
        message
      }
      clientMutationId
    }
  }
`;

export const authCheckMutation = gql`
  mutation authCheckMe($input: AuthCheckMeMutationInput!) {
    authCheckMe(input: $input) {
      error {
        id
        message
      }
      clientMutationId
    }
  }
`;

export const updateMeMutation = gql`
  mutation updateMe($input: UpdateMeMutationInput!) {
    updateMe(input: $input) {
      clientMutationId
      error {
        id
        message
      }
      user {
        id
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

export const deleteMeMutation = gql`
  mutation deleteMe($input: DeleteMeMutationInput!) {
    deleteMe(input: $input) {
      error {
        id
        message
      }
      clientMutationId
    }
  }
`;
export const currentUserEmailChangeRequestMutation = gql`
  mutation RequestEmail($input: UserEmailChangeRequestMutationInput!) {
    emailRequest(input: $input) {
      clientMutationId
      error {
        id
        message
        data
      }
    }
  }
`;

export const currentUserConfirmEmailMutation = gql`
  mutation ConfirmEmail($input: UserConfirmEmailMutationInput!) {
    confirmEmail(input: $input) {
      clientMutationId
      error {
        id
        message
        data
      }
    }
  }
`;

export const resendAccountConfirmationEmailMutation = gql`
  mutation ResentSignup($input: UserResentSignupEmailConfirmRequestInput!) {
    resentSignupEmail(input: $input) {
      clientMutationId
      error {
        id
        message
        data
      }
    }
  }
`;

export const allUserFieldsFragment = gql`
  fragment AllUserFields on UserType {
    id
    email
    firstName
    lastName
    salutation
    country
    interests
    profileImage
    country
  }
`;

export const requestPasswordResetMutation = gql`
  mutation RequestPasswordResetMutation($input: RequestPasswordResetMutationInput!) {
    requestPasswordReset(input: $input) {
      error {
        id
        message
        data
      }
      user {
        ...AllUserFields
      }
      clientMutationId
    }
  }
  ${allUserFieldsFragment}
`;

export const resetPasswordMutation = gql`
  mutation ResetPasswordMutation($input: ResetPasswordMutationInput!) {
    resetPassword(input: $input) {
      error {
        id
        message
        data
      }
      user {
        ...AllUserFields
      }
      clientMutationId
    }
  }
  ${allUserFieldsFragment}
`;

export const changePasswordMutation = gql`
  mutation ChangePasswordMutation($input: ChangePasswordMutationInput!) {
    changePassword(input: $input) {
      error {
        id
        message
        data
      }
      user {
        ...AllUserFields
      }
      clientMutationId
    }
  }
  ${allUserFieldsFragment}
`;
