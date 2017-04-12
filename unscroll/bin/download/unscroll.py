from coreapi import transports, Document, Link, Client


class UnscrollClient():
    site = None
    schema_url = None
    username = None
    password = None
    client = None
    schema = None

    def __init__(self,
                 site,
                 schema_url,
                 username,
                 password):
        self.site = site
        self.schema_url = schema_url
        self.username = username
        self.password = password

    def login(self):
        _client = Client()
        schema = _client.get(self.schema_url)
        key = _client.action(schema, ['rest-auth', 'login', 'create'],
                             params={"username": self.username,
                                     "password": self.password})
        credentials = {self.site: 'Token {}'.format(key['key'],)}
        transport = [transports.HTTPTransport(credentials=credentials)]
        self.client = Client(transports=transport)
        self.schema = self.client.get(self.schema_url)

    def create_scroll(self, title):
        new_scroll = self.client.action(self.schema,
                                        ['api', '0', 'scrolls', 'create'],
                                        params={"title": title})
        scroll_d = dict(new_scroll)
        scroll_url = "{}/api/0/scrolls/{}/".format(self.site, scroll_d['id'])
        return scroll_url

    def create_event(self, scroll_url, event):
        event['scroll'] = scroll_url
        done = self.client.action(self.schema, ['api', '0',
                                                'events', 'create'],
                                  params=event)
        return done

