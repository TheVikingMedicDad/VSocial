import { gql } from '@apollo/client';

export const serverInfoQuery = gql`
  query ServerInfo {
    serverInfo {
      mainVersion
      projectVersion
      buildTime
    }
  }
`;
