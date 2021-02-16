from django.utils.deprecation import MiddlewareMixin


class ApiCsrfMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if request.path.startswith('/api'):
            request.csrf_processing_done = True
