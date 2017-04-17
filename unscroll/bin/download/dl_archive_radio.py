from internetarchive import search_items
from internetarchive import get_item
from datetime import datetime, timedelta
from dateparser import parse
from unscroll import UnscrollClient
import urllib
import re

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
    result = {'datetime': datetime, 'title': title}
    date_re = "\d{2,4}\W\d{1,2}(\W\d{1,2})?"
    date_matcher = re.compile(date_re)
    date_matcher_post_space = re.compile(date_re + "\s*")
    m = re.match(date_matcher, title)

    if m is not None:
        d = m.group(0)
        dparse = parse(d, settings={'PREFER_DAY_OF_MONTH': 'first'})
        if dparse is not None:
            dfixed = datetime.combine(dparse, datetime.min.time())
            result['datetime'] = dfixed
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
                item_datetime = datetime.combine(item_date,
                                                 datetime.min.time())
            
                c = Collection()
                c.id = item.identifier
                c.source = "{}{}".format(DETAILS_URL,
                                         item.identifier)
                c.description = None

                image_ref = [image for image in item.files if
                             (image["format"] == "GIF" or
                              image["format"] == "PNG")][0]
                c.image_url = None

                for fdict in files:
                    f = File()
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


def main():
    print("fetching")
    events = search(SEARCH)
    print("saving")    
    c = UnscrollClient(api='http://127.0.0.1:8000',
                       username='admin',
                       password='password',
                       scroll_title='Archive.org WWII Radio',
                       events=events)


if __name__ == "__main__":
    main()
    
