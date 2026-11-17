# Builds data/mfr_resideo.json from the raw Resideo locator responses plus the Honeywell commercial (Bullseye)
# listings captured via WebFetch. No phone numbers are present in any input or output.
import json, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from zips import ZIPS
BASE = os.path.join(os.path.dirname(__file__), '..')
raw = lambda f: json.load(open(os.path.join(BASE, 'raw', f)))

def clean(s): return re.sub(r'\s+', ' ', (s or '').strip())
def tc(s):
    s = clean(s)
    return s.title() if s.isupper() else s
def zq(zs, label):
    zs = [z for z in ZIPS if z in zs]
    if len(zs) == len(ZIPS): return f"{label}: returned for all {len(ZIPS)} Miami-Dade ZIPs queried"
    return f"{label}: returned for {len(zs)} of {len(ZIPS)} Miami-Dade ZIPs: " + ' '.join(zs)
def rec(**k):
    base = dict(name='', brand='', listing_level='', address='', city='', state='FL', zip='', website='', email='',
                contact_name='', contact_role='', contact_source='', services_on_listing='', service_area='',
                listing_url='', query='', notes='')
    base.update(k); return base

out = []
# 1) Honeywell Home / Resideo Find a Pro (findapro.resideo.com) - security path
d = raw('resideo_searchDealers.json'); agg = {}
for z, r in d.items():
    if r == 'ERROR': continue
    for k in ('tier1Dealers', 'tier2Dealers'):
        for x in r.get(k) or []:
            key = (clean(x['name']).upper(), (x.get('postalCode') or '')[:5])
            a = agg.setdefault(key, {'x': x, 'zips': set(), 'ids': set(), 'streets': set(), 'web': ''})
            a['zips'].add(z); a['ids'].add(x['id']); a['streets'].add(clean(x.get('street')))
            if x.get('website'): a['web'] = x['website']
for (nm, zp), a in agg.items():
    x = a['x']
    out.append(rec(name=clean(x['name']), brand='Resideo / Honeywell Home (Find a Pro)', listing_level=x.get('tier') or '',
        address=sorted(a['streets'])[0], city=tc(x.get('city')), state=x.get('state') or 'FL', zip=(x.get('postalCode') or '')[:5],
        website=a['web'], services_on_listing='Home/Business Security (search path: Business > video + traditional > monitoring)',
        listing_url='https://findapro.resideo.com/ (public page; data from its Apex call /webruntime/api/apex/execute method searchDealers, zipOnlyMatch=true)',
        query=zq(a['zips'], 'ZIP search (security path)'),
        notes=('Listed ' + str(len(a['ids'])) + ' times (Salesforce ids ' + ', '.join(sorted(a['ids'])) + '; street variants: ' + ' / '.join(sorted(a['streets'])) + '). ' if len(a['ids']) > 1 else '')
              + 'Locator shows "Request quote not enabled". honeywellhome.com/findapro redirects to this locator.'))
# 2) resideo.com Find a Resideo Pro, Service Type = Security, radius 50 mi
d = raw('resideo_rde_professionals.json'); agg = {}
for z, ps in d.items():
    for p in ps:
        a = agg.setdefault(p['Id'], {'p': p, 'zips': set()}); a['zips'].add(z)
for pid, a in agg.items():
    p = a['p']; L = p['Location']; addr = clean(L['Address']); name = clean(p['Name']); notes = []
    cname = crole = csrc = ''
    m = re.search(r'\s*ATTN:\s*(.+)$', addr, re.I)
    if m:
        cname = m.group(1).title(); crole = 'Listed contact (ATTN line in the listed address)'
        csrc = f"https://www.resideo.com/rde/findAPro/professionals?rdesite=Resideo&rdelanguage=en-US&SiteName=Resideo&ZipCode={sorted(a['zips'])[0]}&Radius=50&StartIndex=0&PageSize=12&SortingType=Dealer%20Type%2C%20Distance&Categories=98551&Country=US&SortServiceBy=CategoryName (rendered on https://www.resideo.com/us/en/find-a-pro/)"
        addr = addr[:m.start()].strip(); notes.append('Address line on listing includes "ATTN: ' + m.group(1).strip() + '".')
    m = re.match(r'DBA:\s*(.+?)\s+(\d.*)$', addr, re.I)
    if m:
        notes.append('Listing shows DBA: ' + m.group(1).title() + '.'); addr = m.group(2)
    notes.append('Not flagged as Resideo Authorized Pro or Lead Manager on the listing.')
    out.append(rec(name=name, brand='Resideo (Find a Resideo Pro)', listing_level='', address=addr, city=tc(L['City']),
        state=L.get('State') or 'FL', zip=(L.get('ZipCode') or '')[:5], website=p.get('Website') or '', email=p.get('EmailAddress') or '',
        contact_name=cname, contact_role=crole, contact_source=csrc,
        services_on_listing=', '.join(c['Name'] for c in p.get('Categories') or []),
        listing_url='https://www.resideo.com/us/en/find-a-pro/ (JSON: https://www.resideo.com/rde/findAPro/professionals, Categories=98551 Security, Radius=50)',
        query=zq(a['zips'], 'ZIP search, Security, 50 mi'), notes=' '.join(notes)))
# 3) Honeywell commercial security dealer locator (Bullseye iframe), captured via WebFetch
for b in raw('hbt_bullseye_extract.json'):
    out.append(rec(**b))
json.dump(out, open(os.path.join(BASE, 'data', 'mfr_resideo.json'), 'w'), indent=2)
print(len(out), 'records')
for r in out: print(r['brand'][:30], '|', r['name'], '|', r['city'], r['zip'], '|', r['listing_level'], '|', r['contact_name'])
