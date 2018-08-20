from PIL import Image, ImageOps
from io import BytesIO
import requests
from os import makedirs, path
import hashlib
import base36
from unscroll.settings import THUMBNAIL_SIZE, THUMBNAIL_DIR
from django.core.files.uploadedfile import InMemoryUploadedFile

class InboundThumbnail(object):
    
    def __init__(self, **kwargs):
        """
            
        """
        self.url = kwargs.get('url')
        self.content = kwargs.get('content')        
        self.sha1 = None
        self.width = None
        self.height = None
        self.image_location = None
        self.image_hash = None
        self.img_dir = None
        self.img_filename = None
        self.ufile = None

        if self.url is not None:
            self.create_from_web()
        else:
            self.create()
        
    def hash_image(self, o):
        img_hash = hashlib.sha1(o)
        img_hex = img_hash.hexdigest()
        img_int = int(img_hex, 16)
        img_36 = base36.dumps(img_int)
        img_dir = 'img/{}/{}'.format(img_36[0:2], img_36[2:4],)
        img_filename = "{}/{}.jpg".format(img_dir, img_36,)

        self.sha1 = img_36
        self.image_location = img_filename

        self.img_hash = img_36
        self.img_dir = img_dir
        self.img_filename = img_filename

    def create(self):
        try:
            img = Image.open(BytesIO(self.content))
            img.convert("RGBA")
            self.width, self.height = img.size
            thumb = img
            if self.width > THUMBNAIL_SIZE[0]:
                thumb = ImageOps.fit(img, THUMBNAIL_SIZE, centering=(0.0, 0.5))
                self.width, self.height = thumb.size
            self.hash_image(thumb.tobytes())

            d = '{}/{}'.format(THUMBNAIL_DIR, self.img_dir,)

            if not path.isdir(d):
                makedirs(d)
                
            thumb\
                .convert('RGB')\
                .save('{}/{}'
                      .format(THUMBNAIL_DIR, self.img_filename),
                      quality=80,
                      optimize=True,
                      progressive=True)
        except OSError as e:
            print('[thumbnail.py] OSError: {}'.format(e,))
            pass

        except FileExistsError as e:
            print('[thumbnail.py] FileExistsError: {}'.format(e,))
            pass

        except Exception as e:
            print('[thumbnail.py] Exception: {}'.format(e,))
            pass        
        
        
    def create_from_web(self):
        r = requests.get(self.url)
        self.content = r.content
        self.create()

