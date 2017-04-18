from bs4 import BeautifulSoup
import re
import pprint
import sys
import datetime
import requests

MONTH_NAMES = '^January|February|March|April|May|June|July|August|September|October|November|December$'

MONTH_REGEX = re.compile(MONTH_NAMES)

MONTHS_DAYS = '^(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d+)'

MONTHS_SHORT = 'Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec'

MONTHS_HASH = {'January':1,
               'February':2,
               'March':3,
               'April':4,
               'May':5,
               'June':6,
               'July':7,
               'August':8,
               'September':9,
               'October':10,
               'November':11,
               'December':12}

def tidy(txt):
    return re.sub('\[edit\]\s*', '', txt)

def downward(el=None, context={}, events=[]):
    e = el.next_element
#    if type(e.tag)
#    if e.name == 'h2':
#        return events
#    else:
#        downward(el=e, context=context, events=[])

def realday(year, tuple):
    month = MONTHS_HASH[tuple[0]]
    day = int(tuple[1])
    return datetime.date(year, month, day)
    
events = []
year = 1925
r = requests.get('https://en.wikipedia.org/wiki/{}'.format(year))

def to_event(date=None, event=None):
    sup = event.find('sup')
    if sup is not None:
        _ = sup.extract()
    contents = [str(x) for x in event.children]
    joined = "".join(contents)
    linked = re.sub(r'/wiki/', 'http://en.wikipedia.org/wiki/', joined)
    trimmed = re.sub(r'^[^–]+[––]\s*', r'', linked)
    unlinked = re.sub(r'<[^>]+>','',trimmed)
    titles = [x['title'] for x in event.find_all('a') if x.has_attr('title')]
    filtered = [x for x in titles if not MONTH_REGEX.match(x)]

    title = None
    
    if len(filtered) == 0:
         title = " ".join(unlinked.split(" ")[0:4]) + '...'
    else:
         title = filtered[0]
        
    e = {'datetime':date,
         'title':title,
         'contenttype':'event/death',
         'mediatype':'text/html',
         'text':trimmed,
         'source':'Wikipedia'}
    return e

def descend(year, ul):
    last_date = None
    events = []
    for d in ul:
        if d.name == 'ul':
            pass
        elif d.name == 'li':
            t = re.findall(MONTHS_DAYS, d.text)
            if len(t) > 0:
                last_date = t[0]
                if not(d.find('ul')):
                    date = realday(year, t[0])
                    e= to_event(date=date, event=d)
                    events.append(e)
            elif last_date is not None:
                date = realday(year, last_date)
                e = to_event(date=date, event=d)                        
                events.append(e)
    if len(events) > 0:
        return events
    
    
soup = BeautifulSoup(r.content, 'html.parser')
events_h2 = soup.select('#Deaths')[0].parent
for event in events_h2.next_siblings:
    if event.name == "h2":
        break
    else:
        if event.name == "h3":
            h = tidy(event.text)
            m = re.findall(MONTH_NAMES, h)
        if event.name == 'ul':
            es = descend(year, event.descendants)
            if es is not None:
                events += es
            # last_date = None
            # for d in event.descendants:
            #     if d.name == 'ul':
            #         pass
            #     elif d.name == 'li':
            #         t = re.findall(MONTHS_DAYS, d.text)
            #         if len(t) > 0:
            #             last_date = t[0]
            #             if not(d.find('ul')):
            #                 date = realday(year, t[0])
            #                 e= to_event(date=date, event=d)
            #                 events.append(e)
            #         elif last_date is not None:
            #             date = realday(year, last_date)
            #             e = to_event(date=date, event=d)                        
            #             events.append(e)


pprint.pprint(events)





#    while event in events_h2.nextSiblings:


