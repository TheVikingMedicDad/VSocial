import { gql } from '@apollo/client';
export const allUserTodosQuery = gql`
  query allUserTodos(
    $orderBy: [String]
    $after: String
    $first: Int
    $before: String
    $last: Int
    $filter: TodoTypeFilterConnectionFilter
  ) {
    me {
      id
      ownedOrganisation {
        id
        todos(
          orderBy: $orderBy
          after: $after
          first: $first
          before: $before
          last: $last
          filter: $filter
        ) {
          totalCount
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
          edges {
            node {
              id
              isDone
              text
            }
          }
        }
      }
    }
  }
`;

export const createTodoMutation = gql`
  mutation createTodo($input: CreateTodoMutationInput!) {
    createTodo(input: $input) {
      todo {
        id
        text
        isDone
      }
      error {
        id
        message
      }
    }
  }
`;

export const updateTodoMutation = gql`
  mutation UpdateTodo($input: UpdateTodoMutationInput!) {
    updateTodo(input: $input) {
      todo {
        id
        text
        isDone
      }
      error {
        id
        message
      }
    }
  }
`;

export const deleteTodoMutation = gql`
  mutation deleteTodo($input: DeleteTodoMutationInput!) {
    deleteTodo(input: $input) {
      todo {
        id
        text
        isDone
      }
      error {
        id
        message
      }
    }
  }
`;

export const getTodoQuery = gql`
  query getTodo($id: ID!) {
    todo(id: $id) {
      id
      text
      isDone
    }
  }
`;
