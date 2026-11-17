import json, re, sys
sys.path.insert(0, '/home/user/ash/leadgen/tools')
from mfr_common import *
d = json.load(open('/home/user/ash/leadgen/raw/mfr_b/verkada_all.json'))
out = []
nzip = len(ALL_ZIPS)
for x in d:
    p, qs = x['p'], x['q']
    a = p.get('address', [])
    m = re.match(r'^(.*?)\s+([A-Z]{2}),\s*(\d{5})', a[1] if len(a) > 1 else '')
    if not m: continue
    city, st, z = m.group(1).strip(), m.group(2), m.group(3)
    if not keep(z, st): continue
    zq = [q for q in qs if q.endswith('@25mi')]
    first = qs[0]
    fz, fr = first.split('@')
    url = f'https://www.verkada.com/find-partners/?radius={fr.replace("mi","")}&search={fz}'
    qtxt = f'{fz} ({fr.replace("mi"," mi")} radius)'
    if len(zq) > 1: qtxt += f'; returned by {len(zq)} of {nzip} Miami-Dade ZIP queries at 25 mi'
    elif not zq: qtxt += '; not returned by any 25-mi Miami-Dade ZIP query (wide-radius sweep only)'
    lvl = (p.get('level') or '').title()
    level = f'{lvl} Partner' if lvl else ''
    svc = []
    if p.get('premierServices') == 'Yes': svc.append('Premier Services Network')
    svc.append('Trained & Certified Partner Reps: VCE Essentials %s, AC Specialist %s, Alarms Specialist %s, VSP Foundations %s' % (
        p.get('vceEssentialsReps', 0), p.get('acSpecialistReps', 0), p.get('alarmsSpecialistReps', 0), p.get('vspFoundationReps', 0)))
    notes = f"Location type: {p.get('locationType','')}; {p.get('distance','?')} mi from {fz} per locator; Verkada partner ID {p.get('id','')}; county: {region(z, st)}"
    out.append(rec(name=re.sub(r'\s+', ' ', p['name']).strip(), brand='Verkada', listing_level=level,
                   address=a[0], city=city.title() if city.isupper() else city, state=st, zip=z,
                   website=p.get('website', ''), services_on_listing='; '.join(svc), listing_url=url, query=qtxt,
                   notes=notes))
out.sort(key=lambda r: (['Miami-Dade', 'Broward', 'Palm Beach', 'Monroe'].index(region(r['zip'], 'FL')), r['name']))
save('/home/user/ash/leadgen/data/mfr_verkada.json', out)
from collections import Counter
print(Counter(region(r['zip'], 'FL') for r in out), len({r['name'] for r in out}), 'distinct names')
