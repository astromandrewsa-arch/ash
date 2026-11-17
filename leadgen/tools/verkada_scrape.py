import json, re, time, sys, requests
sys.path.insert(0, '/home/user/ash/leadgen/tools')
from mfr_common import *

S = requests.Session(); S.headers['User-Agent'] = UA
BASE = 'https://www.verkada.com/find-partners/'
LOG = open('/home/user/ash/leadgen/raw/mfr_b/verkada_log.txt', 'a')


def fetch(zipc, radius, page):
    params = {'radius': radius, 'search': zipc}
    if page > 1: params['page'] = page
    for attempt in range(2):
        r = S.get(BASE, params=params, timeout=60)
        time.sleep(3.5)
        if r.status_code == 200: break
        LOG.write(f'{zipc} r{radius} p{page} HTTP {r.status_code}\n'); time.sleep(45)
    h = r.text
    chunks = re.findall(r'self\.__next_f\.push\(\[1,"(.*?)"\]\)</script>', h, re.S)
    txt = ''.join(json.loads('"' + c + '"') for c in chunks)
    i = txt.find('"partners":[')
    if i < 0: return [], 0, r.url
    arr, _ = json.JSONDecoder().raw_decode(txt[i + len('"partners":'):])
    m = re.search(r'"numResults":(\d+)', txt)
    return arr, int(m.group(1)) if m else len(arr), r.url


found = {}   # key -> (partner dict, queries list)
order = [(z, 25) for z in ALL_ZIPS] + [('33134', 100), ('33030', 150)]
for zipc, radius in order:
    page, seen_here, total = 1, 0, None
    new = 0
    while True:
        arr, total, url = fetch(zipc, radius, page)
        for p in arr:
            key = (p['id'], ' | '.join(p.get('address', [])))
            if key not in found:
                found[key] = (p, []); new += 1
            found[key][1].append(f'{zipc}@{radius}mi')
        seen_here += len(arr)
        if not arr or seen_here >= total or page > 40: break
        page += 1
    msg = f'{zipc} r={radius}: total={total} pages={page} new={new} cum={len(found)}'
    print(msg, flush=True); LOG.write(msg + '\n'); LOG.flush()

json.dump([{'p': v[0], 'q': v[1]} for v in found.values()], open('/home/user/ash/leadgen/raw/mfr_b/verkada_all.json', 'w'), indent=1)
print('done', len(found))
