import json
from baseconv import base36
from PIL import Image, ImageOps
from io import BytesIO
import requests
import hashlib
from os import makedirs
from os.path import exists
import favicon
from urllib.parse import quote_plus
import pprint
import re
import pathlib
import hashlib

class UnscrollClient():
    authentication_header = None
    user_url = None
    
    def __init__(self,
                 api='http://127.0.0.1:8000/api',
                 username='ford',
                 password='***REMOVED***'):
        self.api = api
        self.session = requests.Session()
        self.username = username
        self.password = password
        self.login()

    def __batch__(self,
                  scroll_title=None,
                  subtitle='',                                  
                  public=True,
                  description='',
                  link='',
                  citation='',
                  with_thumbnail=None,            
                  events=[]):

        if (scroll_title is not None):
            self.login()
            scroll = self.create_or_retrieve_scroll(scroll_title,
                                                    subtitle=subtitle,
                                                    public=public,
                                                    description=description,
                                                    link=link,
                                                    citation=citation,
                                                    with_thumbnail=with_thumbnail)
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
                                  subtitle='',                                  
                                  public=True,
                                  description='',
                                  link='',
                                  citation='',
                                  with_thumbnail=None):
        ask = {'title': title,
               'is_public': public,
               'citation': citation,
               'subtitle':subtitle,
               'link': link,
               'description': description,
               'with_thumbnail': with_thumbnail}
        
        pprint.pprint(ask)
        r = requests.post(self.api + '/scrolls/',
                          headers=self.authentication_header,
                          json=ask)

        if r.status_code == 200:
            scroll_d = dict(r.json())
            return scroll_d['url']

        else:
            r2 = requests.get(self.api
                             + '/scrolls/?by_user='
                             + self.username
                             + '&title='
                             + quote_plus(title),
                             headers=self.authentication_header,)
            results = r2.json()['results']
            if (len(results) > 0):
                scroll_d = dict(results[0])
                return scroll_d.get('url')

    def delete_scroll_with_title(self, title):
        r = requests.get(self.api + '/scrolls/?title=' + quote_plus(title),
                             headers=self.authentication_header,)        
        
        if r.status_code == 200:
            rj = r.json()
            if len(rj['results']) > 0:
                j = rj['results'][0]
                r = requests.delete(j['url'], headers=self.authentication_header)
            
            return True

        else:
            return r.results

    def create_event_batch(self, events, scroll):
        print("Batching {} events in scroll {} with url {}.".format(
            len(events), self, scroll,))
        r_events = []
        for event in events:
            event['in_scroll'] = scroll
            self.create_event(self, event, scroll)


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
        url = 'https://en.wikipedia.org/api/rest_v1/page/summary/{}'\
                .format(title)
        r = self.session.get(url)
        j = r.json()
        try:
            if 'thumbnail' in j:
                thumb = j['thumbnail']
                return {'url': thumb['source'],
                        'title': title,
                        'width': thumb['width'],
                        'height': thumb['height']}
        except KeyError:
            return None

    def post_thumbnail(self, file_name):
        try:
            r = requests.post(self.api + '/thumbnails/upload/',
                              headers=self.authentication_header,
                              files={'file': open(file_name, 'rb')})
            return r.json()
        except Exception as e:
            print('Exception: {}'.format(e))

    def cache_local(self, url):
        image = hashlib.md5(url.encode('utf-8')).hexdigest()
        suffix = None
        m = re.search(r'(\.[^\.]+)$', url)
        if m:
            suffix = m.group(0)
        local = 'cache/image/{}{}'.format(image, suffix)

        found = False
        
        try:
            f = open(local, 'r')
            f.close()
            found = True
            return local

        except FileNotFoundError as e:
            try:
                r = self.session.get(url)
                p = pathlib.Path(local)
                p.parent.mkdir(parents=True, exist_ok=True) 
                f = open(local, 'wb')
                f.write(r.content)
                f.close()
                return local
            except ConnectionError as e:
                print('[unscroll.py] ConnectionError: {}'.format(e,))

        except OSError as e:
            print('[unscroll.py] OSError {}'.format(e,))
            
                

        

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

    def cache_wiki_thumbnail(self, thing):
        wiki_thumb = self.fetch_wiki_thumbnail_data(title=thing)
        if wiki_thumb is not None and 'url' in wiki_thumb:
            local_thumb = self.cache_thumbnail(wiki_thumb['url'])
            if local_thumb is not None and 'url' in local_thumb:
                return local_thumb['url']



        
