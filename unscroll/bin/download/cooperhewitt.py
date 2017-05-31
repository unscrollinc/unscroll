from bs4 import BeautifulSoup
import re
import pprint
import requests
import random
from unscroll import UnscrollClient
import argparse
import glob
import json
import datefinder

def extract_date(o):
    if o is None:
        return None

    centuryish = re.search(r'(\d\d?)(th|st|rd|nd)', o)
    bc = re.search(r'BC', o)
    yearish = re.search(r'(\d{3}\d?)', o)

    if centuryish:
        c = int(centuryish.group(1))
        if bc:
            c = 0 - c
        iso = "{}-{:02d}-{:02d}T00:00:00".format(100*(c-1),
                                                 1,
                                                 1)
        return {'resolution': 2,
                'datetime': iso}

    elif yearish:
        y = int(yearish.group(1))
        iso = "{}-{:02d}-{:02d}T00:00:00".format(y, 1, 1)
        return {'resolution': 4,
                'datetime': iso}
    else:
        dates = list(datefinder.find_dates(o))
        if (len(dates) > 0):
            return {'resolution': 0,
                    'datetime': dates[0].isoformat()}
    return None


def chjson_to_event(j=None, client=None):
    date = j.get('date')
    if (date is None):
        return None

    images = j.get('images')
    urls = [x.get('sq').get('url')
            for x in images
            if ('sq' in x and x['sq']['is_primary'] == '1')]
    img = urls[0] if len(urls) > 0 else None

    if (img is None):
        return None

    else:
        title = j.get('title')
        content_url = j.get('url')
        
        _d = extract_date(date)
        if _d is not None:
            description = ''
            if j.get('description'):
                description = "{}".format(j.get('description'))

            participants = []
            if j.get('participants'):
                for p in j.get('participants'):
                    name = p.get('person_name')
                    role = p.get('role_name')
                    if name is not None and role is not None:
                        text = "{}: {}".format(role, name)
                        participants.append(text)

            if len(participants) > 0:
                full_description = "; ".join(participants)
                title = "{} ({})".format(title, full_description,)

            if j.get('gallery_text'):
                description = "{} ({})".format(description,
                                               j.get('gallery_text'))
            if j.get('justification'):
                description = "{} ({})".format(description,
                                               j.get('justification'))
            if j.get('creditline'):
                description = "{} <i>{}</i>".format(description,
                                                    j.get('creditline'))
            if j.get('dimensions'):
                description = "{} ({})".format(description,
                                               j.get('dimensions'))
            if j.get('type'):
                description = "{} [{}]".format(description,
                                               j.get('type'))

            thumbnail_url = None
            if img is not None:
                thumbnail_d = client.cache_thumbnail(img)
                if (thumbnail_d is not None):
                    thumbnail_url = thumbnail_d.get('url')

            event = {
                'title': title,
                'text': description,
                'resolution': _d.get('resolution'),
                'ranking': random.random()/2,
                'datetime': _d.get('datetime'),
                'thumbnail': thumbnail_url,
                'content_url': content_url,
                'source_url': 'https://cooperhewitt.org',
                'source_name': 'Cooper Hewitt Museum',
                'content_type': 'museum/artifact'
            }
            return event


def __main__(year=None):
    i = 0
    c = UnscrollClient(api='http://127.0.0.1:8000',
                       username='admin',
                       password='password')
    c.login()
    c.create_or_retrieve_scroll('Cooper-Hewitt')

    for filename in glob.iglob('/Users/ford/dev/collection/objects/**/*.json', recursive=True):
        j = open(filename)
        p = json.load(j)
        event = chjson_to_event(j=p, client=c)
        if event is not None:
            e = c.create_event(event)
            i = i + 1
            pprint.pprint(i)

__main__()
