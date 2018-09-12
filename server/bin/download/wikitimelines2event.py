import re
import bs4
import requests
import requests_cache
from pprint import pprint
from tableextractor import Extractor

requests_cache.install_cache('wiki_cache')

def is_datelike(s):
    return 1 if 'century' in s else 0

def get_first_link(w):
    print(w)
    link = None    
    if w is not None:
        if 'event' in w:
            type(w['event'])
        w['link']=link
        return w
        
def headline_extract(h):
    t = h.text
    t = re.sub(r'\[[^\]]+\]', '', t)
    if (is_datelike(t)):
        return t

def transformer(cell):
    return cell

def table_extract(he, t, context):
    e = Extractor(t, transformer=transformer)
    l = e.return_list()
    header = [x.text.rstrip().lower() for x in l[0]] + ['header', 'context']
    z = [dict(zip(header, x + [he, context])) for x in l]
    return z

def process(h, t, context):
    he = headline_extract(h)
    if (he is not None):
        return table_extract(he, t, context)
    return (None, None,)

def tidy(d):
    d['year']=d['year'].text
    d['date']=d['date'].text
    return d
    
def __main__(context, url):
    r = requests.get(url)
    bs = bs4.BeautifulSoup(r.content, "lxml")
    hts = [(h, h.find_next_sibling('table')) for h in bs.find_all('h2')]
    done = [process(h,t,context) for (h, t) in hts]
    flattened = [val for sublist in done for val in sublist]
    scrubbed = [x for x in flattened if (x is not None and 'event' in x and x['event'] != 'event')]
    tidied = [tidy(x) for x in scrubbed]
    # We have all we can get so now we progressively transform
    linked = [get_first_link(x) for x in tidied]
    pprint(linked)
    
__main__('Vietnam',
         'https://en.wikipedia.org/wiki/Timeline_of_Vietnamese_history')


