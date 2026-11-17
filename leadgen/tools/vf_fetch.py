"""Fetch extra pages for one company (2.6 s apart), append them (phone-stripped) to raw/verify/<slug>.json, print text.
Usage: vf_fetch.py <slug> <url> [url...]   or  vf_fetch.py <slug> --links <regex>  (list homepage links matching)"""
import json, re, sys, time, requests
sys.path.insert(0, '/home/user/ash/leadgen/tools')
from vf_crawl import page_info, UA
slug = sys.argv[1]; path = f'/home/user/ash/leadgen/raw/verify/{slug}.json'
d = json.load(open(path))
s = requests.Session(); s.headers.update({'User-Agent': UA})
if sys.argv[2] == '--links':
    home = d.get('final_home') or d['start_url']
    r = s.get(home, timeout=30); _, _, _, _, links, _ = page_info(r)
    rx = re.compile(sys.argv[3], re.I)
    for h, t in sorted(set(links)):
        if rx.search(h + ' ' + t):
            print(h, '|', t)
    sys.exit()
lim = 4000
for i, u in enumerate(sys.argv[2:]):
    if u.startswith('--lim='):
        lim = int(u[6:]); continue
    if i:
        time.sleep(2.6)
    try:
        r = s.get(u, timeout=30)
    except Exception as e:
        print('ERR', u, e); continue
    title, meta, txt, emails, _, jl = page_info(r)
    d['pages'].append({'url': r.url, 'status': r.status_code, 'title': title, 'meta': meta, 'text': txt[:60000], 'emails': emails, 'jsonld': jl})
    print('=== ', r.status_code, r.url, '|', title, '| emails', emails); print(txt[:lim]); print()
json.dump(d, open(path, 'w'), indent=1, ensure_ascii=False)
