import { gql } from '@apollo/client';

export const getOrganisationQuery = gql`
  query getOrganisation($id: ID!) {
    organisation(id: $id) {
      id
      created
      updated
      name
      owner {
        id
      }
    }
  }
`;
