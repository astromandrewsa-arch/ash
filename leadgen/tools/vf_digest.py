"""Condensed per-company digest of crawled site text for manual review (phone-free)."""
import json, re, sys, glob, os
sys.path.insert(0, '/home/user/ash/leadgen/tools')
from vf_crawl import slugify
from mfr_common import strip_phones
D = '/home/user/ash/leadgen/raw/verify'
ROLE = re.compile(r'\b(owner|co-owner|president|founder|co-founder|ceo|c\.e\.o|chief|principal|managing (partner|director|member)|general manager|vice president|\bvp\b|director|manager|partner|propietario|presidente|fundador|gerente|chairman|treasurer|secretary|operations|estimator|technician|engineer)\b', re.I)
VERT = {'schools': r'school|education|k-12|universit|college|campus', 'hotels': r'hotel|hospitality|resort',
        'condos/HOA': r'condo|\bhoa\b|homeowner.?s? association|multi-?family|apartment|high-?rise|residential building|property manag',
        'offices': r'office building|offices|corporate|commercial office', 'hospitals/healthcare': r'hospital|healthcare|health care|medical|clinic',
        'houses of worship': r'church|worship|synagogue|temple|mosque|faith', 'government': r'government|municipal|federal|\bcity of\b|county',
        'retail': r'retail|store|shopping|mall', 'warehouses/industrial': r'warehouse|industrial|manufactur|distribution|logistics',
        'restaurants': r'restaurant', 'banks/finance': r'\bbank|financial', 'airports/transport': r'airport|transport|port of|seaport|transit',
        'data centers': r'data cent', 'cannabis': r'cannabis|dispensar', 'construction': r'construction site', 'marine': r'marina|yacht|marine',
        'auto dealers': r'dealership|auto dealer', 'gated communities': r'gated communit'}
BRANDS = ['Hikvision', 'Dahua', 'Axis', 'Avigilon', 'Hanwha', 'Samsung', 'Bosch', 'Honeywell', 'Genetec', 'Milestone', 'Verkada',
          'Uniview', 'Lorex', 'Speco', 'Vivotek', 'Pelco', 'Panasonic', 'Sony', 'LenelS2', 'Lenel', 'S2 ', 'Software House', 'C-CURE',
          'Brivo', 'Openpath', 'Kisi', 'HID', 'Paxton', 'Keyscan', 'Kantech', 'DSC', 'Qolsys', 'Alarm.com', 'Resideo', 'Vista',
          'DMP', 'Napco', 'Interlogix', 'GE ', '2GIG', 'Notifier', 'Simplex', 'Edwards', 'EST', 'Fire-Lite', 'Silent Knight', 'Gamewell',
          'Siemens', 'Mircom', 'Potter', 'Aiphone', 'ButterflyMX', 'Doorking', 'DoorKing', 'LiftMaster', 'Liftmaster', 'Linear', '2N',
          'Comelit', 'Eagle Eye', 'Rhombus', 'Cisco', 'Meraki', 'Ubiquiti', 'UniFi', 'Ring', 'Nest', 'Control4', 'Crestron', 'Savant',
          'Lutron', 'Sonos', 'Salto', 'Assa Abloy', 'ASSA ABLOY', 'Schlage', 'Allegion', 'March Networks', 'Digital Watchdog',
          'Exacq', 'exacqVision', 'Illustra', 'American Dynamics', 'Tyco', 'Johnson Controls', 'ADT', 'Vivint', 'Brinks', 'Avigilon Alta',
          'Hanwha Vision', 'Geutebruck', 'Mobotix', 'Wisenet', 'Arlo', 'Cambium', 'Fortinet', 'Aruba', 'Ruckus', 'Pakedge', 'Araknis',
          'Luma', 'Snap One', 'ICT', 'Protech', 'Viscount', 'Mier', 'Elk', 'ELK', 'Inovonics', 'Bold', 'Rapid Response', 'UL ',
          'Motorola', 'Openeye', 'OpenEye', 'Hikcentral', 'IDIS', 'Gallagher', 'Nortek', 'Hartmann', 'Sielox', 'Galaxy', 'Feenics',
          'AMAG', 'Identiv', 'Ava', 'Arcules', 'Cloud', 'Envysion', 'Solink', 'Wavestore', 'Qognify', 'BriefCam', 'Senstar']
