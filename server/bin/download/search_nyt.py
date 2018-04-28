import requests
import random
import unscroll
import argparse
import math
from time import sleep
import pprint

NYT_API_KEY = '8871ccee70a8bfc493ce9cc870fd4bf4:12:5862451'

# The NYT search API doesn't allow queries after 120 pages offset, so
# you can gather 1200 items or so and then need to chill.
# 
# It's stressful.

def do_search(term=None, page=None, end_date=None):
    print('searching for page {} of {}'.format(page, term))
    r = requests.get("https://api.nytimes.com/svc/search/"
                     + "v2/articlesearch.json",
                     params={'api-key': NYT_API_KEY,
                             'sort': "newest",
                             'q': term,
                             'end_date':end_date,
                             'page': page})
    pprint.pprint(r.json)
    return r.json()


def doc_to_data(doc=None,
                client=None):
    title = None
    byline = None
    _bl = doc.get('byline')
    if _bl is not None and len(_bl) > 0:
        byline = doc.get('byline').get('original')
        title = "{}, {}".format(doc['headline']['main'], byline,)
    else:
        title = "{}".format(doc['headline']['main'])
    text = doc.get('lead_paragraph')

    multi = doc.get('multimedia')
    thumb = None
    if (multi is not None and len(multi) > 0):
        for el in multi:
            if ('thumbnail' == el.get('subtype')):
                thumb_url = 'http://www.nytimes.com/{}'.format(el.get('url'))
                thumb_dict = client.cache_thumbnail(thumb_url)
                thumb = thumb_dict.get('url')

    event = {
        'mediatype': "text/html",
        'contenttype': doc.get('document_type'),
        'resolution': 'days',
        'title': title,
        'ranking': random.random(),
        'text': text,
        'thumbnail': thumb,
        'datetime': doc.get('pub_date'),
        'source_name': 'New York Times Search',
        'source_url': 'https://developer.nytimes.com/'
        + 'article_search_v2.json#/Console/GET/articlesearch.json',
        'content_url': doc.get('web_url'),
    }
    return event


def __main__():
    parser = argparse.ArgumentParser(
        description='Search the NYTimes and turn the results into events.')
    parser.add_argument('--term',
                        help='A search term; in quotes if necessary.')
    parser.add_argument('--page',
                        type=int,
                        help='The page of search results (offset by 10)')
    parser.add_argument('--end_date',
                        type=str,
                        help='An end date in YYYYMMDD format')
    args = parser.parse_args()
    if (args.term is None):
        print('No args!')

    if (args.term is not None):
        results = do_search(term=args.term,
                            page=args.page,
                            end_date=args.end_date)
        no_docs = results['response']['meta']['hits']
        pages = None
        docs = None
        if (no_docs is not None and no_docs > 0):
            pages = math.ceil(no_docs/10) - args.page * 10

            # We actually log in now
            c = unscroll.UnscrollClient(api='http://127.0.0.1:8000',
                                        username="admin",
                                        password="password")
            c.login()
            c.create_or_retrieve_scroll('NYT search: “{}”'.format(args.term))

            docs = results['response']['docs']
            docs_to_save = [doc_to_data(doc=doc, client=c) for doc in docs]
            c.create_event_batch(docs_to_save)

            # now we keep going
            for page in range(args.page, pages + 1):
                more_results = do_search(term=args.term, page=page)
                more_docs = more_results['response']['docs']
                more_docs_to_save = [doc_to_data(doc=doc, client=c)
                                     for doc in more_docs]
                c.create_event_batch(more_docs_to_save)
                sleep(5)
                print('saved {} out of {}'.format(page, pages + 1))


__main__()
