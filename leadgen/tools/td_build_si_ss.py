"""td_build_si_ss.py: securityinformed.com Miami list + sourcesecurity.com Florida systems-integrators list -> record files."""
import json, re
from bs4 import BeautifulSoup
RAW = '/home/user/ash/leadgen/raw/tma_dir'
SI_P1 = 'https://www.securityinformed.com/companies/miami-security-companies/directory.html'
SI_P2 = SI_P1 + '?page=2'
SS_FL = 'https://www.sourcesecurity.com/companies/systems-integrators-florida/directory.html'
def load(f, page_url):
    out = {}
    for l in open(f):
        e = json.loads(l); e['page'] = page_url; out[e['name']] = e
    return out
import subprocess, sys
sys.path.insert(0, '/home/user/ash/leadgen/tools')
from td_si_list_parse import parse_list
si = {}
for f, u in ((RAW + '/si/lists/p1_miami.html', SI_P1), (RAW + '/si/lists/www_securityinformed_com_companies_miami_security_companies_directory_html_page_2.html', SI_P2)):
    for e in parse_list(f):
        e['page'] = u; si[e['name']] = e
ss = {}
for f, u in ((RAW + '/ss/pages/www_sourcesecurity_com_companies_systems_integrators_florida_directory_html.html', SS_FL),
             (RAW + '/ss/pages/www_sourcesecurity_com_companies_systems_integrators_florida_directory_html_page_2.html', SS_FL + '?page=2'),
             (RAW + '/profiles/www_sourcesecurity_com_companies_systems_integrators_florida_directory_html_page_3.html', SS_FL + '?page=3')):
    for e in parse_list(f, 'https://www.sourcesecurity.com'):
        e['page'] = u; ss[e['name']] = e
print(len(si), len(ss))
PROFILES = {  # profile pages that loaded before the WAF block (address printed on the listing)
 'Beyond Technology': (RAW + '/profiles/www_securityinformed_com_companies_beyond_technology_html.html'),
 'Intellitech Systems, Inc.': (RAW + '/si/profiles/www_securityinformed_com_companies_intellitech_systems_inc_html.html'),
}
INCLUDE = {
 'Beyond Technology': ('', 'IT/infrastructure-focused (listing mentions infrastructure, mobility, IoT, cybersecurity); verify physical-security work'),
 'E.G. Telecommunications & Technologies': ('', 'Telecom and security installer'),
 'Eyeson': ('', 'Listing calls it a developer and provider of video security whose team designs and installs each project; may be partly a product company'),
 'Integrated Security Systems': ('', ''),
 'Intellitech Systems, Inc.': ('', 'Serves condominiums, commercial buildings and residential customers'),
 'iWatchSystems LLC': ('', 'No description on listing'),
 'Kent Security Services, Inc': ('', 'Guard-services company that also integrates security systems'),
 'Lunis Systems': ('AV installer (pro AV, video walls, signage); CCTV listed', ''),
 'Munway Technology': ('', ''),
 'Paradyme': ('', ''),
 'Plasco, Inc.': ('ID-card / card-based solutions reseller-integrator (Miami and St. Louis Park, MN)', ''),
 'Saltex Group': ('', 'Integrated systems incl. CCTV, access control, intrusion, fire'),
 'XSPONSE': ('AI-driven security/automation platform; may be a product company rather than installer', ''),
 'Vision Security': ('Listed as consultant; listing also names electronic security devices, CCTV and access control', ''),
 'IP Access Video LLC': ('', 'Technology integrator: HD surveillance, corporate access control'),
}
def card_info(e):
    c = [x for x in e['card'] if x != e['name']]
    desc = next((x for x in c if len(x) > 60), '')
    short = [x for x in c if len(x) <= 60]
    loc = short[0] if short else ''
    types = short[1:3]
    return desc, loc, types
recs = []
for name, (flag, note) in INCLUDE.items():
    dirs, urls, svc, desc, loc, prof = [], [], [], '', '', []
    for label, src in (('securityinformed.com', si), ('sourcesecurity.com', ss)):
        if name in src:
            e = src[name]; d, l, t = card_info(e)
            dirs.append(label); urls.append(e['page'])
            svc += [x for x in t if x not in svc]
            desc = desc or d; loc = loc or l
            prof.append(e['href'])
    city = loc.split(',')[0].strip().title() if loc else ''
    rec = {'name': name, 'brand': '', 'listing_level': '', 'address': '', 'city': city, 'state': 'FL', 'zip': '',
           'website': '', 'email': '', 'contact_name': '', 'contact_role': '', 'contact_source': '',
           'services_on_listing': ', '.join(svc), 'service_area': '',
           'listing_url': ' | '.join(urls),
           'query': 'securityinformed: Miami security companies directory (all types); sourcesecurity: systems integrators in Florida',
           'notes': '', 'directory': dirs, 'flag': flag}
    notes = []
    if name in PROFILES:
        s = BeautifulSoup(open(PROFILES[name]).read(), 'lxml')
        li = s.find('li', class_='address-icon')
        meta = {m['itemprop']: m.get('content', '') for m in li.find_all('meta')} if li else {}
        rec['address'] = meta.get('streetAddress', '')
        z = re.search(r'\b(\d{5})\b', meta.get('postalCode', ''))
        rec['zip'] = z.group(1) if z else ''
        notes.append('Address/ZIP from company profile page ' + s.find('meta', itemprop='url')['content'] + '; no website shown on profile')
    else:
        notes.append('Profile page not read (Cloudflare WAF block after a few requests); ZIP/website not captured')
    notes.append('Company profile URL(s): ' + ', '.join(prof))
    if desc:
        notes.append('Listing text: ' + desc[:280])
    if note:
        notes.append(note)
    if name == 'Omnitronics':
        pass
    rec['notes'] = ' | '.join(notes)
    recs.append(rec)
si_recs = [r for r in recs if 'securityinformed.com' in r['directory']]
ss_recs = [r for r in recs if 'securityinformed.com' not in r['directory']]
# write: records listed by SI go to SI file (with both directories noted); SS-only go to SS file
json.dump(si_recs, open(RAW + '/securityinformed_records.json', 'w'), indent=1, ensure_ascii=False)
json.dump(ss_recs, open(RAW + '/sourcesecurity_records.json', 'w'), indent=1, ensure_ascii=False)
print(len(si_recs), 'SI;', len(ss_recs), 'SS-only')
for r in recs: print(r['name'], '|', r['city'], r['zip'], '|', r['directory'], '|', r['services_on_listing'])
