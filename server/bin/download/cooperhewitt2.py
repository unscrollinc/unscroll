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

def __main__():

    c = UnscrollClient(api='http://127.0.0.1:8000',
                       username='ford',
                       password='***REMOVED***')
    c.login()
    c.create_or_retrieve_scroll('Cooper-Hewitt Museum Collection')

    conn = sqlite3.connect('cooper/objects.db')
    conn.row_factory = sqlite3.Row
    
    sqlc = conn.cursor()

    sqlc.execute("SELECT * FROM objects")
    
    for row in sqlc.fetchall():

        if row['primary_image'] is not None and row['date'] is not None:
            # switch to the 300x300 thumbnail
            sq = re.sub('z\.jpg', 'sq.jpg', row['primary_image'])
            local_sq = re.sub(r'https?://','',sq)
            local = 'cooper/{}'.format(local_sq,)
            print(local)

            try:
                f = open(local, 'r')
                f.close()
            except FileNotFoundError as e:
                r = requests.get(sq)
                f = open(local, 'wb')
                f.write(r.content)
                f.close()

            
            ud = UnscrollDate(row['date'])
            
            if ud.is_okay():
                thumb = c.post_thumbnail(local)
                d = {
                    'title':row['title'],
                    'text':row['description'],
                    'resolution':ud.resolution,
                    'ranking':0,
                    'content_url':'https://collection.cooperhewitt.org/objects/{}/'.format(row['id'],),
                    'with_thumbnail':thumb.get('url'),
                    'when_happened':ud.when_happened,
                    'when_original':ud.when_original
                }
                e = c.create_event(d)
                print(e.json())
    

    
__main__()
    
