import re
names = {}
with open("cache/infobox_properties_en.ttl", 'r') as f:
    for line in f:
        m = re.match('^<([^>]+)>\s+<([^>]+)>\s+(.+)', line)
        if m:
            v = {'s': None,
                 'p': None,
                 'o_kind': None,
                 'o_value': None}
            s = m.group(1)
            p = m.group(2)
            o = m.group(3)
            s = re.sub('http://dbpedia.org/resource/', '', s)
            p = re.sub('http://dbpedia.org/property/', '', p)
            v['s'] = s
            v['p'] = p
            v['o_kind'] = 'unknown'
            v['o_value'] = o

            om = re.match('^<([^>]+)>', o)
            if om:
                omv = om.group(1)
                omv = re.sub('http://dbpedia.org/resource/', '', omv)
                v['o_kind'] = 'resource'
                v['o_value'] = omv
            else:
                om = re.match('\"(.+)\"@en', o)
                if om:
                    v['o_kind'] = 'str_en'
                    v['o_value'] = om.group(1)
            
            if re.search('[Nn]ame$', v['p']):
                if names.get(v['p']) is not True:
                    print(v['p'])
                names[v['p']] = True
