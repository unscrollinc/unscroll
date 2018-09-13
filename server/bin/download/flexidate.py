"""
Date parsing and normalization utilities based on FlexiDate.
To parse dates use parse(), e.g.::
from datautil.date import parse
parse('1890') -> FlexiDate(year=u'1890')
parse('1890?') -> FlexiDate(year=u'1890', qualifier='Uncertainty: 1985?')
Once you have a FlexiDate you can get access to attributes (strings of course
...)::
    fd = parse('Jan 1890')
    fd.year # u'1890'
    fd.month # u'01'
And convert to other forms::
    fd.as_float() # 1890
    fd.as_datetime() # datetime(1890,01,01)
Background
==========
FlexiDate is focused on supporting:
  1. Dates outside of Python (or DB) supported period (esp. dates < 0 AD)
  2. Imprecise dates (c.1860, 18??, fl. 1534, etc)
  3. Normalization of dates to machine processable versions
  4. Sortable in the database (in correct date order)
For more information see:
`Flexible Dates in Python (including BC) <http://rufuspollock.org/2009/06/18/flexible-dates-in-python/>`_
--------------------
"""
import re
import datetime

class FlexiDate(object):
    """Store dates as strings and present them in a slightly extended version
    of ISO8601.
    Modifications:
        * Allow a trailing qualifiers e.g. fl.
        * Allow replacement of unknown values by ? e.g. if sometime in 1800s
          can do 18??
    
    Restriction on ISO8601:
        * Truncation (e.g. of centuries) is *not* permitted.
        * No week and day representation e.g. 1999-W01
    """
    # pass
    def __init__(self, year=None, month=None, day=None, qualifier=''):
        # force = month or day or qualifier
        force = False
        self.year = self._cvt(year, rjust=4, force=force)
        self.month = self._cvt(month)
        self.day = self._cvt(day)
        self.qualifier = qualifier
         
    def _cvt(self, val, rjust=2, force=False):
        if val:
            tmp = unicode(val).strip()
            if tmp.startswith('-'):
                tmp = '-' + tmp[1:].rjust(rjust, '0')
            else:
                tmp = tmp.rjust(rjust, '0')
            return tmp
        elif force:
            # use '!' rather than '?' as '!' < '1' while '?' > '1'
            return rjust * '!'
        else:
            return ''

    def __str__(self):
        out = self.isoformat()
        if self.qualifier:
            # leading space is important as ensures when no year sort in right
            # order as ' ' < '1'
            out += u' [%s]' % self.qualifier
        return out

    def __repr__(self):
        return u'%s %s' % (self.__class__, self.__str__())

    def isoformat(self, strict=False):
        '''Return date in isoformat (same as __str__ but without qualifier).
        
        WARNING: does not replace '?' in dates unless strict=True.
        '''
        out = self.year
        # what do we do when no year ...
        for val in [ self.month, self.day ]:
            if not val:
                break
            out += u'-' + val
        if strict:
            out = out.replace('?', '0')
        return out

    our_re_pat = '''
        (?P<year> -?[\d?]+)
        (?:
                \s* - (?P<month> [\d?]{1,2})
            (?: \s* - (?P<day> [\d?]{1,2}) )?
        )?
        \s*
        (?: \[ (?P<qualifier>[^]]*) \])?
        '''
    our_re = re.compile(our_re_pat, re.VERBOSE)
    @classmethod
    def from_str(self, instr):
        '''Undo affect of __str__'''
        if not instr:
            return FlexiDate()

        out = self.our_re.match(instr)
        if out is None: # no match TODO: raise Exception?
            return None
        else:
            return FlexiDate(
                    out.group('year'),
                    out.group('month'),
                    out.group('day'),
                    qualifier=out.group('qualifier')
                    )
    
    def as_float(self):
        '''Get as a float (year being the integer part).
        Replace '?' in year with 9 so as to be conservative (e.g. 19?? becomes
        1999) and elsewhere (month, day) with 0
        @return: float.
        '''
        if not self.year: return None
        out = float(self.year.replace('?', '9'))
        if self.month:
            # TODO: we are assuming months are of equal length
            out += float(self.month.replace('?', '0')) / 12.0
            if self.day:
                out += float(self.day.replace('?', '0')) / 365.0
        return out

    def as_datetime(self):
        '''Get as python datetime.datetime.
        Require year to be a valid datetime year. Default month and day to 1 if
        do not exist.
        @return: datetime.datetime object.
        '''
        year = int(self.year)
        month = int(self.month) if self.month else 1
        day = int(self.day) if self.day else 1
        return datetime.datetime(year, month, day)


