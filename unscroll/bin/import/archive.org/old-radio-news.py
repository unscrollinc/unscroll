from internetarchive import search_items
from internetarchive import get_item
from datetime import datetime, timedelta
from dateparser import parse
import json
import re
import urllib
#from requests.auth import HTTPBasicAuth

from coreapi import transports, Document, Link, Client

DOWNLOAD_URL = 'https://archive.org/download/'
DETAILS_URL = 'https://archive.org/details/'
METADATA_URL = 'https://archive.org/metadata/'
SEARCH = "collection:wwIIarchive-audio"

# SOMETHING IS UP WHERE THIS PUTS DATES OF JUST YEARS AS JANUARY 3

class Collection:
    id = None
    image_url = None
    source = None
    description = None
    
class File: 
    collection = None
    datetime = None
    url = None
    title = None
    datetime = None 
    mediatype = None
    sourceDate = None
   
    def dicts(self):
        as_dict = self.__dict__
        as_dict['datetime'] = self.datetime.isoformat()
        return as_dict


def fixup_dates(title, datetime):

    result = {'datetime':datetime, 'title':title}
    
    date_re = "\d{2,4}\W\d{1,2}(\W\d{1,2})?"
    date_matcher = re.compile(date_re)
    date_matcher_post_space = re.compile(date_re + "\s*")    
    m = re.match(date_matcher, title)

    if m is not None:
        d = m.group(0)
        dparse = parse(d, settings={'PREFER_DAY_OF_MONTH': 'first'})
        if dparse is not None:
            dfixed = datetime.combine(dparse, datetime.min.time())
            result['datetime']=dfixed
            m = re.sub(date_matcher_post_space, '', title)
            if m is not None:
                result['title']=m

    return result
    
def search(search_term):
    dictset = []
    
    for item in search_items(search_term).iter_as_items():
        files = [file_meta for file_meta in item.files
                 if file_meta["format"] == "VBR MP3"]
        
        if (len(files) > 0):
            # Make Collection
            item_datetime = None
            if 'date' in item.metadata:
                item_date = parse(item.metadata['date'])
                item_datetime = datetime.combine(item_date, datetime.min.time())
            
                c = Collection()
                c.id = item.identifier
                c.source = "{}{}".format(DETAILS_URL,
                                         item.identifier)
                c.description = None # item.metadata['description']
            
                image_ref = [image for image in item.files if
                             (image["format"] == "GIF" or
                              image["format"] == "PNG")][0]
                c.image_url = None

                for fdict in files:
                    f = File()
#                    f.filename = None
                    f.content_url = "{}{}/{}".format(DOWNLOAD_URL,
                                                     item.identifier,
                                                     urllib.parse.quote_plus(fdict['name']))
                    f.mediatype = 'audio/mpeg'
                    f.source_date = item.metadata['date']
                    title = 'Untitled'
                    if 'title' in fdict:
                        title = fdict['title']
                    r = fixup_dates(title, item_datetime)
                    f.datetime = r['datetime']
                    f.text = "..."
                    f.title = item.metadata['title'] + '/' +  r['title']
                    
                    if f.datetime is not None:
                        dictset.append(f.dicts())
    return dictset

def main(client, scroll_id):
    d = search(SEARCH)
    for event in d:
        event['scroll'] = scroll_id
        print(event)
        try:
            client2.action(schema, ['events', 'create'],
                           params=event)
        except Exception as e:
            print(e)
        finally:
            pass

#   create(scroll, title, text, datetime, image, [mediatype], [source_url], [source_date], [content_url])
#   print('var oldRadioNews =', json.dumps(d, sort_keys=True, indent=4), ";\n")
    
    
if __name__ == "__main__":
    #login
    client = Client()
    schema = client.get('http://127.0.0.1:8000/schema')
    key = client.action(schema, ['rest-auth', 'login', 'create'],
                        params={"username": "admin",
                                "password": "password"})
    #okay
    credentials = {'127.0.0.1': 'Token {}'.format(key['key'],)}
    transport = [transports.HTTPTransport(credentials=credentials)]
    client2 = Client(transports=transport)
    schema = client2.get('http://127.0.0.1:8000/schema')
    new_scroll = client2.action(schema, ['scrolls', 'create'], params={"title": "WWII Radio News"})
    scroll_d = dict(new_scroll)
    scroll_url = "http://127.0.0.1:8000/scrolls/{}/".format(scroll_d['id'])
    print(scroll_url)
    main(client2, scroll_url)
