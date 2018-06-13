import xmltodict
import dateparser
from datetime import datetime
from unscroll import UnscrollClient
import re
import random
import pprint

MONTHS = {'January': '01',
          'February': '02',
          'March': '03',
          'April': '04',
          'May': '05',
          'June': '06',
          'July': '07',
          'August': '08',
          'September': '09',
          'October': '10',
          'November': '11',
          'December': '12'}


def get_date(el):
    _y = el['year']
    _m = MONTHS[el['month']]
    resolution = 6
    original = ''
    if 'day' in el:
        original = "{} {}, {}".format(el['month'], el['day'], el['year'])
        d = dateparser.parse("{}-{}-0{}".format(_y, _m, el['day']))
        resolution = 8
    else:
        original = "{} {}".format(el['month'], el['year'])        
        d = dateparser.parse("{}-{}-{}".format(_y, _m, '01'))

    d2 = datetime.combine(d, datetime.min.time())
    d3 = d2.isoformat()
    return d3, resolution, original


def normalize_rfc_id_to_url(id):
    """Hilariously there is no standard way to represent the URL of an RFC
    so the XML doesn't correspond directly to any URL."""
    prefix = 'https://www.rfc-editor.org/rfc'
    nums = re.sub(r'^[A-Za-z]+0?', '', id)
    url = "{}/rfc{}.txt".format(prefix, int(nums),)
    return url


def html_to_txt(od):
    _l = []
    for el in od.items():
        _l.append(str(el[1]))
    return "".join(_l)


def rfc_to_event(rfc):
    date, resolution, original = *get_date(rfc['date']),
    event = {
        'title': "{}".format(rfc['title']),
        'text': html_to_txt(rfc['abstract']) if 'abstract' in rfc else None,
        'mediatype': "text/html",
        'ranking':0,
        'content_url':normalize_rfc_id_to_url(rfc['doc-id']),
        'source_name':'IETF RFCs XML',
        'source_url':'https://www.ietf.org/standards/rfcs/',
        'when_original':original,
        'when_happened': date,
        'resolution': resolution,
    }
    return event


def __main__():
    read = ''
    events = []
    with open('cache/rfc/rfc-index.xml', 'r') as f:
        read = f.read()
    parsed = xmltodict.parse(read)
    docs = parsed['rfc-index']['rfc-entry']
    events = [rfc_to_event(x) for x in docs]
    # events = []
    c = UnscrollClient()
    scroll = c.__batch__(
        api='http://127.0.0.1:8000',
        username='ford',
        password='***REMOVED***',
        scroll_title='IETF RFCs',
        events=events
    )
    print(len(events))


__main__()

