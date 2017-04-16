import requests
import json
import datetime
import random
import os.path
import unscroll

NYT_API_KEY = '8871ccee70a8bfc493ce9cc870fd4bf4:12:5862451'


def fetch_month(date):
    cache_file = "./cache/nyt/{}_{}.json".format(date.year, date.month,)

    if (os.path.isfile(cache_file)):
        f = open(cache_file, 'r')
        return json.load(f)
    else:
        r = requests.get("https://api.nytimes.com/svc/archive/v1/{}/{}.json"
                         .format(date.year, date.month, date.day),
                         params={'api-key': NYT_API_KEY})
        with open(cache_file, 'wb') as f:
            for chunk in r.iter_content(chunk_size=128):
                f.write(chunk)
        return r.json()


def doc_to_data(doc):
    byline = ""
    _bl = doc.get('byline')
    if _bl is not None and len(_bl) > 0:
        byline = doc.get('byline').get('original')
    title = "{}, by {}".format(doc['headline']['main'], byline,)
    title = title[0:127]
    text = doc['lead_paragraph']
    if text is None:
        text = "..."
    event = {
        'mediatype': "text/html",
        'resolution': 'days',
        'title': title,
        'ranking': random.random(),
        'text': text,
        'datetime': doc['pub_date'],
        'content_url': doc['web_url'],
    }
    return event

def __main__():
    c = unscroll.UnscrollClient(api='http://127.0.0.1:8000',
                                username="admin",
                                password="password")
    c.login()
    scroll_url = c.create_scroll('New York Times')
    print(scroll_url)
    dt = datetime.date(1942, 1, 5)
    results = fetch_month(dt)
    docs = results['response']['docs']
    parsed = [doc_to_data(x) for x in docs]
    chunks = [parsed[x:x+100] for x in range(0, len(parsed), 100)]
    for chunk in chunks:
        for doc in chunk:
            res = c.create_event(scroll_url, doc)
            print(res)

__main__()
