from bs4 import BeautifulSoup
import requests
from pprint import pprint
from unscroll import UnscrollClient
import datetime
import re
from random import random

URL = 'https://news.microsoft.com/category/press-releases/page/{}/'

c = UnscrollClient(api='http://127.0.0.1',
                   username='ford',
                   password='***REMOVED***')

c.login()
favicon_url = c.fetch_favicon_url('https://www.microsoft.com')
favthumb = c.cache_thumbnail(favicon_url['url'])
print(favthumb)

c.create_or_retrieve_scroll('Microsoft PR',
                            thumbnail=favthumb['url'])

for i in range(1,958):
    pr_url = URL.format(i,)
    print(pr_url)
    r = requests.get(pr_url)
    parsed = BeautifulSoup(r.content, 'html.parser')
    els = parsed.find_all('a', class_='f-post-link')

    events = []

    for el in els:
        href = el.attrs['href']
        _datetime = None
        matches = re.match(r'https://news.microsoft.com/(\d{4})/(\d{2})/(\d{2})', href)

        if matches:
            year = matches.group(1)
            month = matches.group(2)
            day = matches.group(3)
            dt = datetime.datetime(int(year), int(month), int(day), 0, 0)
            _datetime = dt.isoformat()

        title = el.text
        
        event = {
            'media_type': 'text/html',
            'content_type': 'press release',
            'title': title,
            'text': None,
            'ranking': random()/3,
            'when_happened': _datetime,
            'resolution': '10',
            'source_name': 'Microsoft PR',
            'source_url': 'https://news.microsoft.com/',
            'content_url': href,
            'thumbnail': None
        }
        print(title)
        events.append(event)
    c.create_event_batch(events)

print('Done')


