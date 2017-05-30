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

THUMBNAIL_SIZE = 256, 256
THUMBNAIL_DIR = '/Users/ford/dev/unscroll/unscroll/scrolls/static/scrolls/'
