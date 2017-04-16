import json
import requests


class UnscrollClient():
    api = None
    username = None
    password = None
    authentication_header = None

    def __init__(self,
                 api,
                 username,
                 password):
        self.api = api
        self.username = username
        self.password = password

    def login(self):
        r = requests.post(self.api + '/rest-auth/login/',
                          data={'username': self.username,
                                'password': self.password})
        login = r.json()
        self.authentication_header = {'Authorization':
                                      'Token {}'.format(login.get('key'),)}
        return True

    def create_scroll(self, title):
        r = requests.post(self.api + '/scrolls/',
                          headers=self.authentication_header,
                          json={'title': title})
        scroll = r.json()
        scroll_d = dict(scroll)
        scroll_url = "{}/scrolls/{}/".format(self.api,
                                             scroll_d['id'])
        return scroll_url

    def create_event_batch(self, events):
        print("Batching {} events.".format(len(events)))
        r = requests.post(self.api + '/bulk-events/',
                          headers=self.authentication_header,
                          json=events)
        return r.json()
    
    def create_event(self, scroll_url, event):
        event['scroll'] = scroll_url
        r = requests.post(self.api + '/events/',
                          headers=self.authentication_header,
                          data=event)
        return r

