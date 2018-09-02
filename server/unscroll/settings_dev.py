"""
LOCAL Django settings for unscroll project.
"""

from unscroll.settings import *

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'unscroll',
        'USER': 'ford',
    }
}

STATIC_URL = '/static/'
STATIC_ROOT= '/Users/ford/dev/unscroll/server/scrolls/static/'
THUMBNAIL_DIR = '/Users/ford/dev/unscroll/server/scrolls/static/scrolls/'
DATA_UPLOAD_MAX_MEMORY_SIZE=4621440


DEBUG = True
