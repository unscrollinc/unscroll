from collections import Counter
from pprint import pprint
import json
import datetime
from dateutil.parser import *
import re
import sqlite3
import requests

class DateTimeEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, datetime.datetime):
            return o.isoformat()

        return json.JSONEncoder.default(self, o)

def is_normal(dts):
    try:
        d = parse(dts)
        return True
    
    except ValueError:
        return False

def resolve(sre):
    if (sre is not None):
        return True
    return False

def has_bc(dts):
    return resolve(re.search(r'bc|BC|b\.c\.|B\.C\.', dts))

def is_decade(dts):
    return resolve(re.search(r'\d{4}s', dts))

def is_century(dts):
    return resolve(re.search(r'\dth', dts))

def is_alternate(dts):
    return resolve(re.search(' (or|and) ', dts))

def is_ambiguous(dts):
    return resolve(re.search('\?|c\. |ca |ca\. |Design Date|about|possibly|probably|before|after|or |or later|or earlier', dts, re.IGNORECASE))

def is_registered(dts):
    return resolve(re.search('registered', dts))

def is_extra(dts):
    return resolve(re.search(',|patented|introduced|designed|design began|started', dts))

def is_year_span(dts):
    # Friends it's an en-dash and a hyphen below, "-–"
    return resolve(re.search(r'(\d+)[-–](\d+)', dts))

def superimpose(tpl):
    a,b = tpl
    diff = len(a) - len(b)
    res = len(str(int(int(b) - int(a))))
    if diff > 0:
        return [res, a[0:diff] + b]
    else:
        return [res, b]
   
def parse_dts(dts):
    if (is_normal(dts)):
        return [len(dts),parse(dts)]
    
    if (is_year_span(dts) and not(has_bc(dts))):
        m = re.search('(\d+)[––-](\d+)', dts)
        res, yr = superimpose(m.groups(1))
        return [res, parse(yr)]

    if (is_decade(dts)):
        m = re.search('(\d{4})s', dts)        
        return [3, parse(m.group(1))]

    if (is_century(dts)):
        m = re.search('(\d+)(th|nd).(\d+)(th|nd)', dts)
        if m is not None:
            cent = (int(m.group(3)) - 1) * 100
            return [2, parse(str(cent))]
        m = re.search('(\d+)(th|nd)', dts)
        if m is not None:
            cent = (int(m.group(1)) - 1) * 100
            return [2, parse(str(cent))]        

    if (is_registered(dts)):
        d = re.sub(r'registered\s+', '', dts)
        return [8, d]
    
    if (is_extra(dts)):
        m = re.search('(\d{4})', dts)
        if m is not None:
            return [4, parse(m.group(1))]

    if (is_alternate(dts)):
        m = re.search('(or|and) (\d{4})', dts)
        if m is not None:
            return [0, parse(m.group(2))]
    
    if (is_ambiguous(dts)):
        m = re.search('(\d{4})', dts)
        if m is not None:
            return [2, parse(m.group(0))]

    return [None, None]
        
def classify(s):
    orig = s.rstrip()
    return (*parse_dts(orig), orig)

def scrub(s):
    lced = s.lower()
    cleaned = re.sub(u'[^a-z0-9]', ' ', lced)
    split = cleaned.split(' ')
    return split

def __main__():
    # dates = [classify(s) for s in open('dates.txt', 'r')]
    # bad = list(filter(lambda date:date[0] is None, dates))
    #l = [scrub(x[2]) for x in bad]
    #els = list(set().union(*l))
    #sed = sorted(els)
    #fed = list(filter(lambda s:not re.match(r'\d+$', s), sed))
    # pprint(bad)
    # print(Counter([x[0] for x in dates]))

    conn = sqlite3.connect('objects.db')
    conn.row_factory = sqlite3.Row
    
    c = conn.cursor()

    c.execute("SELECT * FROM objects")

    
    for row in c.fetchall():
        response = requests(fetch(row['primary_image']))
        thumbnail = thumbnail(response)
        sleep(1)
        if row['date'] is not None:
            resolution, when_happened, when_original = classify(row['date'])
            d = {
                'title':row['title'],
                'text':row['description'],
                'resolution':resolution,
                'ranking':0,
                'content_url':row['id'],
                'primary_image':row['primary_image'],
                'when_happened':when_happened,
                'when_original':when_original
            }
            pprint(json.dumps(d, cls=DateTimeEncoder))
    

    
__main__()
    
