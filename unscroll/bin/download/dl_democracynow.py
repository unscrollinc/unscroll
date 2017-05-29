import requests
import datefinder
import pprint
import random
import unscroll
import argparse

TERM = "collection:wwIIarchive-audio"


def make_url(term=None):
    if term is not None:
        return """https://archive.org/advancedsearch.php?q=collection%3A%28{}%29&fl%5B%5D=identifier&sort%5B%5D=date+desc&sort%5B%5D=&sort%5B%5D=&rows=5000&page=1&output=json&callback=&save=yes""".format(term,)


def make_details_url(term):
    return "https://archive.org/details/{}&output=json".format(term,)


def __main__():
    parser = argparse.ArgumentParser(
        description='Search archive.org and get things.')
    parser.add_argument('--collection',
                        help='A collection name; in quotes if necessary.')
    parser.add_argument('--title',
                        help='The title of the search results')
    parser.add_argument('--source_link',
                        help='Link to the source')
    parser.add_argument('--source_name',
                        help='Name of the source')
    args = parser.parse_args()
    if (args.collection is None):
        print('No collection!')

    c = unscroll.UnscrollClient(
        api='http://127.0.0.1:8000',
        username='admin',
        password='password')
    c.login()

    c.create_or_retrieve_scroll(args.title, subtitle='From Archive.org')
    url_listing = make_url(args.collection)
    print(url_listing)
    r = requests.request('GET', url_listing)
    d = r.json()
    for doc in d['response']['docs']:
        identifier = doc.get('identifier')
        source = make_details_url(identifier)
        print(source)
        inner_d = requests.request('GET', source)
        data = inner_d.json()
        metadata = data.get('metadata')
        description = metadata.get('description')
        if description is not None:
            description = description[0]
        title = metadata.get('title')[0]
        date = None
        date_a = metadata.get('date')
        if date_a is not None:
            date = date_a[0]
            dates = list(datefinder.find_dates(date))
            if len(dates) > 0:
                date = dates[0]
        fd = data['files']
        content_url = 'https://archive.org/details/{}'\
                      .format(identifier)

        thumbnail_url = None

        for f in fd:
            if thumbnail_url is None and fd[f]['format'] == 'Thumbnail':
                thumbnail = 'https://archive.org/download/{}{}'\
                            .format(identifier, f,)
                print(thumbnail)
                thumbnail_data = c.cache_thumbnail(thumbnail)
                thumbnail_url = thumbnail_data.get('url')

        event = {
            'media_type': 'video/mpeg',
            'content_type': 'news broadcast',
            'title': title,
            'text': description,
            'ranking': random.random(),
            'datetime': date.isoformat(),
            'resolution': 'days',
            'content_url': content_url,
            'source_name': args.source_name,
            'source_url': args.source_link,
            'thumbnail': thumbnail_url
        }
        r = c.create_event(event)
        pprint.pprint(event.get('title'))
        pprint.pprint(r.status_code)
        print(r.reason)


__main__()

