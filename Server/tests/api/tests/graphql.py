LOGIN_USER_MUTATION = '''
    mutation loginUser($input: LoginUserMutationInput!){
        loginUser(input: $input){token, error{id}}
    }
'''

UPDATE_USER_MUTATION = '''
    mutation updateUser($input: UpdateUserMutationInput!) {
      updateUser(input: $input) {
        user {
          id
          firstName
          lastName
          interests
          tags{
            totalCount
            edges{
              node{
                id
                name
              }
            }
          }
        }
        error {
          id
          message
        }
      }
    }
'''


UPDATE_ME_MUTATION = '''
    mutation updateMe($input: UpdateMeMutationInput!) {
      updateMe(input: $input) {
        user {
          id
          firstName
          lastName
          interests
          tags{
            totalCount
            edges{
              node{
                id
                name
              }
            }
          }
        }
        error {
          id
          message
        }
      }
    }
'''


CREATE_USER_MUTATION = '''
    mutation createUser($input: CreateUserMutationInput!) {
      createUser(input: $input) {
        user {
          id
          email
          tags{
            totalCount
            edges{
              node{
                id
                name
              }
            }
          }
        }
        error {
          id
          message
        }
      }
    }
'''

REGISTER_USER_MUTATION = '''
    mutation registerUser($input: RegisterUserMutationInput!) {
      registerUser(input: $input) {
        token
        user {
          id
        }
        error {
          id
        }
      }
    }
'''

QUERY_USER_BY_EMAIL = '''
    query user($email:String){
      allUsers(filter: {email: $email}){
        edges{
          node{
            id
          }
        }
        totalCount
      }
    }
'''


QUERY_USER_BY_ID = '''
    query GetUser($id: ID!) {
      user(id: $id) {
        id
        email
      }
    }

'''

QUERY_ALL_USER_TAGS = '''
    query userTagList($name_Istartswith: String) {
      allUserTags(filter: {name_Istartswith: $name_Istartswith}) {
        edges {
          node {
            id
            name
          }
        }
        totalCount
      }
    }
'''

ME_QUERY = '''
  query Me {
    me {
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
'''

# 
CREATE_TODO_MUTATION = '''
    mutation createTodo($input: CreateTodoMutationInput!) {
      createTodo(input: $input) {
        todo {
          id
          text
          isDone
          createdBy {
            id
          }
        }
        error {
          id
          message
        }
      }
    }
'''

DELETE_TODO_MUTATION = '''
    mutation deleteTodo($input: DeleteTodoMutationInput!) {
      deleteTodo(input: $input) {
        todo {
          isDone
          text
          id
        }
        error {
          id
          message
        }
      }
    }
'''

UPDATE_TODO_MUTATION = '''
    mutation updateTodo($input: UpdateTodoMutationInput!) {
      updateTodo(input: $input) {
        todo {
          isDone
          text
          id
        }
        error {
          id
          message
        }
      }
    }
'''

QUERY_ALL_USER_TODOS = '''
    query allUserTodos {
      me {
        ownedOrganisation {
          todos {
            edges {
              node {
                id
                createdBy {
                  id
                }
              }
            }
          }
        }
      }
    }
'''
# 

UPDATE_USER_PROFILE_IMAGE_MUTATION = '''
    mutation updateUser($input: UpdateUserMutationInput!) {
      updateUser(input: $input) {
        user{
          id
          profileImage
        }
        error{
          id
          message
        }
      }
    }
'''

DELETE_USER_MUTATION = '''
    mutation deleteUser($input: DeleteUserMutationInput!) {
      deleteUser(input: $input) {
        user {
          id
        }
        error {
          id
          message
        }
      }
    }
'''


QUERY_USER_PROFILE_PICTURE = '''
    query user($id: ID!){
      user(id: $id){
        id
        profileImage
      }
    }
'''
