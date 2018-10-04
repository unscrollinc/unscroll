from bs4 import BeautifulSoup
import requests
import re
from unscroll import UnscrollClient
from unscrolldate import UnscrollDate

def get_blogspot_releases(api):
    urls = ["http://googlepress.blogspot.com/{}/{:02d}".format(y,m)
            for y in range(1999,2016)
            for m in range(1,13)]

    for url in urls:
        print(url)
        r = requests.get(url)
        parsed = BeautifulSoup(r.content, 'lxml')
        els = parsed.select('ul.press-releases li')
        for el in els:
            try:

                when_original = el.select('span.press-date')[0].get_text()
                title = el.select('a')[0].get_text()
                content_url = el.select('a')[0]['href']
                _d = re.sub('^[^ ]+ ', '', when_original)
                ud = UnscrollDate(_d)
                d = {
                    'title':title,
                    'text':None,
                    'resolution':ud.resolution,
                    'ranking':0,
                    'content_url':content_url,
                    'with_thumbnail':None,
                    'source_name':'Google PR page on Blogspot, 1999-2015',
                    'source_url':'http://googlepress.blogspot.com/',
                    'when_happened':ud.when_happened,
                    'when_original':ud.when_original
                }
                e = api.create_event(d)
                print(e)
            except IndexError as e:
                print('[dl_pr_google.py] IndexError: {}'.format(e,))

def __main__():

    c = UnscrollClient(api='http://127.0.0.1:8000',
                       username='ford',
                       password='4tune500')
    c.login()
    c.create_or_retrieve_scroll('Google PR')
    get_blogspot_releases(c)

__main__()
