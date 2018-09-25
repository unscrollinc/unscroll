import re
import bs4
# import requests_cache
import requests
from pprint import pprint
from tableextractor import Extractor
from unscroll import UnscrollClient
from unscrolldate import UnscrollDate
from edtf import parse_edtf, text_to_edtf, struct_time_to_datetime
from datetime import date
from datetime import datetime
import time

import shelve
shelf = shelve.open('shelf')

import spacy
nlp = spacy.load('en')


def get_url_as_soup(url):
    if url not in shelf:
        s = requests.Session()
        r = s.get(url)
        shelf[url] = r.content

    bs = bs4.BeautifulSoup(shelf[url], "lxml")
    shelf.close()
    return bs

def filter_key(k):
    a = k.lower()
    b = re.sub(r'\s+', '_', a)
    c = re.sub('[^a-z_]', '', b)
    return c

def get_person(title):
    doc = nlp(title)
    for ent in doc.ents:
        if (ent.label_ == 'PERSON'
            and len(ent.text.split()) > 1
            and 'Studs Terkel' not in ent.text):
            return ent.text
    
def post_shows(api, scroll):
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

                # Evil python mutates `a` object
                [s.extract() for s in a('span')]
                
                _edtf = parse_edtf(text_to_edtf(date.text))
                title = a.text.strip()
                person = get_person(title)
                thumb = None

                show = {
                    'when_happened': struct_time_to_datetime(_edtf.upper_strict()),
                    'resolution': len(str(_edtf)),
                    'when_original': date.text,
                    'content_url': 'https://studsterkel.wfmt.com{}'.format(a.get('href')),
                    'title': a.text.strip(),
                    'text': '',
                    'with_thumbnail':thumb,
                    'media_type':'audio/mpeg',
                    'content_type':'Oral histories',
                    'source_url': 'https://studsterkel.wfmt.com/',
                    'with_thumbnail': api.cache_wiki_thumbnail(person)
                }
                resp = api.create_event(show, scroll)
                pprint(resp.json())                    

def __main__():

    scroll_thumb = "https://upload.wikimedia.org/wikipedia/commons/0/0b/Studs_Terkel_-_1979-1.jpg"    
    api = UnscrollClient()
    title = "Studs Terkel Interviews"
    favthumb = api.cache_thumbnail(scroll_thumb)
    with_thumbnail = favthumb.get('url')

    api.delete_scroll_with_title(title)
    
    scroll = api.create_or_retrieve_scroll(
         title,
         description='<b>Via the Studs Terkel Radio Archive at WFMT</b>: '
         'In his 45 years on WFMT radio, Studs Terkel talked to the 20th '
         'century’s most interesting people.',
         link='https://studsterkel.wfmt.com/',
         with_thumbnail=with_thumbnail,
         subtitle='Collection via WFMT',)

    post_shows(api, scroll)


__main__()
