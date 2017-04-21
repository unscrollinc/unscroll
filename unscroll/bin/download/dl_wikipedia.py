from bs4 import BeautifulSoup
import re
import pprint
import sys
import datetime
import requests
from unscroll import UnscrollClient

MONTH_NAMES = 'January|February|March|April|May|June|July|'\
              'August|September|October|November|December'

MONTH_REGEX = re.compile('^' + MONTH_NAMES + '$')

MONTHS_DAYS = '^(January|February|March|April|May|June|July|'\
              'August|September|October|November|December)\s+(\d+)'

MONTH_DAYS_REGEX = re.compile(MONTH_NAMES)

MONTHS_HASH = {'January': 1,
               'February': 2,
               'March': 3,
               'April': 4,
               'May': 5,
               'June': 6,
               'July': 7,
               'August': 8,
               'September': 9,
               'October': 10,
               'November': 11,
               'December': 12}


class WikipediaText():
    year = None
    events = []
    parsed = None
    unscroll_client = None
    
    def __init__(self, year=None):
        self.year = year
        r = requests.get('https://en.wikipedia.org/wiki/{}'.format(year))
        self.parsed = BeautifulSoup(r.content, 'html.parser')
        self.unscroll_client = UnscrollClient()

    def tidy(self, txt=None):
        return re.sub('\[edit\]\s*', '', txt)

    def realday(self, monthname=None, day=None):
        month = MONTHS_HASH[monthname]
        day = int(day)
        return datetime.date(self.year, month, day)

    def wikihtml_to_event(self, date=None, wikihtml=None, kind=None):
        sup = wikihtml.find('sup')
        if sup is not None:
            _ = sup.extract()
        contents = [str(x) for x in wikihtml.children]
        joined = "".join(contents)
        linked = re.sub(r'/wiki/', 'http://en.wikipedia.org/wiki/', joined)
        
        trimmed = re.sub(r'^(<a href=".+('
                         + MONTH_NAMES
                         + ')\s+\d+)</a>\s+[-–]\s+',
                         '', linked)
        
        unlinked = re.sub(r'<[^>]+>', '', trimmed)
        titles = [x['title'] for x in wikihtml.find_all('a')
                  if x.has_attr('title')]
        filtered = [x for x in titles if not MONTH_REGEX.match(x)]
        
        title = None
        subject = None
        if len(filtered) == 0:
            title = " ".join(unlinked.split(" ")[0:4]) + '...'            
        else:
            title = filtered[0]
            subject = title

        image = None
        
        if subject is not None:
            image = self.unscroll_client.fetch_wiki_thumbnail_data(title=subject)
            cached = self.unscroll_client(

        event = {
            'title': title,
            'subject': subject,
            'text': "".join(contents),
            'resolution': 'days',
            'datetime': date,
            'image':image,
            'contenttype': kind
        }
        pprint.pprint(event)
        return event

    def descend(self, ul=None, kind=None):
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
                        date = self.realday(monthname=last_date[0],
                                            day=last_date[1])
                        e = self.wikihtml_to_event(date=date, wikihtml=d,
                                                   kind=kind)
                        events.append(e)
                elif last_date is not None:
                    date = self.realday(last_date[0], last_date[1])
                    e = self.wikihtml_to_event(date=date, wikihtml=d,
                                               kind=kind)
                    events.append(e)
        if len(events) > 0:
            return events

    def get_events(self):
        event_types = {'#Events': 'event/event',
                       '#Births': 'event/birth',
                       '#Deaths': 'event/death'}
        events = []
        for keytype in event_types:
            events_h2 = self.parsed.select(keytype)[0].parent
            for event in events_h2.next_siblings:
                if event.name == "h2":
                    break
                else:
                    if event.name == "h3":
                        pass
                    if event.name == 'ul':
                        es = self.descend(ul=event.descendants,
                                          kind=event_types[keytype])
                        if es is not None:
                            events += es
        return events


def __main__(year=None):
    wt = WikipediaText(year)
    events = wt.get_events()


__main__(1990)
