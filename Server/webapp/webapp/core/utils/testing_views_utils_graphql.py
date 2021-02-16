REGISTER_USER_MUTATION = '''
    mutation registerUser($input: RegisterUserMutationInput!) {
      registerUser(input: $input) {
        user {
          id
        }
        token
        error {
          id
          message
        }
      }
    }
'''

LOGIN_USER_MUTATION = '''
    mutation loginUser($input: LoginUserMutationInput!){
        loginUser(input: $input){token, error{id}}
    }
'''

UPDATE_USER_MUTATION = '''
    mutation updateUser($input: UpdateUserMutationInput!){
        updateUser(input: $input){ error{id, message}}
    }
'''

CONFIRM_USER_MUTATION = '''
    mutation confirmUser($input: ConfirmUserMutationInput!){
      confirmUser(input: $input){
        error{
          id
          message
        }
      }
    }
'''

CONFIRM_EMAIL_MUTATION = '''
    mutation confirmEmail($input: UserConfirmEmailMutationInput!) {
      confirmEmail(input: $input) {
        error {
          id
          message
        }
      }
    }
'''
