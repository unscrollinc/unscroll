from bs4 import BeautifulSoup
import requests
import re
from unscroll import UnscrollClient
from unscrolldate import UnscrollDate

def get_blogspot_releases(api):
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
                    'ranking':0,
                    'content_url':content_url,
                    'with_thumbnail':None,
                    'source_name':'Amazon PR Page',
                    'source_url':'http://phx.corporate-ir.net/phoenix.zhtml?c=176060&p=irol-news&nyo=10',
                    'when_happened':ud.when_happened,
                    'when_original':ud.when_original
                }
                print (ud.when_happened, title, content_url)
                
                e = api.create_event(d)
                print(e.content)
            except IndexError as e:
                print('[dl_pr_google.py] IndexError: {}'.format(e,))

def __main__():

    c = UnscrollClient(api='http://127.0.0.1:8000',
                       username='ford',
                       password='***REMOVED***')
    c.login()
    c.create_or_retrieve_scroll('Amazon PR')
    get_blogspot_releases(c)

__main__()



