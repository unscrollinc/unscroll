import requests
import datefinder
import re
import pprint
import random
import unscroll
import argparse
import math

from unscrolldate import UnscrollDate
from unscroll import UnscrollClient

ROW_COUNT = 25

# If I find a subcollection I should go ahead and do that
# should i track work

class IAItem():
    in_scroll = None
    slug = None
    url = None
    title = None
    creator = None
    description = None
    date = None
    when_happened = None
    thumbnail_url = None
    
    def __init__(self, slug, scroll):
        try:
            self.in_scroll = scroll
            self.slug = slug
            self.iaurl = self.url(slug)
            r = requests.get(self.iaurl)
            data = r.json()
            self.thumbnail_url = self.get_thumb(data)
            meta = data.get('metadata')
            self.creator = meta.get('creator')
            self.description = meta.get('description')            
            self.url = 'https://archive.org/details/{}'.format(meta.get('identifier'))
            self.date = meta.get('date')        
            self.title = meta.get('title')
        except Exception as e:
            print(slug, e)

    def get_thumb(self, data):
        files = data.get('files')

        # there's no such thing as a "thumbnail" field at the Internet
        # Archive, just patterns that might make sense. __ia_thumb.jpg
        # is the good stuff; otherwise we get one of those ganky
        # animgifs.
        
        if files is not None:
            
            filtered = [x for x in files if 'name' in x and x['name'] == '__ia_thumb.jpg']
            if len(filtered) > 0:
                dir = 'https://{}{}/__ia_thumb.jpg'.format(data.get('d1'), data.get('dir'),)
                return dir
            
            filtered = [x for x in files if 'name' in x
                        and '.jpg' in x['name']
                        and not('thumb' in x['name'])]
            if len(filtered) > 0:
                dir = 'https://{}{}/{}'.format(data.get('d1'), data.get('dir'),filtered[0]['name'])
                return dir            

            filtered = [x for x in files if 'format' in x and x['format'] == 'Animated GIF']
            if len(filtered) > 0:
                dir = 'https://{}{}/{}'.format(data.get('d1'), data.get('dir'),filtered[0]['name'])
                return dir

        return None
        
    def url(self, id):
        url = str('https://archive.org/metadata/{}')\
              .format(id,)
        return url

    def to_event(self, begin, end):
        ud = UnscrollDate([self.date, self.title], begin=begin, end=end)
        print(ud.when_happened)
        adjusted_title = self.title
        if self.creator is not None:
            adjusted_title = '{} (by {})'.format(self.title, self.creator)
            
        
        if ud.is_okay():
            d = {
                'title':adjusted_title,
                'text':self.description,
                'resolution':ud.resolution,
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
    thumbnail_url=None
    total_pages=None
    session = None
    title = None
    description = None
    
    def __init__(self, slug, title):
        self.slug=slug
        self.source_url = 'https://archive.org/details/{}'.format(self.slug,)
        # get the metadata to start
        first_url = self.url(row_count=1)
        
        d = requests.get('https://archive.org/metadata/{}'.format(slug,))
        dj = d.json()

        self.thumbnail_url = self.get_thumb(dj)

        meta = dj.get('metadata')
        if title is not None:
            self.title = title
        else:
            self.title = meta.get('title')
        self.description = meta.get('description')

        files = dj.get('files')
        filtered_orig = [x for x in files if 'name' in x and x['source'] == 'original']
        
        for f in filtered_orig:
            title = f.get('title')
            filename = f.get('name')
            ud = UnscrollDate([title, title], begin=1000, end=2000)
            x = {'title':title, 'filename':filename, 'date':ud.when_happened}
            # pprint.pprint(x)
        

        # Get a very brief listing of items to get count
        r = requests.get(first_url)
        j = r.json()
        data = j.get('data')
        resp = j.get('response')
        self.count = resp.get('numFound')
        self.total_pages = math.ceil(self.count/ROW_COUNT)
        

    def get_items(self, page_count):
        # step through a range of those pages, fetching and turning
        # them into URLs, then getting them
        for url in [self.url(page_count=page_count)]:
            items = requests.get(url)
            try:
                j = items.json()
                resp = j.get('response')
                docs = resp.get('docs')
                items = [IAItem(doc.get('identifier'), self) for doc in docs]
                return items
            except:
                print('@ia_collect exception: {}'.format(sys.exc_info()[0]))
        
    def get_thumb(self, meta):
        dir = 'https://{}{}/__ia_thumb.jpg'.format(meta.get('d1'), meta.get('dir'),)
        return dir        

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

    parser = argparse.ArgumentParser(
        description='Search archive.org and get things.')
    
    parser.add_argument('--collection',
                        help='A collection name')
    parser.add_argument('--delete',
                        type=bool,
                        help='Delete? true or false')
    parser.add_argument('--begin',
                        help='The earliest year in the collection')
    parser.add_argument('--title',
                        help='Set a title')
    parser.add_argument('--end',
                        help='The last year in the collection')        
    args = parser.parse_args()
    
    if (args.collection is None):
        print('No collection!')
        exit(0)

     
    api = unscroll.UnscrollClient()
    ia = IACollection(args.collection, args.title)

    if args.delete is True:
        api.delete_scroll_with_title(ia.title)
        
    favthumb = api.cache_thumbnail(ia.thumbnail_url)
    with_thumbnail = favthumb.get('url')
    
    scroll = api.create_or_retrieve_scroll(
        ia.title,
        description='<b>Via Archive.org</b>: ' + ia.description,
        link=ia.source_url,
        with_thumbnail=with_thumbnail,
        subtitle='Collection via Archive.org',)
    
    if scroll is None:
        print('could not create scroll: {}'.format(ia.title))
        exit(0)
        
    if scroll is not None:
        for x in range(1, ia.total_pages + 1):
            items = ia.get_items(x)
            for item in items:
                d = item.to_event(args.begin, args.end)
                print(item.thumbnail_url)
                if d is not None:

                    favthumb = api.cache_thumbnail(item.thumbnail_url)

                    if favthumb is not None:
                        d['with_thumbnail'] = favthumb.get('url')

                    d['in_scroll'] = scroll
                    e = api.create_event(d, scroll)
                    print(e)

__main__()
