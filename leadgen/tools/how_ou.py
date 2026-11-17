"""how_ou.py: pull Florida entries from the OU public community-resource API (the endpoint the public
ou.org/synagogue-finder page itself calls). Phone-like fields are dropped before saving."""
import requests, json, time, re, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from td_redact import redact
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'raw', 'how', 'ou_fl.json')
allr = []
for page in (1, 2):
    r = requests.get('https://schools-api.ouapis.org/public/community-resource', params={
        'page': page, 'limit': 100, 'order': 'id', 'direction': 'asc', 'name': '', 'state': 'FL', 'city': '', 'type': '', 'zip': 0}, timeout=60)
    d = r.json(); allr += d['results']; print(page, len(d['results']), d['count'])
    time.sleep(3.5)
def clean(o):
    if isinstance(o, dict):
        return {k: clean(v) for k, v in o.items() if not re.search(r'phone|number|fax', k, re.I)}
    if isinstance(o, list): return [clean(x) for x in o]
    if isinstance(o, str): return redact(o)
    return o
json.dump(clean(allr), open(OUT, 'w'), indent=1)
