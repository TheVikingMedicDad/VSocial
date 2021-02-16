from storages.backends.s3boto3 import S3Boto3Storage  # noqa E402

StaticRootS3BotoStorage = lambda: S3Boto3Storage(location='static')  # noqa
MediaRootS3BotoStorage = lambda: S3Boto3Storage(location='media', file_overwrite=False)  # noqa
