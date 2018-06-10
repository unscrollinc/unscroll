import bs4
import requests
import dateparser
from datetime import datetime
from unscroll import UnscrollClient
import re
import random
import pprint

# TODO Editors and Tags and a thumbnail

def li_to_event(li):
    hrefs = li.select('h2 a')
    deliverer = li.select('p.deliverer')[0].text
    tags = ', '.join([tag.get_text('', strip=True) for tag in li.select('ul.taglist > li')])
    editors = ', '.join([tag.get_text('', strip=True) for tag in li.select('ul.editorlist > li')])
    details = li.select('p.pubdetails')
    a = hrefs[0]
    date = details[0].text[:10]
    d = dateparser.parse(date)
    d2 = datetime.combine(d, datetime.min.time())
    d3 = d2.isoformat()              
    e = {'title':a.text,
         'text':'By {}. Editors: {}. Tags: {}.'.format(deliverer, editors, tags,),
         'mediatype': "text/html",
         'resolution': '7',
         'ranking':0,
         'content_url': a['href'],
         'source_url':'https://www.w3.org/TR/',
         'source_name':'W3C All Standards and Drafts',
         'when_happened':d3,
    }
    return e

FILE='cache/www.html'
URL='https://www.w3.org/TR/'

def __main__():
    def get_content():
        try:
            return open(FILE)
        except FileNotFoundError as e:
            resp = requests.get(URL)
            f = open(FILE, 'wb')
            f.write(resp.content)
            print(resp.content)
            f.close()
            return resp.content
        return None

    c = get_content()
    soup = bs4.BeautifulSoup(get_content(), "lxml")
    lis = soup.select('ul#container > li')
    events = [li_to_event(li) for li in lis]
    c = UnscrollClient()

#    W3C Web Standards
    c.__batch__(
        api='http://127.0.0.1:8000',
        username='ford',
        password='***REMOVED***',
        scroll_title='W3C Web Standards',
        events=events
    )
    print(len(events))


__main__()

# <li data-title="aria in html" data-tag="accessibility" data-status="wd" data-version="latest upcoming ed">
#   <div class="profile">WD</div>
#   <h2 class="WorkingDraft"><a href="https://www.w3.org/TR/2018/WD-html-aria-20180519/" title="Latest draft of ARIA in HTML formally approved by the group">ARIA in HTML</a></h2>
#   <p class="deliverer">Web Platform Working Group</p>
#   <p class="pubdetails">2018-05-19 - <a title="ARIA in HTML publication history" href="/standards/history/html-aria">History</a>
#     - <a href="https://w3c.github.io/html-aria/" title="Latest editor's draft of ARIA in HTML">Editor's Draft</a>
#   </p>
#   <ul class="editorlist">
#     <li>Steve Faulkner
#   </li></ul>
#   <ul class="taglist">
#     <li class="accessibility">Accessibility
#   </li></ul>
# </li>