FLAGS = {'commercial': r'commercial|business(es)?\b|enterprise', 'residential': r'residential|home ?owner|homes?\b|residence',
         'cameras': r'cctv|video surveillance|surveillance|security camera|camera|ip video|video management|\bvms\b',
         'fire': r'fire alarm|fire sprinkler|fire protection|fire suppression', 'access': r'access control',
         'monitoring': r'monitoring|central station'}
CORP = re.compile(r'acquir|now part of|merged|a division of|subsidiary|a member of|family of companies|rebrand|formerly', re.I)
AREA = re.compile(r'miami-dade|dade|broward|palm beach|south florida|monroe|florida keys|tri-county|treasure coast|serving|nationwide|statewide|throughout|latin america|caribbean', re.I)
ADDR = re.compile(r'(\b(FL|Florida)\b[ ,.]*\d{5})|\b(suite|ste\.?|blvd|avenue|ave\b|street|\bst\b|road|\brd\b|nw |sw |ne |se |court|parkway|drive)\b.*\d|\d{3,6} [NSEW]\.?[W]?\.? ?\d', re.I)


def digest(name, path):
    d = json.load(open(path))
    out = [f'##### {name}', f"start={d.get('start_url')} final={d.get('final_home','')} via={d.get('via','req')} robots={d.get('robots','')} err={d.get('errors',[])[:3]}"]
    pages = d.get('pages', [])
    for p in pages:
        out.append(f"  PAGE {p['status']} {p['url']} | {p['title'][:70]} | {len(p['text'])}c")
    if pages and pages[0].get('meta'):
        out.append('  META: ' + pages[0]['meta'][:300])
    em = sorted({e for p in pages for e in p.get('emails', [])})
    out.append(f'  EMAILS: {em}')
    jl = sorted({x for p in pages for x in p.get('jsonld', [])})
    if jl:
        out.append('  JSONLD: ' + '; '.join(jl)[:500])
    alltxt = '\n'.join(p['text'] for p in pages)
    low = alltxt.lower()
    out.append('  FLAGS: ' + ', '.join(f'{k}={len(re.findall(v, low))}' for k, v in FLAGS.items()))
    out.append('  VERT: ' + ', '.join(f'{k}({len(re.findall(v, low))})' for k, v in VERT.items() if re.search(v, low)))
    br = [b.strip() for b in BRANDS if re.search(r'(?<![A-Za-z])' + re.escape(b.strip()) + r'(?![A-Za-z])', alltxt)]
    out.append('  BRANDS?: ' + ', '.join(br))
    seen = set()
    for p in pages:
        lines = p['text'].split('\n')
        for i, l in enumerate(lines):
            l2 = l.strip()
            if len(l2) > 260 or l2 in seen:
                continue
            tag = None
            if ROLE.search(l2) and len(l2) < 160:
                tag = 'ROLE'
            elif CORP.search(l2):
                tag = 'CORP'
            elif AREA.search(l2) and len(l2) < 220:
                tag = 'AREA'
            elif ADDR.search(l2) and len(l2) < 120 and re.search(r'\d', l2):
                tag = 'ADDR'
            if tag:
                seen.add(l2)
                ctx = ''
                if tag == 'ROLE':
                    prev = lines[i - 1].strip() if i else ''
                    nxt = lines[i + 1].strip() if i + 1 < len(lines) else ''
                    ctx = f'   [prev: {prev[:60]} | next: {nxt[:60]}]'
                out.append(f'  {tag}: {strip_phones(l2)[:230]}{ctx}')
    return '\n'.join(out)


if __name__ == '__main__':
    targets = json.load(open('/home/user/ash/leadgen/data/verify_targets.json'))
    sel = sys.argv[1:]
    for t in targets:
        s = slugify(t['name'])
        if sel and s not in sel and t['name'] not in sel:
            continue
        p = f'{D}/{s}.json'
        if os.path.exists(p):
            print(digest(t['name'], p)); print()
