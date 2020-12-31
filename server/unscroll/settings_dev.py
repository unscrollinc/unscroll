"""
LOCAL Django settings for unscroll project.
"""

from unscroll.settings import *

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'postgres',
        'USER': 'postgres',
        'PASSWORD': 'testing',
        'HOST': '172.17.0.1'
    }
}

STATIC_URL = '/static/'
STATIC_ROOT= '/unscroll/server/scrolls/static/'
THUMBNAIL_DIR = '/unscroll/server/scrolls/static/scrolls/'
DATA_UPLOAD_MAX_MEMORY_SIZE=4621440


DEBUG = True
