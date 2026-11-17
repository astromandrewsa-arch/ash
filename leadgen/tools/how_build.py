"""how_build.py: validate how_records.R and write leadgen/data/houses_of_worship.json.
Checks: required keys, business_type values, no phone-number patterns anywhere, federation URLs exist,
poc has a source, duplicate names."""
import os, re, sys, json, collections
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import how_records
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'data', 'houses_of_worship.json')
FED = set(l.strip() for l in open(os.path.join(HERE, '..', 'raw', 'how', 'fed_detail_urls.txt')))
PH = re.compile(r'(?:\+?1[\s.-]?)?\(?\b[2-9]\d{2}\)?[\s.\-]\d{3}[\s.\-]\d{4}\b')
KEYS = ["name", "business_type", "denomination", "address_city", "municipality_hint", "zip", "website", "email", "poc",
        "poc_role", "poc_source", "size_signal", "security_notes", "source_url", "notes"]
errs = []
seen = collections.Counter()
for r in how_records.R:
    assert list(r.keys()) == KEYS, r
    if r['business_type'] not in ('House of Worship', 'School'):
        errs.append(('type', r['name']))
    for k, v in r.items():
        if PH.search(v or ''):
            errs.append(('PHONE?', r['name'], k, PH.search(v).group(0)))
    for u in re.findall(r'https://jewishmiami\.org/resources/community_directory/[^\s;]+', ' '.join(r.values())):
        if u not in FED:
            errs.append(('fedurl', r['name'], u))
    if r['poc'] and not r['poc_source'].startswith('http') and 'County' not in r['poc_source']:
        errs.append(('pocsrc', r['name']))
    if r['zip'] and not re.fullmatch(r'\d{5}', r['zip']):
        errs.append(('zip', r['name'], r['zip']))
    seen[r['name'].lower()] += 1
for n, c in seen.items():
    if c > 1:
        errs.append(('dup', n))
for e in errs:
    print('ERR', e)
json.dump(how_records.R, open(OUT, 'w'), indent=1, ensure_ascii=False)
c = collections.Counter((r['business_type']) for r in how_records.R)
m = collections.Counter((r['municipality_hint']) for r in how_records.R)
print('wrote', len(how_records.R), dict(c))
print(dict(m.most_common()))
