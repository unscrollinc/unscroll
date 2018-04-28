import xml.etree.ElementTree as ET
import os.path
import urllib.request

URL = 'http://www.iana.org/assignments/media-types/media-types.xml'
FIXTURE_FILE = '../../scrolls/fixtures/mediatype.json'
CACHE_FILE = 'media-types.xml'
NS = {'iana': 'http://www.iana.org/assignments'}

if not(os.path.exists(CACHE_FILE)):
    print('- Caching mirror of "{}" into "{}".'.format(URL, CACHE_FILE))    
    with urllib.request.urlopen(URL) as response:
        xml = response.read()
        f = open(CACHE_FILE, 'wb')
        f.write(xml)
        f.close()
else:
    print('- Found cached mirror of "{}" as file "{}".'.format(URL, CACHE_FILE))



print('- Parsing "{}" as XML.'.format(CACHE_FILE))
tree = ET.parse(CACHE_FILE)
root = tree.getroot()
import json
a = []
for mt in root.findall('.//iana:file', NS):
    d = {'model':'scrolls.mediatype',
         'fields': {
                 'name':mt.text
        }
    }
    a.append(d)

print('Saving fixture as "{}".'.format(FIXTURE_FILE))
f = open(FIXTURE_FILE, 'w')
f.write(json.dumps(a, sort_keys=True, indent=4))
print('Removing "{}".'.format(CACHE_FILE))
os.remove(CACHE_FILE)
exit()
