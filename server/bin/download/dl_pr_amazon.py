from bs4 import BeautifulSoup
import requests
import re
from unscroll import UnscrollClient
from unscrolldate import UnscrollDate
import random

def get_releases(api, scroll):
    urls = ["http://phx.corporate-ir.net/phoenix.zhtml?c=176060&p=irol-news&nyo={}".format(o)
            for o in range(25)]

    for url in urls:
        print(url)
        r = requests.get(url)
        parsed = BeautifulSoup(r.content, 'lxml')
        trs = parsed.select('tr.ccbnBgTblOdd,tr.ccbnBgTblEven')
        for el in trs:
            try:
                tds = el.select('td')
                date = tds[0]
                when_original = date.get_text()

                ud = UnscrollDate(when_original)

                link = tds[1]
                title = link.select('a')[0].get_text()
                content_url = 'http://phx.corporate-ir.net/' + link.select('a')[0]['href']
                d = {
                    'title':title,
                    'text':None,
                    'resolution':ud.resolution,
                    'ranking':random.random(),
                    'content_url':content_url,
                    'with_thumbnail':None,
                    'source_name':'Amazon PR Page',
                    'source_url':'http://phx.corporate-ir.net/phoenix.zhtml?c=176060&p=irol-news&nyo=10',
                    'when_happened':ud.when_happened,
                    'when_original':ud.when_original
                }
                print (ud.when_happened, title, content_url)
                
                e = api.create_event(d, scroll)
                print(e.content)
            except IndexError as e:
                print('[dl_pr_google.py] IndexError: {}'.format(e,))

def __main__():

    c = UnscrollClient()
    c.login()    
    c.delete_scroll_with_title('Amazon PR')

    thumbnail = 'http://media.corporate-ir.net/media_files/IROL/17/176060/img/logos/amazon_logo_RGB.jpg'
    favthumb = c.cache_thumbnail(thumbnail)

    scroll = c.create_or_retrieve_scroll('Amazon PR',
                                         description='A set of press releases from the Amazon Press Room.',
                                         link='http://phx.corporate-ir.net/phoenix.zhtml?c=176060&p=irol-news&nyo=0',
                                         citation='Amazon Press Room',
                                         with_thumbnail=favthumb.get('url'))
    print(scroll)

    get_releases(c, scroll)

__main__()



