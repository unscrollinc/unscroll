import requests
import datefinder
import pprint
import random
import unscroll
import argparse

TERM = "collection:wwIIarchive-audio"


def make_url(term=None):
    if term is not None:
        return """https://self.archive.org/advancedsearch.php?"""
    + """q=collection%3A{}&fl%5B%5D=identifier&sort%5B%5D=identifier+asc"""
    + """&sort%5B%5D=&sort%5B%5D=&rows=6000"""
    + """&page=1&output=json&save=yes""".format(term,)


def make_details_url(term):
    return "https://archive.org/details/{}&output=json".format(term,)


def __main__(term=None, title=None):

    parser = argparse.ArgumentParser(
        description='Search archive.org and get things.')
    parser.add_argument('--term',
                        help='A search term; in quotes if necessary.')
    parser.add_argument('--title',
                        type=int,
                        help='The title of the search results')
    args = parser.parse_args()
    if (args.term is None):
        print('No term!')

    c = unscroll.UnscrollClient(
        api='http://127.0.0.1:8000',
        username='admin',
        password='password')
    c.login()

    c.create_scroll(title, subtitle='From Archive.org')

    r = requests.request('GET', make_url(term))
    d = r.json()
    for doc in d['response']['docs']:
        events = []
        source = make_details_url(doc['identifier'])
        print(source)
        inner_d = requests.request('GET', source)
        data = inner_d.json()
        coll = data['metadata']['identifier'][0]
        coll_title = data['metadata']['title'][0]
        fd = data['files']
        for f in fd:
            if fd[f]['format'] == 'VBR MP3':
                dates = list(datefinder.find_dates(f))
                if len(dates) > 0:
                    dt = dates[0]
                    title = f
                    myfile = fd[f]
                    if 'title' in myfile:
                        title = myfile['title']
                    elif 'creator' in myfile:
                        title = myfile['creator']
                    elif 'artist' in myfile:
                        title = myfile['artist']

                    url = 'https://archive.org/download/{}{}'.format(coll, f,)
                    event = {
                        'media_type': 'audio/mpeg',
                        'content_type': 'radio broadcast',
                        'title': title,
                        'text': coll_title,
                        'ranking': random.random(),
                        'datetime': dt.isoformat(),
                        'resolution': 'days',
                        'content_url': url,
                        'thumbnail': None
                    }
                    c.create_event(event)
                    pprint.pprint(event['title'])                    


__main__(term='democracy_now_vid',
         title='Democracy Now!')
