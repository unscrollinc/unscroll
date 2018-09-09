import mailbox
import pprint
import re
import datetime
from dateutil import parser
from unscroll import UnscrollClient
import markdown2

THUMBNAIL_URL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Usenet_servers_and_clients.svg/1000px-Usenet_servers_and_clients.svg.png'

def cleanup_message_id(s):
    return re.sub(r'<([^>]+)>', r'\1', s)

def cleanup_payload(s):
    payload = None
    if len(s) > 2000:
        payload = '{}...'.format(s[:2000],)
    else:
        payload ='{}'.format(s,)
    return markdown2.markdown(payload)

def message_to_event(message, newsgroup, scroll, api):
    try:
        _from = message.get('From')
        _subject = message.get('Subject')
        _date = parser.parse(message.get('Date'))
        _year = _date.year
        _iso= _date.isoformat()
        _id = cleanup_message_id(message['Message-ID'])
        _payload = cleanup_payload(message.get_payload())
        _link = 'https://groups.google.com/forum/#!searchin/{}/messageid:"{}"'.format(newsgroup, _id)

        if _year < 2005:
            _event = {'title':'{} &lt;{}&gt;'.format(_subject, _from),
                      'text':_payload,
                      'resolution':14,
                      'ranking':0,
                      'content_url':_link,
                      'source_name':newsgroup,
                      'source_url':'https://archive.org/download/usenet-alt/{}.mbox.zip'.format(newsgroup),
                      'when_happened':_iso,
                      'when_original':message['Date'],
            }
            _resp = api.create_event(_event, scroll)
            print('{}/{}'.format(_resp, _event['title'],))
    except Exception as e:
        print(e)
        pass
    
def mbox_reader(stream):
    """Read a non-ascii message from mailbox"""
    data = stream.read()
    text = data.decode(encoding="utf-8", errors="replace")
    return mailbox.mboxMessage(text)

def newsgroup_to_events(newsgroup, scroll, api):
    mbox = mailbox.mbox('/home/unscroll/cache/usenet/{}.mbox'.format(newsgroup), factory=mbox_reader)
    for message in mbox:
        message_to_event(message, newsgroup, scroll, api)

def create(newsgroup):
    _title = '{} (Usenet Newsgroup)'.format(newsgroup)
    api = UnscrollClient()
    api.delete_scroll_with_title(_title)
    favthumb = api.cache_thumbnail(THUMBNAIL_URL)
    with_thumbnail = favthumb.get('url')
    scroll = api.create_or_retrieve_scroll(
        _title,
        description='Usenet message board archives',
        link='https://archive.org/details/usenethistorical',
        with_thumbnail=favthumb['url'], 
        subtitle='Collection via Usenet Historical Collection',        
    )
    newsgroup_to_events(newsgroup, scroll, api)
    
    

def __main__():
    groups = [
        'comp.infosystems.www.announce',
        'alt.hypertext',
        'comp.internet.net-happenings',
        'comp.society.futures',
        'comp.text.sgml',
        'comp.text.xml',
        'alt.folklore.computers',
    ]

    for group in groups:
        create(group)
    
__main__()
        
