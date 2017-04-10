import xmltodict
import json
import dateparser
from datetime import datetime

read = ''
with open('rfc-index.xml', 'r') as f:
    read = f.read()

months = {'January':'01',
          'February':'02',
          'March':'03',
          'April':'04',
          'May':'05',
          'June':'06',
          'July':'07',
          'August':'08',
          'September':'09',
          'October':'10',
          'November':'11',
          'December':'12'}
def date(el):
    _date = None
    _y = el['year']
    _m = months[el['month']]
    _d = None
    if 'day' in el:
        d = dateparser.parse("{}-{}-0{}".format(_y, _m, el['day']))
    else:
        d = dateparser.parse("{}-{}".format(_y, _m))

    d2 = datetime.combine(d, datetime.min.time())
    d3 = d2.isoformat()
    return d3

parsed = xmltodict.parse(read)
rfcs = parsed['rfc-index']['rfc-entry']
events = [{'title':"{}".format(rfc['title']),
           'description':rfc['abstract'] if 'abstract' in rfc else None,
           'datetime':date(rfc['date'])}
          for rfc in rfcs]
collection = { 'name': 'RFCs',
               'events': events }
print(json.dumps(collection, sort_keys=True, indent=4))

# doc-id
# title
# author
# date
# format
# keywords
# abstract
# draft
# current-status
# publication-status
# stream
# area
# wg_acronym
# doi
