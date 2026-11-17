import json, re, sys
sys.path.insert(0, '/home/user/ash/leadgen/tools')
from mfr_common import *
d = json.load(open('/home/user/ash/leadgen/raw/mfr_b/milestone_all.json'))
out, dist = [], []
nz = len(ALL_ZIPS)
for x in d:
    a, l, qs = x['a'], x['loc'] or {}, x['q']
    z = (l.get('Zip') or a.get('mailingpostalcode') or '')[:5]
    st = l.get('State') or a.get('mailingstate') or ''
    st2 = 'FL' if st == 'Florida' else st
    if not keep(z, st2): continue
    city = l.get('City') or a.get('mailingcity') or ''
    street = l.get('Address1') or a.get('mailingstreet') or ''
    if (a.get('locator_partner_type__cf') or '') == 'Distributor':
        dist.append(f"{a['name']} ({street}, {city} {z})"); continue
    zq = [q for q in qs if q.endswith('@25mi')]
    fz, fr = qs[0].split('@')
    qtxt = f'{fz} ({fr.replace("mi", " mi")} radius)'
    if len(zq) > 1: qtxt += f'; returned by {len(zq)} of {nz} Miami-Dade ZIP queries at 25 mi'
    elif not zq: qtxt += '; not returned by any 25-mi Miami-Dade ZIP query (wide-radius sweep only)'
    svc = []
    if a.get('product_locator_filter__cf'): svc.append('Products: ' + a['product_locator_filter__cf'])
    if a.get('specialization_locator_filter__cf'): svc.append('Specializations: ' + a['specialization_locator_filter__cf'])
    web = a.get('website') or ''
    if web and not web.startswith('http'): web = 'https://' + web
    notes = (f"Partner type: {a.get('locator_partner_type__cf','')}; Milestone account ID {a['id']}; county: {region(z, 'FL')}; "
             f"source: Impartner locator API (milestonesandboxmpps.impartner.org/prm/api/locator/v1/query) called by the public page")
    if re.search(r'\bAPT\b', street, re.I): notes += '; listed address includes an apartment number (may be a home office)'
    out.append(rec(name=a['name'], brand='Milestone Systems', listing_level=a.get('reseller_tier__cf') or '',
                   address=street, city=city.title() if city.isupper() else city, state='FL', zip=z, website=web,
                   services_on_listing='; '.join(svc), listing_url='https://www.milestonesys.com/where-to-buy-reseller-and-distributor/',
                   query=qtxt, notes=notes))
out.sort(key=lambda r: (['Miami-Dade', 'Broward', 'Palm Beach', 'Monroe'].index(region(r['zip'], 'FL')), r['name']))
save('/home/user/ash/leadgen/data/mfr_milestone.json', out)
from collections import Counter
print(Counter(region(r['zip'], 'FL') for r in out))
print('distributors excluded:', dist)
