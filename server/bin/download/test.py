from unscroll2 import UnscrollAPI, Scroll, Event

api = UnscrollAPI()
scroll = Scroll(scroll={'slug':'woornjeesdgm'}, api=api)

e = {'when_happened':'2001-01-01T00:00',
     'resolution':0,
     'content_url':None,
     'title':'Studs Terkel petted a dog'}

event = Event(event=e)
print('ADDING EVENT')
scroll.add_event(event)
# scroll.add_events(e)
