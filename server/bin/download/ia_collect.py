import requests
import datefinder
import pprint
import random
import unscroll
import argparse
import math

from unscrolldate import UnscrollDate
from unscroll import UnscrollClient

ROW_COUNT = 50

class IAItem():
    in_scroll = None
    slug = None
    url = None
    title = None
    description = None
    date = None
    when_happened = None
    thumbnail = None
    
    def __init__(self, slug, scroll):
        self.in_scroll = scroll
        self.slug = slug
        self.iaurl = self.url(slug)

        r = requests.get(self.iaurl)
        data = r.json()
        meta = data.get('metadata')
        
        self.url = meta.get('identifier-access')
        self.date = meta.get('date')        
        self.title = meta.get('title')
        self.text = meta.get('description')
        pprint.pprint(self.to_event())
        
    def url(self, id):
        url = str('https://archive.org/metadata/{}')\
              .format(id,)
        return url

    def to_event(self):
        ud = UnscrollDate(self.date)
        if ud.is_okay():
            d = {
                'title':self.title,
                'text':self.text,
                'resolution':ud.resolution,
                'with_thumbnail':self.thumbnail,
                'ranking':0,
                'content_url':self.url,
                'source_name':self.in_scroll.name,
                'source_url':self.in_scroll.source_url,
                'when_happened':ud.when_happened,
                'when_original':ud.when_original
            }
            return d
        return None
    

class IACollection():
    slug=None
    name=None
    count=None
    source_url=None
    total_pages=None
    session = None

    def __init__(self, slug):
        self.slug=slug

        first_url = self.url(row_count=1)
        r = requests.get(first_url)
        j = r.json()
        data = j.get('data')
        resp = j.get('response')
        self.count = resp.get('numFound')
        self.total_pages = math.ceil(self.count/ROW_COUNT)
        
        for url in [self.url(page_count=x) for x in range(1, self.total_pages + 1)]:
            items = requests.get(url)
            j = items.json()
            resp = j.get('response')
            docs = resp.get('docs')
            filtered = [x for x in docs if 'date' in x]
            pprint.pprint(list(filtered))
            items = [IAItem(doc.get('identifier'), self) for doc in filtered]

    def url(self, row_count=None, page_count=1):
        if row_count is None:
            row_count = ROW_COUNT
            
        url = str('https://archive.org/advancedsearch.php?'+\
                  'q=collection%3A{}'+\
                  '&fl%5B%5D=date&fl%5B%5D=identifier'
                  '&rows={}&page={}'+\
                  '&output=json').format(self.slug, row_count, page_count,)
        return url    
    
    def to_scroll():
        pass


def __main__():
    c =IACollection('tednelsonjunkmail')
    

__main__()




def make_details_url(term):
    return "https://archive.org/details/{}&output=json".format(term,)


def __xxxmain__(term=None, title=None):

    parser = argparse.ArgumentParser(
        description='Search archive.org and get things.')
    parser.add_argument('--term',
                        help='A search term; in quotes if necessary.')
    parser.add_argument('--title',
                        type=int,
                        help='The title of the search results')
    args = parser.parse_args()
    if (args.term is None):
        print('No term!')

    c = unscroll.UnscrollClient(
        api='http://127.0.0.1:8000',
        username='admin',
        password='password')
    c.login()

    c.create_scroll(title, subtitle='From Archive.org')

    r = requests.request('GET', make_url(term))
    d = r.json()
    for doc in d['response']['docs']:
        events = []
        source = make_details_url(doc['identifier'])
        print(source)
        inner_d = requests.request('GET', source)
        data = inner_d.json()
        coll = data['metadata']['identifier'][0]
        coll_title = data['metadata']['title'][0]
        fd = data['files']
        for f in fd:
            if fd[f]['format'] == 'VBR MP3':
                dates = list(datefinder.find_dates(f))
                if len(dates) > 0:
                    dt = dates[0]
                    title = f
                    myfile = fd[f]
                    if 'title' in myfile:
                        title = myfile['title']
                    elif 'creator' in myfile:
                        title = myfile['creator']
                    elif 'artist' in myfile:
                        title = myfile['artist']

                    url = 'https://archive.org/download/{}{}'.format(coll, f,)
                    event = {
                        'media_type': 'audio/mpeg',
                        'content_type': 'radio broadcast',
                        'title': title,
                        'text': coll_title,
                        'ranking': random.random(),
                        'datetime': dt.isoformat(),
                        'resolution': 'days',
                        'content_url': url,
                        'thumbnail': None
                    }
                    c.create_event(event)
                    pprint.pprint(event['title'])                    


