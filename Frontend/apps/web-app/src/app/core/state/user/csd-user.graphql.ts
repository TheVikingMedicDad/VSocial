import { gql } from '@apollo/client';
import { allUserFieldsFragment } from '../../../auth/csd-current-user.graphql';

export const allUserManagementUserFieldsFragment = gql`
  fragment AllUserManagementUserFields on UserType {
    ...AllUserFields
    tags {
      edges {
        node {
          id
          name
        }
      }
      totalCount
    }
  }
  ${allUserFieldsFragment}
`;

export const createUserMutation = gql`
  mutation CreateUser($input: CreateUserMutationInput!) {
    createUser(input: $input) {
      clientMutationId
      user {
        ...AllUserManagementUserFields
      }
      error {
        id
        message
        data
      }
    }
  }
  ${allUserManagementUserFieldsFragment}
`;

export const updateUserMutation = gql`
  mutation UpdateUser($input: UpdateUserMutationInput!) {
    updateUser(input: $input) {
      clientMutationId
      user {
        ...AllUserManagementUserFields
      }
      error {
        id
        message
        data
      }
    }
  }
  ${allUserManagementUserFieldsFragment}
`;

export const deleteUserMutation = gql`
  mutation DeleteUser($input: DeleteUserMutationInput!) {
    deleteUser(input: $input) {
      clientMutationId
      user {
        ...AllUserFields
      }
      error {
        id
      }
    }
  }
  ${allUserFieldsFragment}
`;

export const getUserQuery = gql`
  query getUser($id: ID!) {
    user(id: $id) {
      ...AllUserManagementUserFields
    }
  }
  ${allUserManagementUserFieldsFragment}
`;
