"""td_build_pipl.py: build pipl.systems records (Miami-area integrators) -> leadgen/raw/tma_dir/pipl_records.json"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from td_pipl_parse import parse
BASE = '/home/user/ash/leadgen/raw/tma_dir/pipl/listings'
MANUFACTURERS = {'BAS-IP', 'Digital Watchdog', 'IC Realtime', 'Paxton', 'STid'}
EXCLUDE_OTHER = {'Convergint'}  # national; listing (La Palma, CA) does not mention Miami -> notes file only
ON_STATE_PAGE = {'AT&I Miami', 'Alarm Brokers of Florida', 'Circle Security Solutions', 'Convergint', 'Hi-Tech Security Cameras',
                 'Miami Security Systems', 'Royce Integrated Solutions', 'Security 101 Miami', 'Sytec USA', 'UTS Florida'}
# contact names that appear in the listing text itself (verified by reading each listing)
CONTACTS = {
    'Alarm Brokers of Florida': ('Steve Carulo; Mary Runno', 'Co-founders (listing: "Founded in 2016 by alarm industry experts Steve Carulo and Mary Runno")'),
    'UTS Florida': ('Gustavo Cardoso', 'Founder and president (per listing)'),
    'Circle Security Solutions': ('Lee', 'Runs day-to-day operations (listing gives first name only; founder named as Ira)'),
}
FLAGS = {
    'AT&I Miami': 'broward_listed_as_miami (listing city Cooper City, Broward County; brand/page is AT&I Miami)',
    'Hi-Tech Security Cameras': 'broward (Oakland Park, Broward County); listed on Florida state page; serves Miami-Dade per listing',
    'Royce Integrated Solutions': 'broward (Pompano Beach, Broward County); listed on Florida state page; serves Miami-Dade per listing',
    'Convergint': 'national integrator; listing address La Palma, CA; listed on Florida state page (coverage includes Florida)',
    'SECURE IT LIMITED': 'listing website is a Trinidad (.com) site; ZIP 33172 is Miami-Dade (Doral area); verify identity',
}
recs = []
for f in sorted(os.listdir(BASE)):
    if not f.endswith('.html'):
        continue
    r = parse(os.path.join(BASE, f))
    if r['name'] in MANUFACTURERS or r['name'] in EXCLUDE_OTHER:
        continue
    url = 'https://pipl.systems/company/' + f.replace('pipl_systems_company_', '').replace('.html', '')
    # rebuild exact listing URL from the saved slug list
    for u in open('/home/user/ash/leadgen/raw/tma_dir/pipl/fl_company_urls.txt'):
        u = u.strip()
        slug = u.replace('https://', '').strip('/').replace('.', '_').replace('/', '_').replace('-', '_')
        if slug == f[:-5]:
            url = u
    cov = [c for c in r['coverage'] if not c.startswith('This company')]
    exp = [c for c in r['expertise'] if not c.startswith('This company')]
    ind = [c for c in r['industries'] if not c.startswith('This company')]
    partners = [c for c in r['partners'] if not c.startswith('This company')]
    cname, crole = CONTACTS.get(r['name'], ('', ''))
    notes = []
    if r['about']:
        notes.append('Listing summary: ' + r['about'][:300].rsplit(' ', 1)[0] + '...')
    if partners:
        notes.append('Technology partners on listing: ' + ', '.join(partners))
    if ind:
        notes.append('Industries: ' + ', '.join(ind))
    if r['zip'] == '33131':
        notes.append('ZIP 33131 (downtown Miami) is shared by several unrelated pipl Miami profiles - likely a pipl default, verify')
    if r['name'] == 'Miami Security Systems':
        notes.append('Listing text says it operates from a Hialeah location with a walk-in showroom')
    notes.append('Profile ' + ('claimed' if r['claimed'] else 'unclaimed (created by Pipl Systems)'))
    if r['name'] not in ON_STATE_PAGE:
        notes.append('Not shown on the Florida state page; found via pipl.systems sitemap')
    recs.append({
        'name': r['name'], 'brand': '', 'listing_level': '',
        'address': r['street'], 'city': r['city'], 'state': r['state'], 'zip': r['zip'],
        'website': r['website'], 'email': '',
        'contact_name': cname, 'contact_role': crole if cname else '', 'contact_source': url if cname else '',
        'services_on_listing': ', '.join(exp),
        'service_area': ' | '.join(cov),
        'listing_url': url,
        'query': 'https://pipl.systems/security-integrators/florida/ (Florida state page; no city pages exist) + sitemap /company/*-fl',
        'notes': ' '.join(notes),
        'directory': ['pipl.systems'],
        'flag': FLAGS.get(r['name'], ''),
    })
json.dump(recs, open('/home/user/ash/leadgen/raw/tma_dir/pipl_records.json', 'w'), indent=1, ensure_ascii=False)
print(len(recs), 'records')
for r in recs: print(r['name'], '|', r['city'], r['zip'], '|', r['flag'][:40])
