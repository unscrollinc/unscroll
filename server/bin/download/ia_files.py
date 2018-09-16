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

def extract_thumbnail(data):
    _server = data.get('d1')
    _dir = data.get('dir')    
    _files = data.get('files')
    
    _filtered = [_f for _f in _files if
                 (_f.get('format') == 'JPEG'
                  and _f.get('source') == 'original')]
    
    if len(_filtered) > 0:
        _url = 'https://{}{}/{}'.format(_server, _dir, _filtered[0].get('name'))
        return _url


def extract_events(data, filter, link, begin, end):
    _server = data.get('d1')
    _dir = data.get('dir')    
    _files = data.get('files')

    _filtered = [_f for _f in _files
                 if (filter in _f.get('format')
                     and 'ZIP' not in _f.get('format'))]
    
    def to_pseudo_event(f):
        _ud = UnscrollDate([f.get('name')], begin=begin, end=end)
        _title = f.get('title')

        if _title is None:
            _mutable_title = f.get('name')
            _mutable_title = re.sub('_', ' ', _mutable_title)
            _mutable_title = re.sub(r'.mp3', '', _mutable_title)            
            _title = _mutable_title
        
        _event = {
            'title':_title,
            'content_url':'{}/{}'.format(link, f.get('name')),
            'when_happened':_ud.when_happened,
            'when_original':_ud.when_original,
            'resolution':_ud.resolution,
        }
        return _event
    
    _processed = [to_pseudo_event(_f) for _f in _filtered]

    return _processed            

def load_data(begin=None, end=None, title=None,
             slug=None, thumbnail_url=None,
             delete=False):

    # Get the file listing
    _link = 'https://archive.org/details/{}'.format(slug)
    _r = requests.get('https://archive.org/metadata/{}'.format(slug))
    _data = _r.json()

    # Get metadata
    _md = _data.get('metadata')

    _title = title
    if (title is None):
        _title = _md.get('title')
    
    _description = _md.get('description')
    
    _events = extract_events(_data, 'MP3', _link, begin, end)

    _thumbnail_url = thumbnail_url
    if (thumbnail_url is None):
        _thumbnail_url = extract_thumbnail(_data)
        
    api = UnscrollClient()
    _thumb = api.cache_thumbnail(_thumbnail_url)
    _with_thumbnail = _thumb.get('url')

    if delete is True:
        api.delete_scroll_with_title(_title)
    
    scroll = api.create_or_retrieve_scroll(
        _title,
        subtitle='via Archive.org',                          
        public=True,
        description=_description,
        link=_link,
        citation='',
        with_thumbnail=_with_thumbnail,
    )
    
    for event in _events:
        pprint.pprint(event)
        j = api.create_event(event, scroll)
        pprint.pprint(j.json())

def __main__():
    begin=1932
    end=1946
    title = 'WWII audio'
    for i in range(1932, 1946):
        slug = 'WWII_News_{}'.format(i)
        print(slug)        
        load_data(begin=begin, end=end,
                  title=title,
                  slug=slug,
                  thumbnail_url='https://www.archives.gov/files/research/military/ww2/photos/images/ww2-13.jpg',
                  delete=False)


__main__()



#    slug = 'WWII_News_1941'
#    thumbnail_url = 'https://upload.wikimedia.org/wikipedia/commons/b/b8/9_Div_Tobruk%28AWM_020779%29.jpg'
