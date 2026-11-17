"""how_parse_fed.py: parse saved Greater Miami Jewish Federation community-directory detail pages
(synagogue_rabbi + educational_institutions) into leadgen/raw/how/fed_parsed.json.
Only name, address, denomination/flags, location and website are kept (phones are already redacted on save;
federation-listed person names and emails are kept only in a 'fed_people' field for cross-checking against the
institution's own website, never used as poc directly)."""
import os, re, json, glob
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'raw', 'how')
out = []
for f in sorted(glob.glob(os.path.join(D, 'jewishmiami_org_resources_community_directory_*_*.txt'))):
    base = os.path.basename(f)
    if 'page_1_results' in base or not ('_synagogue_rabbi_' in base or '_educational_institutions_' in base):
        continue
    kind = 'synagogue' if '_synagogue_rabbi_' in base else 'edu'
    lines = [l.strip() for l in open(f, encoding='utf-8', errors='replace').read().split('\n')]
    try:
        i = lines.index('Tweet') + 1
    except ValueError:
        continue
    while i < len(lines) and not lines[i]:
        i += 1
    name = lines[i]; i += 1
    addr = []
    while i < len(lines) and not re.search(r',\s*Florida\s*\d{5}|,\s*FL\s*\d{5}|Florida$', lines[i]) and len(addr) < 4:
        if lines[i]:
            addr.append(lines[i])
        i += 1
    cityline = lines[i] if i < len(lines) else ''
    i += 1
    rest = []
    while i < len(lines) and not lines[i].startswith('Back to all'):
        if lines[i]:
            rest.append(lines[i])
        i += 1
    kv, people = {}, []
    keys = {'Denomination', 'Location', 'Phone', 'Fax', 'Email', 'Website', 'Date Submitted', 'Pre-School', 'Kindergarten',
            'Day School', 'Religious', 'High School', 'University', 'Outreach', 'Rabbi', 'Contact'}
    j = 0
    while j < len(rest):
        if rest[j] in keys and j + 1 < len(rest):
            kv[rest[j]] = rest[j + 1]; j += 2
        else:
            people.append(rest[j]); j += 1
    m = re.match(r'(.*?),\s*(?:Florida|FL)\s*(\d{5})?', cityline)
    url = 'https://jewishmiami.org/resources/community_directory/' + ('synagogue_rabbi/' if kind == 'synagogue' else 'educational_institutions/') + base.split('_synagogue_rabbi_' if kind == 'synagogue' else '_educational_institutions_')[1][:-4]
    out.append({'kind': kind, 'name': name, 'street': ', '.join(addr), 'city': (m.group(1) if m else cityline).strip(),
                'zip': (m.group(2) if m and m.group(2) else ''), 'denomination': kv.get('Denomination', ''),
                'location': kv.get('Location', ''), 'website': kv.get('Website', ''),
                'flags': {k: kv[k] for k in ('Pre-School', 'Kindergarten', 'Day School', 'Religious', 'High School', 'University', 'Outreach') if k in kv},
                'fed_people': ' '.join(people)[:300], 'fed_url': url, 'file': base})
json.dump(out, open(os.path.join(D, 'fed_parsed.json'), 'w'), indent=1)
print(len(out))
for x in out:
    print(x['kind'], '|', x['name'], '|', x['street'], '|', x['city'], x['zip'], '|', x['denomination'], '|', x['location'], '|', x['website'], '|', x['flags'].get('Day School', ''), x['flags'].get('Pre-School', ''))
