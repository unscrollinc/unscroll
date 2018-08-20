from bs4 import BeautifulSoup
import re
import pprint
from datetime import date
from datetime import datetime
import requests
import random
from unscroll import UnscrollClient
import argparse
import bleach

THUMBNAIL_URL='https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Wikipedia-logo-v2-wordmark.svg/125px-Wikipedia-logo-v2-wordmark.svg.png'
PREVIEW_API='https://en.wikipedia.org/api/rest_v1/page/summary/'
MONTH_NAMES = 'January|February|March|April|May|June|July|'\
              'August|September|October|November|December'
MONTH_REGEX = re.compile('^' + MONTH_NAMES + '$')
MONTHS_DAYS = '^(' + MONTH_NAMES + ')\s+(\d+)'
MONTH_DAYS_REGEX = re.compile(MONTHS_DAYS)
MONTHS_PREFIX = '^(' + MONTH_NAMES + ')\s+\d+\s*[-–—]\s*'

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
    subject = None
    parsed = None
    unscroll_client = None
    scroll = None
    
    def __init__(self, year=None, subject=None):
        self.year = year
        self.subject = subject
        self.wiki_url = 'https://en.wikipedia.org/wiki/{}'.format(year)
        if subject is not None:
            self.wiki_url = 'https://en.wikipedia.org/wiki/{}_in_{}'.format(year, subject)        
        r = requests.get(self.wiki_url)
        self.parsed = BeautifulSoup(r.content, 'html.parser')
        self.unscroll_client = UnscrollClient()
        self.unscroll_client.login()

        favthumb = self.unscroll_client.cache_thumbnail(THUMBNAIL_URL)
        subject_title = subject
        if subject is None:
            subject_title = 'Review'
        self.scroll = self.unscroll_client.create_or_retrieve_scroll(
            'Wiki Years in {}'.format(subject_title),
            description='Events spidered from the English Wikipedia pages.',
            link='https://en.wikipedia.org/wiki/List_of_years',
            with_thumbnail=favthumb.get('url'))

    def tidy(self, txt=None):
        return re.sub('\[edit\]\s*', '', txt)

    def realday(self, monthname=None, day=None):
        month = MONTHS_HASH[monthname]
        day = int(day)
        return date(self.year, month, day)

    def wikihtml_to_event(self, date=None, wikihtml=None, kind=None):
        sup = wikihtml.find('sup')
        if sup is not None:
            _ = sup.extract()
        contents = [str(x) for x in wikihtml.children]
        joined = "".join(contents)
        linked = re.sub(r'/wiki/', 'http://en.wikipedia.org/wiki/', joined)
        targeted = re.sub(r'href=', 'target="_blank" href=', linked)

        bleached = bleach.clean(targeted, tags=['b', 'i', 'strong', 'em'], strip=True)
        pass1 = re.sub(MONTHS_PREFIX, '', bleached)
        pass2 = re.sub(MONTHS_PREFIX, '', pass1)
        lastpass = re.sub('^\s*\d+\s*[-–—]\s*', '', pass2)
       
        titles = [x['title'] for x in wikihtml.find_all('a')
                  if x.has_attr('title')]
        filtered = [x for x in titles if not MONTH_REGEX.match(x)]

        title = None
        subject = None

        if len(filtered) == 0:
            title = " ".join(bleached.split(" ")[0:4]) + '...'
        else:
            title = filtered[0]
            subject = title

        thumbnail = None

        if subject is not None:
            image_d  = self.unscroll_client.fetch_wiki_thumbnail_data(title=subject)
            image_url = image_d.get('url') if image_d is not None else None
            if image_url is not None:
                thumbnail_local = self.unscroll_client.cache_local(image_url)                
                thumbnail_d = self.unscroll_client.post_thumbnail(thumbnail_local)
                if thumbnail_d is not None:
                    thumbnail = thumbnail_d['url']

        if kind == 'birth':
            lastpass = 'Born: {}'.format(lastpass)
            
        elif kind == 'death':
            lastpass = 'Died: {}'.format(lastpass)            

        ranking = 0
        if kind == 'world event':
            ranking = 0.9
        if kind == 'birth':
            ranking = 0.1
        if kind == 'death':
            ranking = 0.5
            
        dt = datetime.combine(date, datetime.max.time()).isoformat(' ')
        wiki_subject = None
        if subject is not None:
            subject = re.sub(r'\s', '_', subject)
            wiki_subject = 'https://en.wikipedia.org/wiki/{}'.format(subject,)
        event = {
            'title': lastpass,
            'text': None,
            'resolution': 10,
            'ranking': ranking,
            'when_happened': dt,
            'when_original': None,
            'with_thumbnail': thumbnail,
            'content_url': wiki_subject,
            'source_url': self.wiki_url,
            'source_name': 'Wikipedia Event Pages',
            'content_type': kind
        }
        e = self.unscroll_client.create_event(event, self.scroll)
        pprint.pprint(e.json())
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
                        # print("A: {}\n".format(e.get('title')))
                        events.append(e)
                elif last_date is not None:
                    date = self.realday(last_date[0], last_date[1])
                    e = self.wikihtml_to_event(date=date, wikihtml=d,
                                               kind=kind)
                    # print("B: {}\n".format(e.get('title')))                    
                    events.append(e)
        if len(events) > 0:
            return events

    def get_events(self):
        event_types = {'#Events': 'world event',
                       '#Births': 'birth',
                       '#Deaths': 'death'}
        events = []
        for keytype in event_types:
            try:
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
            except IndexError:
                print('No {}'.format(keytype,))
        return events


def __main__(year=None):
    parser = argparse.ArgumentParser(
        description='Get a Wikipedia Year page by year '
        'and turn it into events as well as is possible.')

    
    parser.add_argument('--year',
                        required=True,
                        type=int,
                        help='A year')
    parser.add_argument('--subject',
                        required=False,
                        type=str,
                        help='A subject that has a cluster of Wikipedia pages, like music')    
    args = parser.parse_args()

    if (args.subject is not None and args.year is not None):
        wt = WikipediaText(year=args.year, subject=args.subject)
        events = wt.get_events()
        return True
    
    elif (args.year is not None):
        wt = WikipediaText(args.year)
        events = wt.get_events()
        return True


__main__()
