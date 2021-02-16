class InvitationSystemError(Exception):
    pass


class HandlerAlreadyRegisteredError(Exception):
    pass


class NoHandlerForInvitationTypeError(Exception):
    pass


class InviteSelfNotPossibleError(Exception):
    """
    Is thrown when a user tries to create an Invitation to him/herself
    """


class InvitationNotPendingError(Exception):
    """
    When trying to e.g. cancel an already canceled/accepted invitation
    """
