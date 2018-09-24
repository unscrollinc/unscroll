import re
import bs4
import requests
import requests_cache
from pprint import pprint
from tableextractor import Extractor
from unscroll import UnscrollClient
from unscrolldate import UnscrollDate
from edtf import parse_edtf, text_to_edtf, struct_time_to_datetime
from datetime import date
from datetime import datetime

import time

requests_cache.install_cache('wiki_cache')

def get_url_as_soup(url):
    r = requests.get(url)
    bs = bs4.BeautifulSoup(r.content, "lxml")
    return bs

def filter_key(k):
    a = k.lower()
    b = re.sub(r'\s+', '_', a)
    c = re.sub('[^a-z_]', '', b)
    return c

def __main__():

    scroll_thumb = "https://upload.wikimedia.org/wikipedia/commons/0/0b/Studs_Terkel_-_1979-1.jpg"    
    api = UnscrollClient()
    title = "Studs Terkel Interviews"
    favthumb = api.cache_thumbnail(scroll_thumb)
    with_thumbnail = favthumb.get('url')

    api.delete_scroll_with_title(title)
    
    scroll = api.create_or_retrieve_scroll(
        "Studs Terkel Interviews",
        description='<b>Via the Studs Terkel Radio Archive at WFMT</b>: In his 45 years on WFMT radio, Studs Terkel talked to the 20th century’s most interesting people.',
        link='https://studsterkel.wfmt.com/',
        with_thumbnail=with_thumbnail,
        subtitle='Collection via WFMT',)
    print('SCROLL: {}'.format(scroll))
    shows = []
    url = 'https://studsterkel.wfmt.com/explore#t=date'
    soup = get_url_as_soup(url)
    ps = soup.find_all('p')

    for p in ps:
        show = {}
        a = p.find('a')
        if a is not None:
            date = a.find('span')
            if date is not None:
                _edtf = parse_edtf(text_to_edtf(date.text))
                res = len(str(_edtf))
                _as_datetime = struct_time_to_datetime(_edtf.upper_strict())
                show['when_happened'] = _as_datetime
                show['resolution'] = res
                show['when_original'] = date.text
                show['content_url'] = 'https://studsterkel.wfmt.com{}'.format(a.get('href'))
                [s.extract() for s in a('span')]
                show['title'] = a.text.strip()
                show['text'] = ''
                show['source_url'] = 'https://studsterkel.wfmt.com/'
                show['with_thumbnail'] = None
                
                pprint(show['title'])
                print(scroll)
                resp = api.create_event(show, scroll)
                pprint(resp.json())




__main__()
