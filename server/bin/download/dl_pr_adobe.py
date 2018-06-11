from bs4 import BeautifulSoup
import requests
from pprint import pprint
from unscroll import UnscrollClient
import datefinder
from random import random

ADOBE_URL = "http://news.adobe.com/views/ajax?js=1&page={}&view_name=bw_press_release&view_display_id=panel_pane_7&view_args=all%2Fall&view_path=news&view_base_path=null&view_dom_id=1&pager_element=0"

c = UnscrollClient(api='http://127.0.0.1',
                   username='ford',
                   password='***REMOVED***')
c.login()

favicon_url = c.fetch_favicon_url('https://www.adobe.com')
favthumb = c.cache_thumbnail(favicon_url['url'])
c.create_or_retrieve_scroll('Adobe PR',
                            thumbnail=favthumb['url'])

for i in range(1,92):
    pr_url = ADOBE_URL.format(i,)
    r = requests.get(pr_url)
    r_as_data = r.json()
    r_html = r_as_data['display']
    parsed = BeautifulSoup(r_html, 'html.parser')
    els = parsed.find_all('div', class_='view-inner-wrapper')

    events = []

    for el in els:
        date_source = el.find('div', class_='views-field-created')
        date_source_txt = date_source.text
        dates = list(datefinder.find_dates(date_source_txt))
        date = dates[0].isoformat()
        link = el.find('a')
        href = link.attrs['href']
        title = link.text
        event = {
            'media_type': 'text/html',
            'content_type': 'press release',
            'title': title,
            'text': None,
            'ranking': random()/3,
            'when_happened': date,
            'when_original': date_source_txt,            
            'resolution': '10',
            'source_name': 'Adobe PR',
            'source_url': 'http://news.adobe.com/',
            'content_url': 'http://news.adobe.com' + href,
            'thumbnail': None
        }
        events.append(event)
    print(events)        
    c.create_event_batch(events)
    
print('Done')


