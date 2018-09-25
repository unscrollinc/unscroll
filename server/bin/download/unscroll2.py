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

class DateParser():
    pass

class UnscrollAPI():
    api = None
    authentication_header = None
    session = None
    
    def __init__(self,
                 api='http://127.0.0.1:8000/api',
                 username='ford',
                 password='***REMOVED***'):
        
        self.api = api

        if self.session is None:
            self.session = requests.Session()
            
        if self.authentication_header is None:
            auth_header = self.login(username=username,
                                     password=password)
            self.authentication_header = {
                'Authorization': 'Token {}'.format(auth_header,)
            }

    def get_endpoint(self, endpoint):
        return '{}/{}/'.format(self.api, endpoint)
    
    def login(self, username=None, password=None):
        r = requests.post('{}/auth/login/'.format(self.api),
                          json={'username': username,
                                'password': password})
        login = r.json()
        return login.get('auth_token')
    
    def get_scrolls():
        pass
    
    def get_notebooks():
        pass

class Scroll():
    api = None
    scroll = None

    def __init__(self, scroll=None, api=None):
        self.api = api
        self.scroll = scroll
        if self.scroll.get('slug'):
            self.get()
        else:
            self.post()

    def get(self):
        url = self.api.get_endpoint('scrolls')
        r = requests.get(url,
                         headers=self.api.authentication_header,
                         params={'slug':self.scroll.get('slug')})
        data = r.json()
        results = data.get('results')
        first = results[0]
        self.scroll = first
        return self.scroll
    
    def post(self):
        pass

    def patch():
        pass
    
    def delete():
        pass
    
    def add_event(self, event):
        url = self.api.get_endpoint('events')
        e = event.event
        e['in_scroll'] = self.scroll.get('url')
        r = requests.post(url,
                          headers=self.api.authentication_header,
                          data=e)
        pprint.pprint(r.json())
        return r.json()

    def add_events(events_list):
        pass    
        
    def get_or_post(scroll):
        this.scroll = self.get('slug')

class Event():
    event = None
    payload = None
    scroll = None
    
    def __init__(self, event=None, scroll=None):
        self.event = event
        self.scroll = scroll

class Notebook():
    pass

class Note():
    pass
