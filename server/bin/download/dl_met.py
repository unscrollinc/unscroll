import urllib3
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
import sys

urllib3.disable_warnings()


def cache_collection():
    for i in range(248,3201):
        offset = i * 100
        url = "https://www.metmuseum.org/api/collection/collectionlisting?artist=&department=&era=&geolocation=&material=&offset={}&pageSize=0&perPage=100&showOnly=withImage&sortBy=Relevance&sortOrder=asc"\
            .format(offset)
        print(url)
        headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'}
        r = requests.get(url, headers=headers)
        data = r.json()
        if 'results' in data:
            local = "cache/met/{:08d}.json".format(offset)
            f = open(local, 'wb')
            f.write(r.content)
            print(local)
            f.close()
            time.sleep(6)
        else:
            print("NO RESULTS IN DATA AT ITERATION {}, JSON OFFSET {}".format(i, offset))
            sys.exit(0)

def file_exists(fname):
    found = False
    try:
        f = open(fname, 'r')
        f.close()
        found = True
    except FileNotFoundError:
        found = False
    return found

def save_met():

    c = UnscrollClient()
    c.login()
    c.delete_scroll_with_title('The Met')
    scroll = c.create_or_retrieve_scroll('The Met')
    s = requests.Session()

    conn = sqlite3.connect('cache/met.db')
    conn.row_factory = sqlite3.Row
    
    sqlc = conn.cursor()

    sqlc.execute("SELECT * FROM collection LIMIT -1 OFFSET 0")


    
    for row in sqlc.fetchall():

        ud = UnscrollDate(row['date'])
        
        if ud.is_okay():
            with_thumbnail = None
            found = False
            img = row['image']
            local_img = re.sub(r'https?://images.metmuseum.org/','', img)

            medium = ''
            if 'medium' in row:
                medium = ' ({})'.format(row['medium'])
            
            if img is not None and row['date'] is not None:
                local = 'cache/met-images/{}'.format(local_img,)
                if file_exists(local):
                    thumb = c.post_thumbnail(local)
                    if thumb is not None:
                        with_thumbnail = thumb.get('url')

                        d = {
                            'title':row['title'] + medium,
                            'text':row['description'],
                            'resolution':ud.resolution,
                            'ranking':0,
                            'content_url':'https://www.metmuseum.org{}'.format(row['url'],),
                            'with_thumbnail':with_thumbnail,
                            'source_name':'The Met',
                            'source_url':'https://www.metmuseum.org/',
                            'when_happened':ud.when_happened,
                            'when_original':ud.when_original
                        }
                        e = c.create_event(d, scroll)
                        print(e)
    
def __main__():
    # cache_collection()
    # download_images()
    save_met()


__main__()
