from bs4 import BeautifulSoup
import requests
import favicon
from pprint import pprint
from unscroll import UnscrollClient
from dateparser import parse
import datefinder
from random import random
import re

APPLE_URL = 'https://www.apple.com'
APPLE_PR_URL = 'https://www.apple.com/pr/library'

c = UnscrollClient(api='http://127.0.0.1',
                   username='admin',
                   password='password')

c.login()
favicon_url = c.fetch_favicon_url(APPLE_URL)
favthumb = c.cache_thumbnail(favicon_url['url'])
print(favthumb)

c.create_or_retrieve_scroll('Apple Press Releases, 2000-2017',
                            thumbnail=favthumb['url'])


for i in range(1,66):
    pr_url = 'https://www.apple.com/newsroom/archive/?page={}'.format(i,)
    print(pr_url)
    r = requests.get(pr_url)
    parsed = BeautifulSoup(r.content, 'html.parser')
    dts = parsed.find_all('a', class_='result__item')
    events = []
    for dt in dts:
        title = dt.find('h3').text
        text = dt.find('p').text
        dateText = dt.find('span').text
        dates = list(datefinder.find_dates(dateText))
        date = dates[0].isoformat()
        thumbnail_url = None
        imgSrc = dt.find('style')
        if imgSrc is not None:
            found = re.search(r'url\(([^\)]+)\)', imgSrc.text)
            if found:
                image_url = "{}{}".format(APPLE_URL, found.group(1))
                thumbnail_d = c.cache_thumbnail(image_url)
                if (thumbnail_d is not None):
                    thumbnail_url = thumbnail_d.get('url')
        event = {
            'media_type': 'text/html',
            'content_type': 'press release',
            'title': title,
            'text': text,
            'ranking': random()/3,
            'datetime': date,
            'resolution': '10',
            'source_name': 'Apple PR',
            'source_url': 'https://www.apple.com/newsroom/archive/',
            'content_url': APPLE_URL + dt.attrs['href'],
            'thumbnail': None
        }
        pprint(event)
        events.append(event)
    
    c.create_event_batch(events)
    print('Saved {} events.'.format(len(events)))

print('Done')


