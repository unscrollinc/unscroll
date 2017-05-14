import json
from baseconv import base36
from PIL import Image, ImageOps
from io import BytesIO
import requests
import hashlib
from os import makedirs
from os.path import exists
import config
import favicon
from urllib.parse import quote_plus


class UnscrollClient():
    api = None
    username = None
    password = None
    authentication_header = None
    scroll_url = None

    def __init__(self,
                 api=None,
                 username=None,
                 password=None):
        self.api = api
        self.username = username
        self.password = password

    def __batch__(self,
                  api=None,
                  username=None,
                  password=None,
                  scroll_title=None,
                  events=None):
        self.api = api
        self.username = username
        self.password = password

        if (scroll_title is not None and events is not None):
            self.login()
            scroll_url = self.create_scroll(scroll_title)
            print(scroll_url)
            for event in events:
                event['scroll'] = scroll_url
            chunks = [events[x:x+500] for x in range(0, len(events), 500)]
            for docs in chunks:
                res = self.create_event_batch(docs)
                print("Logged {}".format(res))

    def login(self):
        r = requests.post(self.api + '/rest-auth/login/',
                          json={'username': self.username,
                                'password': self.password})
        login = r.json()
        self.authentication_header = {'Authorization':
                                      'Token {}'.format(login.get('key'),)}
        return True

    def create_scroll(self, title,
                      public=True,
                      subtitle=None,
                      description=None,
                      thumbnail=None):

        r = requests.post(self.api + '/scrolls/',
                          headers=self.authentication_header,
                          json={'title': title,
                                'public': public,
                                'subtitle': subtitle,
                                'description': description,
                                'thumbnail': thumbnail})
        scroll = r.json()
        scroll_d = dict(scroll)
        print(scroll)
        print(scroll_d)
        self.scroll_url = scroll_d['url']
        return self.scroll_url

    def create_event_batch(self, events):
        print("Batching {} events.".format(len(events)))
        r = requests.post(self.api + '/events/',
                          headers=self.authentication_header,
                          json=events)
        return r.json()

    def create_event(self, event):
        event['scroll'] = self.scroll_url
        r = requests.post(self.api + '/events/',
                          headers=self.authentication_header,
                          data=event)
        return r

    def enhash(self, o):
        img_hash = hashlib.sha1(o)
        img_hex = img_hash.hexdigest()
        img_int = int(img_hex, 16)
        img_36 = base36.encode(img_int)
        img_dir = 'img/{}/{}'.format(img_36[0:2], img_36[2:4],)
        img_filename = "{}/{}.jpg".format(img_dir, img_36,)
        
        return {'img_hash': img_36,
                'img_dir': img_dir,
                'img_filename': img_filename}

    def fetch_favicon_url(self, url):
        favicon_url = favicon.get_favicon_url(url)
        return {'url': favicon_url,
                'title':url}
    
    def fetch_wiki_thumbnail_data(self, title=None):
        url = 'https://en.wikipedia.org/w/api.php?action=query'\
                '&titles={}&prop=pageimages&format=json&pithumbsize={}'\
                .format(title, config.WIKIPEDIA_THUMBNAIL_SIZE)
        r = requests.get(url)
        j = r.json()
        try:
            for k in j['query']['pages'].keys():
                thumb = j['query']['pages'][k]['thumbnail']
                return {'url': thumb['source'],
                        'title': title,
                        'width': thumb['width'],
                        'height': thumb['height']}
        except KeyError:
            return None

    def cache_thumbnail(self, url):
        print(self.api + '/thumbnails/')
        r = requests.post(self.api + '/thumbnails/',
                          headers=self.authentication_header,
                          data={'source_url':url})
        print(r.status_code, r)
        
        if r.status_code == 500:
            return None
        
        if r.status_code == 400:
            j = r.json()
            if 'source_url' in j:
                if j['source_url'][0] == 'thumbnail with this source url already exists.':
                    r2 = requests.get(self.api + '/thumbnails?source_url=' + quote_plus(url))
                    d = r2.json()
                    if (len(d['results']) > 0):
                        return d['results'][0]
            return None
        
        return r.json()                                


