from django import db
from django.db.transaction import get_connection


class CloseBrokenDbMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            with db.transaction.get_connection().cursor() as cursor:
                cursor.execute('SELECT 1')
        except db.OperationalError:
            db.connections.close_all()
            # django is initializing the db connections now

        response = self.get_response(request)
        return response
