ALL_INVITATION_FIELDS_FRAGMENT = """
  fragment AllInvitationFields on InvitationType {
    id
    created
    updated
    expires
    inviteeEmail
    state
    invitationType
    message
    payload
  }
"""

CREATE_INVITATION_MUTATION = (
    """
  mutation createInvitation($input: CreateInvitationMutationInput!) {
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
"""
    + ALL_INVITATION_FIELDS_FRAGMENT
)

ACCEPT_INVITATION_MUTATION = (
    """
  mutation acceptInvitation($input: AcceptInvitationMutationInput!) {
    acceptInvitation(input: $input) {
      error {
        id
        message
        data
      }
      invitation{
        ...AllInvitationFields
      }
    }
  }
"""
    + ALL_INVITATION_FIELDS_FRAGMENT
)

CANCEL_INVITATION_MUTATION = """
  mutation cancelInvitation($input: CancelInvitationMutationInput!) {
    cancelInvitation(input: $input) {
      error {
        id
        message
        data
      }
    }
  }
"""

REJECT_INVITATION_MUTATION = """
  mutation rejectInvitation($input: RejectInvitationMutationInput!) {
    rejectInvitation(input: $input) {
      error {
        id
        message
        data
      }
    }
  }
"""

RESEND_INVITATION_MUTATION = (
    """
  mutation resendInvitation($input: ResendInvitationMutationInput!) {
    resendInvitation(input: $input) {
      error {
        id
        message
        data
      }
      invitation{
        ...AllInvitationFields
      }
    }
  }
"""
    + ALL_INVITATION_FIELDS_FRAGMENT
)

QUERY_INVITATION_BY_TOKEN = (
    """
    query Invitation($token: String){
      invitation(token: $token){
        ...AllInvitationFields
        isValid
        acceptPage
        invalidReason
      }
    }
    """
    + ALL_INVITATION_FIELDS_FRAGMENT
)

QUERY_INVITATION_BY_ID = (
    """
    query Invitation($id: ID){
      invitation(id: $id){
        ...AllInvitationFields
      }
    }
    """
    + ALL_INVITATION_FIELDS_FRAGMENT
)
