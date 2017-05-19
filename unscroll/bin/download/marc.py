from pymarc import MARCReader
import datefinder
import re
import hashlib
dt = datefinder.DateFinder()

def dateparser(s):
    if s is not None:
        m1 = re.search(r'c?\s*(\d{4})', s)
        m2 = re.search(r'\[(\d{4})\]', s)
        if m1:
            return m1.group(1)
        elif m2:
            return m2.group(1)
        else:
            return None

cache = {}

def authorparser(s):
    if s is not None:
        m = re.match(r'^(?P<last>\w+),\s*(?P<first>\w+)(,\s*(?P<born>\d{4})-(?P<died>\d{4}))?', s)
        if m:
            a = ''
            b = ''
            if m.group('born'):
                a = "{} {} born (d. {})".format(m.group('first'), m.group('last'), m.group('died'))
                if a not in cache:
                    pass
                else:
                    pass
                cache[a] = 1
            if m:
                b = "{} {}".format(m.group('first'), m.group('last'), m.group('died'))                
            return b
        else:
            return '{}'.format(s)

with open('/Users/ford/Dropbox/BooksAll.2014.part01.utf8', 'rb') as fh:
    reader = MARCReader(fh)
    for record in reader:
        pubyear = dateparser(record.pubyear())
        title = record.title()
        author = authorparser(record.author())
        title_adjust = re.sub(r'\s*\/\s*$', '', title)
        if pubyear:
            print("{}\t{} (by {})".format(pubyear, title_adjust, record.author()))
            print(record)
