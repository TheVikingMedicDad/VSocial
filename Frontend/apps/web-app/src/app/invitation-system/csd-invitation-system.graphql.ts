import { gql } from '@apollo/client';

export const allInvitationFieldsFragment = gql`
  fragment AllInvitationFields on InvitationType {
    id
    created
    expires
    inviteeEmail
    state
    invitationType
    message
    payload
  }
`;

export const getInvitationQuery = gql`
  query Invitation($id: ID) {
    invitation(id: $id) {
      ...AllInvitationFields
    }
  }
  ${allInvitationFieldsFragment}
`;

export const getInvitationByTokenQuery = gql`
  query Invitation($token: String) {
    invitation(token: $token) {
      ...AllInvitationFields
      isValid
      invalidReason
      acceptPage
    }
  }
  ${allInvitationFieldsFragment}
`;

export const createInvitationMutation = gql`
  mutation CreateInvitation($input: CreateInvitationMutationInput!) {
    createInvitation(input: $input) {
      error {
        id
        message
        data
      }
      invitation {
        ...AllInvitationFields
      }
    }
  }
  ${allInvitationFieldsFragment}
`;

export const acceptInvitationMutation = gql`
  mutation AcceptInvitation($input: AcceptInvitationMutationInput!) {
    acceptInvitation(input: $input) {
      error {
        id
        message
        data
      }
      invitation {
        ...AllInvitationFields
      }
    }
  }
  ${allInvitationFieldsFragment}
`;

export const cancelInvitationMutation = gql`
  mutation CancelInvitation($input: CancelInvitationMutationInput!) {
    cancelInvitation(input: $input) {
      error {
        id
        message
        data
      }
      invitation {
        ...AllInvitationFields
      }
    }
  }
  ${allInvitationFieldsFragment}
`;

export const allMyInvitations = gql`
  query AllMyInvitations(
    $orderBy: [String]
    $after: String
    $first: Int
    $before: String
    $last: Int
  ) {
    me {
      id
      invitations(orderBy: $orderBy, after: $after, first: $first, before: $before, last: $last) {
        totalCount
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        edges {
          node {
            ...AllInvitationFields
          }
        }
      }
    }
  }
  ${allInvitationFieldsFragment}
`;
