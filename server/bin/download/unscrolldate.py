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

class UnscrollDate(object):
    when_original = None
    when_happened = None
    resolution = None
    
    def __init__(self, likelies=None, begin=None, end=None):
        print(likelies)
        self.begin = int(begin)
        self.end = int(end)
        if likelies is not None:
            # box up likelies into a list if we just got a string
        
            if (isinstance(likelies, str)):
                likelies = [likelies]

            for likely in likelies:
                self.when_original = str(likely).rstrip()       
                self.resolution, self.when_happened = self.init_parse()
                if self.is_okay():
                    break

    def is_okay(self):
        if (self.when_happened is not None):
            y = int(self.when_happened[0:4])
            #    print('b:{} -- e:{} -- y:{} '.format(self.begin, self.end, y))
            if (self.begin is not None and self.end is not None
                and self.begin <= y
                and self.end >= y):
                return True
            elif (self.begin is None and self.end is None):
                return True

    def is_normal(self, when_original):
        try:
            d = self.parse(when_original)
            return True

        except ValueError:
            return False

    def resolve(self, sre):
        if (sre is not None):
            return True
        return False

    def has_bc(self, when_original):
        return self.resolve(re.search(r'bc|BC|b\.c\.|B\.C\.', when_original))

    def is_decade(self, when_original):
        return self.resolve(re.search(r'\d{4}s', when_original))

    def is_century(self, when_original):
        return self.resolve(re.search(r'\dth', when_original))

    def is_alternate(self, when_original):
        return self.resolve(re.search(' (or|and) ', when_original))

    def is_ambiguous(self, when_original):
        return self.resolve(re.search('\?|c\. |ca |ca\. |Design Date|about|possibly|probably|before|after|or |or later|or earlier', when_original, re.IGNORECASE))

    def is_registered(self, when_original):
        return self.resolve(re.search('registered', when_original))

    def is_extra(self, when_original):
        return self.resolve(re.search(',|patented|introduced|designed|design began|started', when_original))

    def is_year_span(self, when_original):
        # Friends it's an en-dash and a hyphen below, "-–"
        return self.resolve(re.search(r'(\d+)[-–](\d+)', when_original))

    def superimpose(self, tpl):
        a,b = tpl
        diff = len(a) - len(b)
        res = len(str(int(int(b) - int(a))))
        if diff > 0:
            return [res, a[0:diff] + b]
        else:
            return [res, b]

    def scrub(self, s):
        lced = s.lower()
        cleaned = re.sub(u'[^a-z0-9]', ' ', lced)
        split = cleaned.split(' ')
        return split
    
    def parse(self, when_original):
        try:
            o = parser.parse(when_original, default=datetime.datetime(2000,12,31,23,59,59))
            oi = o.isoformat()
            return oi
        except ValueError as e:
            print('{}: {}'.format(e, when_original,))

    def init_parse(self):
        when_original = self.when_original
        
        if (self.is_normal(when_original)):
            return [len(when_original),self.parse(when_original)]

        if (self.is_year_span(when_original) and not(self.has_bc(when_original))):
            m = re.search('(\d+)[––-](\d+)', when_original)
            res, yr = self.superimpose(m.groups(1))
            return [res, self.parse(yr)]

        if (self.is_decade(when_original)):
            m = re.search('(\d{4})s', when_original)        
            return [3, self.parse(m.group(1))]

        if (self.is_century(when_original)):
            m = re.search('(\d+)(th|nd).(\d+)(th|nd)', when_original)
            if m is not None:
                cent = (int(m.group(3)) - 1) * 100
                return [2, self.parse(str(cent))]
            m = re.search('(\d+)(th|nd)', when_original)
            if m is not None:
                cent = (int(m.group(1)) - 1) * 100
                return [2, self.parse(str(cent))]        

        if (self.is_registered(when_original)):
            d = re.sub(r'registered\s+', '', when_original)
            return [8, d]

        if (self.is_extra(when_original)):
            m = re.search('(\d{4})', when_original)
            if m is not None:
                return [4, self.parse(m.group(1))]

        if (self.is_alternate(when_original)):
            m = re.search('(or|and) (\d{4})', when_original)
            if m is not None:
                return [0, self.parse(m.group(2))]

        if (self.is_ambiguous(when_original)):
            m = re.search('(\d{4})', when_original)
            if m is not None:
                return [2, self.parse(m.group(0))]

        return [None, None]