def parse(date, dayfirst=True):
    '''Parse a `date` into a `FlexiDate`.
    @param date: the date to parse - may be a string, datetime.date,
    datetime.datetime or FlexiDate.
    TODO: support for quarters e.g. Q4 1980 or 1954 Q3
    TODO: support latin stuff like M.DCC.LIII  
    TODO: convert '-' to '?' when used that way
        e.g. had this date [181-]
    '''
    if not date:
        return None
    if isinstance(date, FlexiDate):
        return date
    if isinstance(date, int):
        return FlexiDate(year=date)
    elif isinstance(date, datetime.date):
        parser = PythonDateParser()
        return parser.parse(date)
    else: # assuming its a string
        parser = DateutilDateParser()
        out = parser.parse(date, **{'dayfirst': dayfirst})
        if out is not None:
            return out
        # msg = 'Unable to parse %s' % date
        # raise ValueError(date)
        val = 'UNPARSED: %s' % date
        val = val.encode('ascii', 'ignore')
        return FlexiDate(qualifier=val)


class DateParserBase(object):
    def parse(self, date):
        raise NotImplementedError

    def norm(self, date):
        return str(self.parse(date))

class PythonDateParser(object):
    def parse(self, date):
        return FlexiDate(date.year, date.month, date.day)

try:
    import dateutil.parser
    dateutil_parser = dateutil.parser.parser()
except:
    dateutil_parser = None

class DateutilDateParser(DateParserBase):
    _numeric = re.compile("^[0-9]+$")
    def parse(self, date, **kwargs):
        '''
        :param **kwargs: any kwargs accepted by dateutil.parse function.
        '''
        qualifiers = []
        if dateutil_parser is None:
            return None
        date = orig_date = date.strip()

        # various normalizations
        # TODO: call .lower() first
        date = date.replace('B.C.', 'BC')
        date = date.replace('A.D.', 'AD')

        # deal with pre 0AD dates
        if date.startswith('-') or 'BC' in date or 'B.C.' in date:
            pre0AD = True
        else:
            pre0AD = False
        # BC seems to mess up parser
        date = date.replace('BC', '')

        # deal with circa: expressed as [c|ca|cca|circ|circa] with or without an appended period
        # and with or without a space, followed by a date
        # 'c.1950' or 'c1950' 'ca. 1980' 'circ 198?' 'cca. 1980'  'c 1029' 'circa 1960' etc.
        # see http://en.wikipedia.org/wiki/Circa
        # TODO: dates like 'circa 178?' and 'circa 178-' fail poorly
        # 'UNPARSED: circa 178?' / u"Note 'circa' : circa 178-"


        # note that the match deliberately does not capture the circa text match
        # this is done to remove circa bit below
        #circa_match = re.match('([^a-zA-Z]*)c\.?\s*(\d+.*)', date)

        # use non-matching groups (?:) to avoid refactoring the rest of the parsing
        circa_match = re.match(r'([^a-zA-Z]*)(?:circa|circ\.?|cca\.?|ca\.?|c\.?)(?:\s*?)([\d\?-]+\s?\?*)', date)

        if circa_match:
            # remove circa bit
            qualifiers.append("Note 'circa'")
            #date = ''.join(circa_match.groups())
            # if an element in circa_match.groups() is None, an exception is thrown
            # so instead join the match groups from circa_match that are not none
            date = ''.join(list(el for el in circa_match.groups() if el))

        # deal with p1980 (what does this mean? it can appear in
        # field 008 of MARC records
        p_match = re.match("^p(\d+)", date)
        if p_match:
            date = date[1:]

        # Deal with uncertainty: '1985?'
        uncertainty_match = re.match('([0-9xX]{4})\?', date)
        if uncertainty_match:
            # remove the ?
            date = date[:-1]
            qualifiers.append('Uncertainty')

        # Parse the numbers intelligently
        # do not use std parser function as creates lots of default data
        res = dateutil_parser._parse(date, **kwargs)

        print('HERE I AM {}'.format(date))

        if res is None:
            # Couldn't parse it
            return None
        #Note: Years of less than 3 digits not interpreted by
        #      dateutil correctly
        #      e.g. 87 -> 1987
        #           4  -> day 4 (no year)
        # Both cases are handled in this routine
        if res.year is None and res.day:
            year = res.day
        # If the whole date is simply two digits then dateutil_parser makes
        # it '86' -> '1986'. So strip off the '19'. (If the date specified
        # day/month then a two digit year is more likely to be this century
        # and so allow the '19' prefix to it.)
        elif self._numeric.match(date) and (len(date) == 2 or date.startswith('00')):
            year = res.year % 100
        else:
            year = res.year

        # finally add back in BC stuff
        if pre0AD:
            year = -year
            
        if not qualifiers:
            qualifier = ''
        else:
            qualifier = ', '.join(qualifiers) + (' : %s' % orig_date)
        return FlexiDate(year, res.month, res.day, qualifier=qualifier)
