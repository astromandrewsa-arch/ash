"""td_build_dirs.py: merge per-directory record files into leadgen/data/directories.json (dedupe by normalized name)."""
import json, os, re, glob
RAW = '/home/user/ash/leadgen/raw/tma_dir'
OUT = '/home/user/ash/leadgen/data/directories.json'
ORDER = ['pipl_records.json', 'securityinformed_records.json', 'sourcesecurity_records.json', 'boma_records.json']
def norm(n):
    n = n.lower().replace('&', 'and')
    n = re.sub(r'\b(inc|llc|corp|corporation|co|ltd|limited|the|of|usa)\b', ' ', n)
    return re.sub(r'[^a-z0-9]', '', n)
merged, order = {}, []
for fn in ORDER:
    p = os.path.join(RAW, fn)
    if not os.path.exists(p):
        continue
    for r in json.load(open(p)):
        k = norm(r['name'])
        if k in merged:
            m = merged[k]
            for d in r['directory']:
                if d not in m['directory']:
                    m['directory'].append(d)
            if r['listing_url'] not in m['listing_url']:
                m['listing_url'] += ' | ' + r['listing_url']
            for f in ('address', 'city', 'zip', 'website', 'email', 'services_on_listing', 'service_area'):
                if not m.get(f) and r.get(f):
                    m[f] = r[f]
            if not m['contact_name'] and r['contact_name']:
                m['contact_name'], m['contact_role'], m['contact_source'] = r['contact_name'], r['contact_role'], r['contact_source']
            if r.get('notes'):
                m['notes'] = (m['notes'] + ' || ' + r['directory'][0] + ': ' + r['notes']).strip(' |')
            if r.get('flag') and r['flag'] not in m.get('flag', ''):
                m['flag'] = (m.get('flag', '') + '; ' + r['flag']).strip('; ')
        else:
            merged[k] = dict(r); order.append(k)
recs = [merged[k] for k in order]
# Miami-Dade first, then flagged
recs.sort(key=lambda r: (1 if r.get('flag') else 0))
json.dump(recs, open(OUT, 'w'), indent=1, ensure_ascii=False)
print(len(recs), 'records ->', OUT)
