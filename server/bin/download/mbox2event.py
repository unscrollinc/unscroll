import mailbox
import pprint
import re
import datetime
from dateutil import parser
from unscroll import UnscrollClient

THUMBNAIL_URL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Usenet_servers_and_clients.svg/1000px-Usenet_servers_and_clients.svg.png'

def cleanup_message_id(s):
    return re.sub(r'<([^>]+)>', r'\1', s)

def cleanup_payload(s):
    return '<pre>{}...</pre>'.format(s[:2000],)

def message_to_event(message, newsgroup):
    try:
        _from = str(message['From'])
        _subject = str(message['Subject'])
        _date = parser.parse(message['Date'])
        _year = _date.year
        _iso= _date.isoformat()
        _id = cleanup_message_id(message['Message-ID'])
        _payload = cleanup_payload(message.get_payload())
        _link = 'https://groups.google.com/forum/#!searchin/{}/messageid:{}%7Csort:date'.format(newsgroup, _id)

        if _year < 2003:
            _event = {'title':'{}: {} ({})'.format(newsgroup, _subject, _from),
                      'text':_payload,
                      'resolution':14,
                      'ranking':0,
                      'content_url':_link,
                      'source_name':'alt.hypertext',
                      'source_url':'https://archive.org/download/usenet-alt/{}.mbox.zip'.format(newsgroup),
                      'when_happened':_iso,
                      'when_original':message['Date'],
            }
            return _event
    except Exception as e:
        print(e)
        pass
    
def newsgroup_to_events(newsgroup):
    mbox = mailbox.mbox('/Volumes/External/{}.mbox'.format(newsgroup))
    return [message_to_event(message, newsgroup) for message in mbox]

def __main__():
    newsgroup = 'alt.hypertext'
    _events = newsgroup_to_events(newsgroup)
    _filtered = [x for x in _events if x is not None]
    
    _title = '{} (Usenet Newsgroup)'.format(newsgroup)
    api = UnscrollClient()
    api.delete_scroll_with_title(_title)
    favthumb = api.cache_thumbnail(THUMBNAIL_URL)
    with_thumbnail = favthumb.get('url')
    print('Batching {} events'.format(len(_filtered)))
    scroll = api.__batch__(
        scroll_title=_title,
        description='Usenet message board archives',
        link='https://archive.org/details/usenethistorical',
        with_thumbnail=favthumb['url'], 
        subtitle='Collection via Usenet Historical Collection',        
        events=_filtered
    )                    


__main__()
        
