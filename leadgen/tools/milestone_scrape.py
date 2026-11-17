"""Milestone Impartner locator: same public query endpoint the locator page calls, with the
'LOCATED WITHIN <r> MI OF COORDS:(lat, lng)' clause the page builds for a location search."""
import json, time, sys, requests
sys.path.insert(0, '/home/user/ash/leadgen/tools')
from mfr_common import *
BASE = 'https://milestonesandboxmpps.impartner.org/prm/api/locator/v1/query'
H = {'User-Agent': UA, 'Origin': 'https://www.milestonesys.com', 'Referer': 'https://www.milestonesys.com/', 'Accept': 'application/json'}
FIELDS = ('id,name,isfeatured,mailingstreet,mailingcity,mailingcountry,mailingstate,mailingpostalcode,website,'
          'reseller_tier__cf,billing_country__cf,locator_partner_type__cf,region__cf,product_locator_filter__cf,'
          'specialization_locator_filter__cf')
LOG = open('/home/user/ash/leadgen/raw/mfr_b/milestone_log.txt', 'a')


def query(lat, lng, radius, offset):
    q = (f"FIND ALL LOCATED WITHIN {radius} MI OF COORDS:({lat}, {lng}) RETURNING {FIELDS} "
         f"ORDER BY isFeatured DESC, reseller_tier__cf DESC, name ASC WITH FREQUENCIES(locator_partner_type__cf, "
         f"region__cf, reseller_tier_locator_filter__cf, product_locator_filter__cf, specialization_locator_filter__cf), "
         f"LOCATION AS BRANCH LIMIT 24" + (f" OFFSET {offset}" if offset else ""))
    for attempt in range(2):
        r = requests.get(BASE, params={'type': 'account', 'o': 'json', 'q': q}, headers=H, timeout=60)
        time.sleep(3.5)
        if r.status_code == 200: break
        LOG.write(f'HTTP {r.status_code} {lat},{lng} r{radius} o{offset}\n'); time.sleep(45)
    return r.json()['data']['searchResult']


found = {}
order = [(z, 25) for z in ALL_ZIPS] + [('33134', 100), ('33030', 200)]
for z, radius in order:
    lat, lng = zip_coords(z)
    off, new, total = 0, 0, None
    while True:
        sr = query(lat, lng, radius, off)
        total = sr['count']
        accts = {a['id']: a for a in sr['accounts']}
        locs = sr.get('locations', [])
        for a in sr['accounts']:
            my_locs = [l for l in locs if l.get('AccountId') == a['id']] or [None]
            for l in my_locs:
                key = (a['id'], (l or {}).get('Address1') or a.get('mailingstreet'))
                if key not in found:
                    found[key] = {'a': a, 'loc': l, 'q': []}; new += 1
                found[key]['q'].append(f'{z}@{radius}mi')
        off += 24
        if off >= total or not sr['accounts']: break
    msg = f'{z} r={radius}: total={total} new={new} cum={len(found)}'
    print(msg, flush=True); LOG.write(msg + '\n'); LOG.flush()
json.dump(list(found.values()), open('/home/user/ash/leadgen/raw/mfr_b/milestone_all.json', 'w'), indent=1)
print('done', len(found))
