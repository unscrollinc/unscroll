from bs4 import BeautifulSoup
import requests
from pprint import pprint
from unscroll import UnscrollClient
import datetime
import re
import datetime
from random import random

USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.104 Safari/537.36'
ISSN = '00111422'

URL = 'https://books.google.com/books/serial/ISSN:{}?rview=1&lr=&sa=N&start={}'

headers = {
    'User-Agent': USER_AGENT,
}

shortmonths = 'Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec'
month_ints = dict([[x, i+1] for i, x in enumerate(shortmonths.split("|"))])


def monthyear(f):
    m = re.match('(' + shortmonths + ').+(\d{4})', f)
    if m:
        return datetime.datetime(int(m.group(2)),
                                 month_ints.get(m.group(1)),
                                 1, 0, 0).isoformat()


r = requests.get(URL.format(ISSN, 600),
                 headers=headers)

soup = BeautifulSoup(r.content, "html.parser")
covers = soup.find_all('div', class_='annotated_cover')

for cover in covers:
    link = cover.find_all('a')[0]['href']
    image = cover.find_all('img')[0]['src']
    month = cover.find_all('span', class_='annotated_more_metadata')[0].text

    event = {'content_url': link,
             'image': image,
             'resolution': 7,
             'date': monthyear(month)}
    pprint(event)
