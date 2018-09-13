import re
import bs4
import requests
import requests_cache
from pprint import pprint
from tableextractor import Extractor
from unscrolldate import UnscrollDate
from flexidate import parse
print(parse('Jan 1890'))

requests_cache.install_cache('wiki_cache')

def is_datelike(s):
    return 1 if 'century' in s else 0

def add_first_link(w):
    if w is not None:
        if 'event' in w:
            e = w['event']

            for tag in e(['sup', 'span']):
                tag.decompose()
                
            text = '{}: {}'.format(w['context'], e.text.rstrip())
            m = re.match('([^\.]+\.)\s?(.*)', text)
            title = m.group(1)
            text = m.group(2)
            w['title'] = title
            w['text'] = text
            links = e.select('a')            
            if len(links) > 0 and links[0] is not None:
                href = links[0].get('href')
                w['content_url']='https://en.wikipedia.org{}'.format(href,)
                w['item'] = re.sub(r'/wiki/|/w/index.php\?title\=', '', href)
        w['flexidate'] = parse('{}'.format(w['year']))
#        w['when_happened'] = ud.when_happened
#        w['when_original'] = ud.when_original
#        w['resolution'] = ud.resolution
        del w['event']
        del w['date']
        del w['context']
        del w['header']        
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
    z = [dict(zip(header, x + [he, context])) for x in l[1:]]
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
    linked = [add_first_link(x) for x in tidied]
    pprint(linked)
    
__main__('Lebanon',
         'https://en.wikipedia.org/wiki/Timeline_of_Lebanese_history')


