import re
import bs4
import requests
import requests_cache
from pprint import pprint
from tableextractor import Extractor
from unscroll import UnscrollClient
from unscrolldate import UnscrollDate
from edtf import parse_edtf, text_to_edtf
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

def div_to_event(div):
    h = {}
    title = div.select('h2')[0].text
    h['title'] = title

    thumb = div.select('a.thumbnail')[0]
    h['content_url'] = thumb.get('href')
    h['img'] = thumb.select('img')[0].get('src')

    # lots of data in DLs
    dls = div.select('dl')
    for dl in dls:
        dts = dl.select('dt')
        dds = dl.select('dd')
        key = dts[0].text.strip()
        filtered = filter_key(key)
        h[filtered] = []
        for item in dds:
            h[filtered] = item.text.strip()

    # and the rest in LIs
    uls = div.select('ul.nav')
    for ul in uls:
        lis = ul.select('li')
        for li in lis:
            key = li.text.strip()
            filtered = filter_key(key)            
            value = None
            a = li.select('a')
            if a is not None and len(a) > 0:
                value = a[0].get('href')
            h[filtered] = value

    event = {
        'title':h.get('title')
    }
    return h
    
def fetch_records(url):
    hs = {}
    soup =  get_url_as_soup(url)
    divs = soup.select('div.record')
    events = [div_to_event(div) for div in divs]
    return events

def __main__():
    urls = ['http://collections.si.edu/search/results.htm?q=&fq=online_media_type%3A%22Sound+recordings%22&start={}'.format(x * 20) for x in range(0, 190)]
    for url in urls:
        events = fetch_records(url)
        pprint(events)

__main__()
        
