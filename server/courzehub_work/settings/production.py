import os

from datetime import timedelta

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['work.azwgroup.com']
CORS_ORIGIN_WHITELIST = ('https://work.azwgroup.com',)


# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ['SECRET_KEY']


# Database
# https://docs.djangoproject.com/en/3.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ['DB_NAME_COURZEHUB_WORK'],
        'USER': os.environ['DB_USER'],
        'PASSWORD': os.environ['DB_USER_PASSWORD'],
        'HOST': os.environ['DB_HOST']
    }
}

# not working when email is in environment, to be solved later
# EMAIL_HOST_USER = os.environ['EMAIL_HOST_USER']
# not working when email password is in environment, to be solved later
# EMAIL_HOST_PASSWORD = os.environ['EMAIL_HOST_PASSWORD']
EMAIL_HOST_USER = 'noreply.courzehub@gmail.com'
EMAIL_HOST_PASSWORD = 'sousapzoqsbqymoa'

#  AWS settings for media files

AWS_ACCESS_KEY_ID = os.environ['AWS_ACCESS_KEY_ID']
AWS_SECRET_ACCESS_KEY = os.environ['AWS_SECRET_ACCESS_KEY']
AWS_STORAGE_BUCKET_NAME = os.environ['AWS_STORAGE_BUCKET_NAME_COURZEHUB_WORK']
AWS_S3_FILE_OVERWRITE = False
AWS_DEFAULT_ACL = None
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'


# JWT SETTINGS
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=2),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': os.environ['TOKEN_GENERATION_SECRET'],
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'JTI_CLAIM': 'jti',
    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',
    'SLIDING_TOKEN_LIFETIME': timedelta(minutes=5),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=1),
}


# retain these even in development environment since at times we need the live pesapal to test transaction completion
PESAPAL_DEMO = False
if PESAPAL_DEMO == True:
    PESAPAL_CONSUMER_KEY = os.environ['PESAPAL_CONSUMER_KEY_DEMO']
    PESAPAL_CONSUMER_SECRET = os.environ[
        'PESAPAL_CONSUMER_SECRET_DEMO']
else:
    PESAPAL_CONSUMER_KEY = os.environ[
        'PESAPAL_CONSUMER_KEY_PRODUCTION']
    PESAPAL_CONSUMER_SECRET = os.environ[
        'PESAPAL_CONSUMER_SECRET_PRODUCTION']
