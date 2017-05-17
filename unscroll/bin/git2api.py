import subprocess
import json
import re
import pprint

COMMAND = 'git log --format="%cI%x09%H%x09%an%x09%s"'

output = subprocess.run(COMMAND,
                        shell=True,
                        stdout=subprocess.PIPE,
                        universal_newlines=True)

a = []
lines = output.stdout.split("\n")
for line in lines:
    els = re.split(r"\t+", line)
    if (len(els) is 4):
        date, _hash, name, subject = els
        a.append({'datetime': date,
                  'tk': _hash,
                  'title': "{} ({})".format(subject, name)})

pprint.pprint(json.dumps(a, sort_keys=True, indent=4))

