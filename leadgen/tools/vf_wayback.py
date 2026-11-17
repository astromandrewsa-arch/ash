"""Fetch Wayback Machine snapshots of a company's own pages (3 s apart). Saves phone-stripped text to
raw/verify/wayback/<slug>.json and prints it. Usage: vf_wayback.py <slug> <url> [url...] | --links <url> <regex>"""
import json, re, sys, time, requests, os
sys.path.insert(0, '/home/user/ash/leadgen/tools')
from vf_crawl import page_info, UA
slug = sys.argv[1]; path = f'/home/user/ash/leadgen/raw/verify/wayback/{slug}.json'
d = json.load(open(path)) if os.path.exists(path) else {'name': slug, 'pages': []}
s = requests.Session(); s.headers.update({'User-Agent': UA})
if sys.argv[2] == '--links':
    r = s.get('https://web.archive.org/web/2026/' + sys.argv[3], timeout=60)
    _, _, _, _, links, _ = page_info(r); rx = re.compile(sys.argv[4], re.I)
    print('SNAP', r.url)
    for h, t in sorted(set(links)):
        if rx.search(h + ' ' + t) and 'web.archive.org' not in h.split('/web/')[0][:5]:
            print(h, '|', t)
    sys.exit()
lim = 3500
for i, u in enumerate(sys.argv[2:]):
    if u.startswith('--lim='):
        lim = int(u[6:]); continue
    if i:
        time.sleep(3)
    w = u if 'web.archive.org' in u else 'https://web.archive.org/web/2026/' + u
    try:
        r = s.get(w, timeout=60)
    except Exception as e:
        print('ERR', w, e); continue
    title, meta, txt, emails, _, _ = page_info(r)
    d['pages'].append({'url': r.url, 'status': r.status_code, 'title': title, 'text': txt[:40000], 'emails': emails})
    print('=== ', r.status_code, r.url, '|', title, '| emails', emails); print(txt[:lim]); print()
json.dump(d, open(path, 'w'), indent=1, ensure_ascii=False)
