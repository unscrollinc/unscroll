import pprint
import requests
import datetime
import unscroll

NYT_API_KEY = '8871ccee70a8bfc493ce9cc870fd4bf4:12:5862451'

def fetch_month(date):
    r = requests.get("https://api.nytimes.com/svc/archive/v1/{}/{}.json"
                     .format(date.year, date.month,),
                     params={'api-key': NYT_API_KEY})
    return r.json()


def __main__():
    c = unscroll.UnscrollClient(site='127.0.0.1',
                                schema_url='http://127.0.0.1:8000/schema',
                                username="admin",
                                password="password")
    c.login()
    scroll = c.create_scroll('New York Times')
    scroll_url = 'http://{}'.format(scroll,)
    
    dt = datetime.date(1942, 1, 1)
    
    results = fetch_month(dt)
    for doc in results['response']['docs']:
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
            'text': text,
            'datetime': doc['pub_date'],
            'content_url': doc['web_url'],
        }
        res = c.create_event(scroll_url, event)


__main__()
