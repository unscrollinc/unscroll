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



def download_images():

    #c = UnscrollClient()
    #c.login()
    #scroll = c.create_or_retrieve_scroll('The Met')
    s = requests.Session()

    headers={'user-agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36'}


    cookies = {'visid_incap_1661977':'qwcvau9oR867N5Om6Wumib30GlsAAAAAQUIPAAAAAADdoCHDnJviQGJrr54oP7Ke',
               'visid_incap_1661922':'lCtv3coJTIeyF5DMIq1XbcL1GlsAAAAAQUIPAAAAAABhH0bWsAqc572sGggwR8Lm',
               'optimizelyEndUserId':'oeu1528493508170r0.018484126855202065',
               '_ga':'GA1.2.719654953.1528493509',
               '__qca':'P0-1257828822-1528493509063',
               '__utma':'85941765.719654953.1528493509.1528494961.1528494961.1',
               '__utmz':'85941765.1528494961.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none)',
               'visid_incap_1662004':'Uth0bQ62RfqddEnycrXaVm6AQVsAAAAAQUIPAAAAAAAes3j0jOJamlarKhGZI+80',
               'incap_ses_892_1661977':'W1oRLWvwFXZNs+5IsQVhDBf/Q1sAAAAA3a9zp+QggKGlFPnJOfE15Q==',
               'incap_ses_892_1661922':'VoMVZQyiX0XZHgBJsQVhDIwJRFsAAAAAgbPVPixNAxVQfWR7JLQ9Ug==',
               '_ceg.s':'pbkfd4',
               '_ceg.u':'pbkfd4',
    }

    conn = sqlite3.connect('cache/met.db')
    conn.row_factory = sqlite3.Row
    
    sqlc = conn.cursor()

    i = 0
    sqlc.execute("SELECT * FROM collection ORDER BY image ASC LIMIT -1 OFFSET {}".format(i))
    
    for row in sqlc.fetchall():
        img = row['image']
        local_img = re.sub(r'https?://images.metmuseum.org/','', img)
        # local_img = re.sub(r'/','__', local_img)        
        
        if img is not None and row['date'] is not None:
            local = 'cache/met-images/{}'.format(local_img,)
            
            i = i + 1
            found = False
            try:
                f = open(local, 'r')
                f.close()
                found = True
            except FileNotFoundError as e:
                try:
                    print('getting image', img)
                    r = s.get(img, headers=headers, cookies=cookies, verify=False)
                    if r.status_code==200 and r.headers.get('content-type') == 'text/html':
                        sys.exit(0)
                    print(r.headers.get('content-type'))
                    p = pathlib.Path(local)
                    p.parent.mkdir(parents=True, exist_ok=True) 
                    f = open(local, 'wb')
                    f.write(r.content)
                    f.close()
                    found = True
                    time.sleep(0)                    
                except ConnectionError as e:
                    print('[dl_met.py] ConnectionError: {}'.format(e,))
                except requests.exceptions.MissingSchema as e:
                    print('[dl_met.py] Bogus image: {}'.format(e,))                    

            print('{}: {}/{}'.format(i, local, found))

#            ud = UnscrollDate(row['date'])
#            if ud.is_okay():

#                with_thumbnail = None
#                if found:
#                    thumb = c.post_thumbnail(local)
#                    if thumb is not None:
#                        with_thumbnail = thumb.get('url')
                        
                # d = {
                #     'title':row['title'],
                #     'text':row['description'],
                #     'resolution':ud.resolution,
                #     'ranking':0,
                #     'content_url':row['url'],
                #     'with_thumbnail':with_thumbnail,
                #     'source_name':'Collection Data for Cooper Hewitt, Smithsonian Design Museum',
                #     'source_url':'https://github.com/cooperhewitt/collection',
                #     'when_happened':ud.when_happened,
                #     'when_original':ud.when_original
                # }
                # # e = c.create_event(d, scroll)
                # # print(d)
    
def __main__():
    # cache_collection()
    download_images()
    # c = UnscrollClient()
    # c.login()
    # c.create_or_retrieve_scroll('The Met')

__main__()
