# inspired by https://medium.com/@bencleary/using-enums-as-django-model-choices-96c4cbb78b2e
class ChoicesMixin:
    @classmethod
    def choices(cls):
        return [(key.value, key.name) for key in cls]
