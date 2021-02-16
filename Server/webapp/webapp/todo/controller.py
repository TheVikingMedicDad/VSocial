from webapp.core.models.organisation import Organisation
from webapp.todo.models import Todo


def create_todo(organisation: Organisation, text: str, is_done: bool):
    """
    This function actually triggers the Todo creation.

    :param organisation: Django admin Organisation instance
    :param text: str
    :param is_done: boolean
    :return:
    """

    return Todo.objects.create(text=text, is_done=is_done, created_by=organisation)
