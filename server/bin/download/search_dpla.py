from dpla.api import DPLA
from unscroll import UnscrollClient
import pprint
import datefinder

dpla = DPLA('d858a6fc387cfe9eebf702fca43c9798')
result = dpla.search(q="raccoon", page_size=10)

i = 0
for item in result.all_records():
    i = i + 1
    if i > 20:
        break
    r = item
    pprint.pprint(r)

    dt = None
    date = r.get('date')
    if date is not None and type(date) is list:
        date = date[0]
        print('XXXXX', date)
    if date is not None:
        disp_date = date.get('displayDate')
        if disp_date is not None:
            print('DISP_DATE', disp_date)
            dt = None
            dates = list(datefinder.find_dates(disp_date))
            if len(dates) > 0:
                dt = dates[0]
    print('DTDT', dt)
    if dt is not None:
        text = r.get('description')
        title = r.get('title')
        if title is None:
            title = 'Untitled'
        event = { 'title': title,
                  'datetime': dt,
                  'text': text
        }
        pprint.pprint(event)

