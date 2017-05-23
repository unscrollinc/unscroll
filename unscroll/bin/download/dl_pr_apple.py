from bs4 import BeautifulSoup
import requests
import favicon
from pprint import pprint
from unscroll import UnscrollClient
from dateparser import parse
from random import random

APPLE_URL = 'https://www.apple.com'
APPLE_PR_URL = 'https://www.apple.com/pr/library'

c = UnscrollClient(api='http://127.0.0.1:8000',
                   username='admin',
                   password='password')

c.login()
favicon_url = c.fetch_favicon_url(APPLE_URL)
favthumb = c.cache_thumbnail(favicon_url['url'])
print(favthumb)

c.create_or_retrieve_scroll('Apple Press Releases, 2000-2017',
                            thumbnail=favthumb['url'])


for i in range(2000,2018):
    pr_url = '{}/{}'.format(APPLE_PR_URL, i,)
    print(pr_url)
    r = requests.get(pr_url)
    parsed = BeautifulSoup(r.content, 'html.parser')
    dts = parsed.find_all('dt')
    for dt in dts:
        _date = dt.text
        date = parse(_date)
        inside = dt.find_next_sibling('dd')
        links = inside.find_all('a')
        for link in links:
            href = '{}/{}'.format(APPLE_URL, link['href'])

            r2 = requests.get(href)
            parsed2 = BeautifulSoup(r2.content, 'html.parser')
            content = parsed2.find(id='content')
            text = ''
            if content is not None:
                rough = content.find_all('p')
                text = " ".join([str(x) for x in rough[0:1]])
    
            title = "".join([x for x in link.stripped_strings])
            event = {
                'media_type': 'text/html',
                'content_type': 'press release',
                'title': title,
                'text': text,
                'ranking': random(),
                'datetime': date,
                'resolution': 'days',
                'content_url': href,
                'thumbnail': None
                }
            res = c.create_event(event)
            pprint(event)
