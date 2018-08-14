"""
Django settings for unscroll project.
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os

# SILKY_PYTHON_PROFILER = False

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.8/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'dw$b#f!l@s8r&)^yf1@69rfb7)atm@2aqv2zjj5)k!)kzf1ghj)'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

ALLOWED_HOSTS = ['localhost',
                 '127.0.0.1',
                 '159.65.184.27',
                 'unscroll.com',
                 'www.unscroll.com']

# Application definition

REST_SESSION_LOGIN = True

INSTALLED_APPS = (
    'scrolls.apps.ScrollsConfig',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    'django.contrib.postgres',
    'django_filters',
    'rest_framework',
    'rest_framework.authtoken',
    'djoser',    
    'rest_framework_swagger',    
    'corsheaders',
    'django_bleach',
    'silk'
)

REST_FRAMEWORK = {
    'DEFAULT_FILTER_BACKENDS':
    ('django_filters.rest_framework.DjangoFilterBackend',),
    'DEFAULT_PAGINATION_CLASS':
    'rest_framework.pagination.LimitOffsetPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',
    ],
}


MIDDLEWARE = (
    'silk.middleware.SilkyMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.security.SecurityMiddleware',
)

SWAGGER_SETTINGS = {
    'SECURITY_DEFINITIONS': {
        'api_key': {
            'type': 'apiKey',
            'in': 'header',
            'name': 'Authorization'
        }
    }
}

DJOSER = {
    'DOMAIN': '127.0.0.1',
    'SITE_NAME': 'Unscroll',
    'PASSWORD_RESET_CONFIRM_URL':'user/confirm/?uid={uid}&token={token}',
    'ACTIVATION_URL':'user/activate/{uid}/{token}',
    'SEND_ACTIVATION_EMAIL': True,
    'PASSWORD_VALIDATORS': [],
    'SERIALIZERS': {},
}

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.memcached.MemcachedCache',
        'LOCATION': '127.0.0.1:11211',
        'TIMEOUT':120
    }
}



CORS_ORIGIN_ALLOW_ALL = True
CORS_ALLOW_CREDENTIALS = True
CORS_ORIGIN_WHITELIST = (
    'localhost:3000',
)
CORS_ORIGIN_REGEX_WHITELIST = (
    'localhost:3000',
)

CORS_ALLOW_METHODS = (
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
)


DEFAULT_FROM_EMAIL='Unscroll'
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.mailgun.org'
EMAIL_PORT = 587
EMAIL_HOST_USER = 'postmaster@mail.unscroll.com'
EMAIL_SUBJECT_PREFIX='[Unscroll]'
EMAIL_HOST_PASSWORD = '40059d996780c47afd20e03f9959e7cc-8889127d-9d78525e'
EMAIL_USE_TLS = True

SITE_ID = 1
ROOT_URLCONF = 'unscroll.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates'), ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'django.template.context_processors.request',
            ],
        },
    },
]

WSGI_APPLICATION = 'unscroll.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'unscroll',
        'USER': 'unscroll',
    }
}

# Internationalization
# https://docs.djangoproject.com/en/1.8/topics/i18n/

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.8/howto/static-files/

STATIC_URL = '/django-static/'
STATIC_ROOT= '/home/unscroll/unscroll/unscroll/scrolls/django-static/'
THUMBNAIL_SIZE = 300,300
THUMBNAIL_DIR = '/home/unscroll/unscroll/unscroll/scrolls/img/'
DATA_UPLOAD_MAX_MEMORY_SIZE=4621440

BLEACH_ALLOWED_TAGS = ['p', 'b', 'i', 'u', 'em', 'strong']
BLEACH_ALLOWED_ATTRIBUTES = []
BLEACH_STRIP_TAGS = True
BLEACH_STRIP_COMMENTS = True



