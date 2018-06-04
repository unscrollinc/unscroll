from PIL import Image, ImageOps
from io import BytesIO
import requests
from os import makedirs
import hashlib
import base36
from unscroll.settings_dev import THUMBNAIL_SIZE, THUMBNAIL_DIR

class ThumbnailProcessor:
    
    def __init__(self, url):
        """
            
        """
        self.source_url = url
        self.sha1 = None
        self.width = None
        self.height = None
        self.image_location = None
        
        if url is not None:
            self.perform_create()

    # def thumb(self, user):
    #     return (by_user=user,
    #                      sha1=this.sha1,
    #                      width=this.width,
    #                      height=this.height,
    #                      image_location=this.image_location,
    #                      source_url=this.source_url)
        
    def hash_image(self, o):
        img_hash = hashlib.sha1(o)
        img_hex = img_hash.hexdigest()
        img_int = int(img_hex, 16)
        img_36 = base36.dumps(img_int)
        img_dir = 'img/{}/{}'.format(img_36[0:2], img_36[2:4],)
        img_filename = "{}/{}.jpg".format(img_dir, img_36,)

        self.sha1 = img_36
        self.image_location = img_filename
        
        return {
            'img_hash': img_36,
            'img_dir': img_dir,
            'img_filename': img_filename
        }
        return self.location
    
    def create(self):
        r = requests.get(self.url)
        self.content = r.content
        img = Image.open(BytesIO(r.content))
        img.convert("RGBA")
        self.width, self.height = img.size

        thumb = img

        if self.width > THUMBNAIL_SIZE[0]:
            thumb = ImageOps.fit(img, THUMBNAIL_SIZE)
            self.width, self.height = thumb.size

        hashed = self.hash_image(thumb.tobytes())

        try:
            makedirs('{}/{}'.format(THUMBNAIL_DIR,
                                    hashed['img_dir'],))
            thumb\
                .convert('RGB')\
                .save('{}/{}'
                      .format(THUMBNAIL_DIR, hashed['img_filename']),
                      quality=50,
                      optimize=True,
                      progressive=True)

        except FileExistsError as e:
            print(e)
            pass
