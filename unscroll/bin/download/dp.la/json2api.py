import json
import ijson
import pprint
import re
import hashlib
from datetime import datetime, timedelta
from dateparser import parse

hasher = hashlib.sha256()

def formatify(lines):
    
    def tidy(text):
        if score(text) < 0:
            return 'unknown'
        text = text.lower()
        text = re.sub('gouache.+$', 'gouache', text)        
        text = re.sub('\W+$', '', text)
        text = re.sub('\W+', '-', text)

        return text
    
    def score(text):
        score = 0

        # digits
        m = re.search('\d', text)
        if (m is not None):
            score = score - 10

        # parentheticals
        m = re.search('\(', text)
        if (m is not None):
            score = score + 1

        # text
        m = re.search('sculpture|print|flier|folio|manuscript|pottery|paint|print', text, re.IGNORECASE)
        if (m is not None):
            score = score + 1
            
        return score

    if lines is not None:
        if type(lines) is str:
            return tidy(lines)
        
        _line = lines[0]
        for line in lines[0:]:
            if score(line) > score(_line) \
               or len(line) < len(_line):
                _line = line
        return tidy(_line)

    return 'unknown'

def load_json(filename):

    def fixl(l):
        if l is None:
            return None
        if type(l) is list:
            return " ".join(l)
        if type(l) is str:
            return l
        
    def fixup_date(dt):
        result = None
        length = 0
        if dt is not None:
            length = len(dt)
            dparse = parse(dt, settings={'PREFER_DAY_OF_MONTH': 'first'})
            if dparse is not None:
                dfixed = datetime.combine(dparse, datetime.min.time())
                result = dfixed.isoformat()
        return [result, length]
    
    f = open(filename, 'r')
    objects = ijson.items(f, 'item._source')
    for o in objects:
        src = o['sourceResource']
        begin = None
        date = src.get('date')
        if date is not None:
            begin = date.get('begin')
            original = date.get('displayDate')
            [adj_date, len_date] = fixup_date(begin)
            
        x = {
            'title':src.get('title'),
            'src_url':'https://dp.la/item/{}'.format(o.get('id')),
            'source_url':o.get('isShownAt'),
            'image_url':o.get('object'),
            'image_sum':hashlib.md5(bytearray(o.get('object'), 'utf8')).hexdigest(),
            'mediatype':'art/' + formatify(src.get('format')),
            'description':fixl(src.get('description')),
            'datetime':adj_date,
            'original_date':original,
            'resolution':len_date
            }
        print(json.dumps(x, sort_keys=True, indent=4))
#        pprint.pprint(o)

if __name__ == "__main__":
    load_json('artstor.json')
