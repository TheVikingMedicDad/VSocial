from django.db import models

from webapp.core.models.base_model import BaseModel


class Address(BaseModel):
    country = models.CharField(blank=True, max_length=2)
    region = models.CharField(blank=True, max_length=100)
    address_line_1 = models.CharField(blank=True, max_length=100)
    address_line_2 = models.CharField(blank=True, max_length=100)
    zip_code = models.CharField(blank=True, max_length=10)
    city = models.CharField(blank=True, max_length=100)
