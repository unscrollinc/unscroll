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
import pprint
import re
import pathlib

class UnscrollClient():
    authentication_header = None
    user_url = None

    def __init__(self,
                 api='http://127.0.0.1:8000',
                 username='ford',
                 password='***REMOVED***'):
        self.api = api
        self.username = username
        self.password = password
        self.login()

    def __batch__(self,
                  thumbnail=None,                  
                  scroll_title=None,
                  events=[]):

        if (scroll_title is not None):
            self.login()
            scroll = self.create_or_retrieve_scroll(scroll_title, thumbnail=thumbnail)
            for event in events:
                event['in_scroll'] = scroll
            chunks = [events[x:x+500] for x in range(0, len(events), 500)]
            for docs in chunks:
                res = self.create_event_batch(docs, scroll)
                print("Logged {}".format(res))

    def login(self):
        r = requests.post(self.api + '/auth/login/',
                          json={'username': self.username,
                                'password': self.password})
        login = r.json()

        self.authentication_header = {'Authorization':
                                      'Token {}'.format(login.get('auth_token'),)}
        
        return True

    def create_or_retrieve_scroll(self,
                                  title,
                                  public=True,
                                  subtitle='',
                                  description='',
                                  thumbnail=None):

        r = requests.post(self.api + '/scrolls/',
                          headers=self.authentication_header,
                          json={'title': title,
                                'is_public': public,
                                'subtitle': subtitle,
                                'description': description,
                                'with_thumbnail': thumbnail})
        
        if r.status_code == 200:
            scroll_d = dict(r.json())
            return scroll_d['url']
        else:
            r = requests.get(self.api + '/scrolls/?title=' + quote_plus(title),
                             headers=self.authentication_header,)
            results = r.json()['results']
            if (len(results) > 0):
                scroll_d = dict(results[0])
                return scroll_d['url']

    def delete_scroll_with_title(self, title):
        r = requests.get(self.api + '/scrolls/?title=' + quote_plus(title),
                             headers=self.authentication_header,)        
        
        if r.status_code == 200:
            j = r.json()['results'][0]
            r = requests.delete(j['url'],
                                headers=self.authentication_header)
            
            return True

        else:
            return r.results

    def create_event_batch(self, events, scroll):
        print("Batching {} events in scroll {} with url {}.".format(
            len(events), self, scroll,))
        r_events = []
        for event in events:
            event['in_scroll'] = scroll
            r_events.append(event)
        r = requests.post(self.api + '/events/',
                          headers=self.authentication_header,
                          json=r_events)
        return r.json()

    def create_event(self, event, scroll):
        event['in_scroll'] = scroll
        r = requests.post(self.api + '/events/',
                          headers=self.authentication_header,
                          data=event)
        return r

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

    def post_thumbnail(self, file_name):
        r = requests.post(self.api + '/thumbnails/upload/',
                          headers=self.authentication_header,
                          files={'file': open(file_name, 'rb')})
        return r.json()

    def cache_local(self, url):
        image = re.sub(r'https?://','',url)
        local = 'cache/image/{}'.format(image)

        found = False
        
        try:
            f = open(local, 'r')
            f.close()
            found = True
            return local
        
        except FileNotFoundError as e:
            try:
                r = requests.get(url)
                p = pathlib.Path(local)
                p.parent.mkdir(parents=True, exist_ok=True) 
                f = open(local, 'wb')
                f.write(r.content)
                f.close()
                return local
            
            except ConnectionError as e:
                print('[unscroll.py] ConnectionError: {}'.format(e,))

        

    def cache_thumbnail(self, url):
        r = requests.post(self.api + '/thumbnails/cache/',
                          headers=self.authentication_header,
                          data={'url': url})

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
            return r.content

        return r.json()
