"""Merge manual review decisions (vf_decisions_*.py) with crawl metadata -> data/verified_sites.json."""
import json, glob, importlib.util, os, re, sys
sys.path.insert(0, '/home/user/ash/leadgen/tools')
from vf_crawl import slugify
from mfr_common import PHONE_RE
T = json.load(open('/home/user/ash/leadgen/data/verify_targets.json'))
NAMES = [t['name'] for t in T]
FIELDS = ['owner_name', 'owner_role', 'owner_source', 'other_named', 'email', 'commercial', 'residential_only', 'cameras',
          'verticals', 'brands', 'locations', 'location_cities', 'hq_city', 'hq_zip', 'service_area', 'notes', 'site_status']
DEF = {'owner_name': '', 'owner_role': '', 'owner_source': '', 'other_named': [], 'email': '', 'commercial': False,
       'residential_only': False, 'cameras': False, 'verticals': [], 'brands': [], 'locations': '?', 'location_cities': [],
       'hq_city': '', 'hq_zip': '', 'service_area': '', 'notes': '', 'site_status': 'ok'}
dec = {}
for f in sorted(glob.glob('/home/user/ash/leadgen/tools/vf_decisions_*.py')):
    spec = importlib.util.spec_from_file_location(os.path.basename(f)[:-3], f)
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    dec.update(m.D)
out = {}
for n in NAMES:
    if n not in dec:
        continue
    rec = dict(DEF); rec.update(dec[n])
    bad = set(rec) - set(FIELDS) - {'extra_checked'}
    assert not bad, (n, bad)
    urls = []
    for src in (f'/home/user/ash/leadgen/raw/verify/{slugify(n)}.json', f'/home/user/ash/leadgen/raw/verify/req_backup/{slugify(n)}.json'):
        if os.path.exists(src):
            d = json.load(open(src))
            urls += [d.get('start_url', '')] + [p['url'] for p in d.get('pages', [])]
    urls += rec.pop('extra_checked', [])
    seen = []
    for u in urls:
        if u and u not in seen:
            seen.append(u)
    rec['checked_urls'] = seen
    out[n] = {k: rec[k] for k in FIELDS + ['checked_urls']}
txt = json.dumps(out, indent=1, ensure_ascii=False)
ph = [m.group(0) for m in PHONE_RE.finditer(txt)]
if ph:
    print('PHONE-LIKE STRINGS FOUND, not saving:', ph[:5]); sys.exit(1)
open('/home/user/ash/leadgen/data/verified_sites.json', 'w').write(txt)
missing = [n for n in NAMES if n not in out]
print(f'saved {len(out)} companies; owners named {sum(1 for v in out.values() if v["owner_name"])}; missing {len(missing)}')
unknown = set(dec) - set(NAMES)
if unknown:
    print('UNKNOWN NAMES IN DECISIONS:', unknown)
