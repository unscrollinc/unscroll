from collections import Counter
from pprint import pprint
import json
import datetime
from dateutil import parser
import re
import sqlite3
import requests
import hashlib
import time
from unscrolldate import UnscrollDate
from unscroll import UnscrollClient
import pathlib

def __main__():

    c = UnscrollClient(api='http://127.0.0.1:8000',
                       username='ford',
                       password='***REMOVED***')
    c.login()
    c.create_or_retrieve_scroll('Cooper-Hewitt Museum Collection')

    conn = sqlite3.connect('cooper/objects.db')
    conn.row_factory = sqlite3.Row
    
    sqlc = conn.cursor()

    i = 0
    sqlc.execute("SELECT * FROM objects LIMIT -1 OFFSET {}".format(i))
    for row in sqlc.fetchall():

        if row['primary_image'] is not None and row['date'] is not None:
            # switch to the 300x300 thumbnail
            sq = re.sub('z\.jpg', 'sq.jpg', row['primary_image'])
            local_sq = re.sub(r'https?://','',sq)
            local = 'cooper/{}'.format(local_sq,)
            
            i = i + 1
            found = False
            try:
                f = open(local, 'r')
                f.close()
                found = True
            except FileNotFoundError as e:
                try:
                    r = requests.get(sq)
                    p = pathlib.Path(local)
                    p.parent.mkdir(parents=True, exist_ok=True) 
                    f = open(local, 'wb')
                    f.write(r.content)
                    f.close()
                    found = True
                except ConnectionError as e:
                    print('[cooperhewitt2.py] ConnectionError: {}'.format(e,))

            print('{}: {}/{}'.format(i, local, found))
            
            ud = UnscrollDate(row['date'])
            if ud.is_okay():

                with_thumbnail = None
                if found:
                    thumb = c.post_thumbnail(local)
                    if thumb is not None:
                        with_thumbnail = thumb.get('url')
                        
                d = {
                    'title':row['title'],
                    'text':row['description'],
                    'resolution':ud.resolution,
                    'ranking':0,
                    'content_url':'https://collection.cooperhewitt.org/objects/{}/'.format(row['id'],),
                    'with_thumbnail':with_thumbnail,
                    'source_name':'Collection Data for Cooper Hewitt, Smithsonian Design Museum',
                    'source_url':'https://github.com/cooperhewitt/collection',
                    'when_happened':ud.when_happened,
                    'when_original':ud.when_original
                }
                e = c.create_event(d)
                # print(e.json())
    

    
__main__()
    
