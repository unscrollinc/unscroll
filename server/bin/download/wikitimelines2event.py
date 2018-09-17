import re
import bs4
import requests
import requests_cache
from pprint import pprint
from tableextractor import Extractor
from unscrolldate import UnscrollDate
from edtf import parse_edtf, text_to_edtf
import time

requests_cache.install_cache('wiki_cache')

def is_datelike(s):
    is_century = 1 if 'century' in s else 0
    is_year = 1 if re.search(r'\d{4}', s) else 0
    total = is_century + is_year
    
    return total > 0

def score(t):
    def ft(v):
        if v is not None:
            return 1
        else:
            return 0
        
    num = [score [t.year, t.month, t.day, t.hour, t.minute, t.second]]

    
def add_first_link(w):
    if w is not None and 'event' in w:
        e = w['event']

        for tag in e(['sup', 'span']):
            tag.decompose()

        text = e.text.rstrip()
        text = re.sub('^\s*\d+:\s*', '', text)
        if w['context'] is not None and w['context'] != '':
            text = '{}: {}'.format(w['context'], e.text.rstrip())
        m = re.match('([^\.]+\.)\s?(.*)', text)
        if m is not None:
            title = m.group(1)
            text = m.group(2)
        else:
            title = text
            text = ''
        w['title'] = title
        w['text'] = text
        links = e.select('a')            
        if len(links) > 0 and links[0] is not None:
            href = links[0].get('href')
            w['content_url']='https://en.wikipedia.org{}'.format(href,)
            w['item'] = re.sub(r'/wiki/|/w/index.php\?title\=', '', href)

        date_text = '{} {}'.format(w['date'], w['year'])

        # print('ETC', date_text)

        date_text = re.sub('–', '-', date_text)

        edtf_date_txt = text_to_edtf(date_text)

        # print('TEXT', edtf_date_txt)

        edtf_date = parse_edtf(edtf_date_txt)

        # print('DATE', edtf_date)            
        iso_date = time.strftime('%Y-%m-%dT%H:%M:%SZ',
                                 edtf_date.upper_fuzzy())
        w['when_happened'] = iso_date
        w['when_original'] = date_text
        w['resolution'] = 10
        del w['event']
        del w['date']
        del w['context']
        if 'header' in w:
            del w['header']

        pprint(w)
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
    
def extract_tables(context, url):
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
    
def extract_list(context, url):
    r = requests.get(url)
    bs = bs4.BeautifulSoup(r.content, "lxml")
    hs = bs.find_all('h2')
    # get all elements that have the same h2 in front of them
    items = []
    just_heds = [(headline_extract(h), h) for h in hs if headline_extract(h) is not None]
    sample = just_heds[0][0]
    sample_resolution = len(sample)

    # DID WE GET MONTH + YEAR
    if sample_resolution > 4:
        for year_month, h in just_heds:
            for el in h.next_elements:
                # we found a paragraph
                if el.name == 'dl':
                    kids = el.find_all('dd')
                    for kid in kids:
                        m = re.match('(\d+)', kid.text)
                        day = m.group(1)
                        items.append(
                            {'year':'',
                             'context':context,
                             'date':'{} {}'.format(day, year_month),
                             'event':kid})
                if el.name == 'h2':
                    break
            linked = [add_first_link(x) for x in items]
        return linked

    # OR JUST YEAR
    elif sample_resolution == 4:
        for year, h in just_heds:
            for el in h.next_elements:
                # we found a paragraph
                if el.name == 'p':
                    month_day = el.text.rstrip()
                    for dl in el.next_elements:
                        if dl.name == 'dl':
                            items.append(
                                {'year':year,
                                 'context':context,
                                 'date':month_day,
                                 'event':dl})
                        if dl.name == 'p':
                            break
                if el.name == 'h2':
                    break
                linked = [add_first_link(x) for x in items]
        return linked
    
#items = extract_list('',
#         'https://en.wikipedia.org/wiki/Timeline_of_events_preceding_World_War_II')

items = extract_list('',
         'https://en.wikipedia.org/wiki/Timeline_of_World_War_II_(1940)')

# https://en.wikipedia.org/wiki/Timeline_of_events_preceding_World_War_II
# https://en.wikipedia.org/wiki/Timeline_of_World_War_II_(1939)
