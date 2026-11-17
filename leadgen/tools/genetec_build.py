import json, re, sys
sys.path.insert(0, '/home/user/ash/leadgen/tools')
from mfr_common import *
d = json.load(open('/home/user/ash/leadgen/raw/mfr_b/genetec_elite_page_data.json'))
rows = d['values']; hdr = rows[0]
out, fl_other = [], []
for row in rows[1:]:
    x = dict(zip([h.lower() for h in hdr], row + [''] * (len(hdr) - len(row))))
    lines = [l.strip() for l in x['address'].split('\n') if l.strip()]
    m = None
    for l in lines:
        m = re.match(r'^(.*?),\s*Florida\s+(\d{5})', l)
        if m: break
    if not m: continue
    city, z = m.group(1).strip(), m.group(2)
    street = ', '.join(l for l in lines if not l.startswith(m.group(0)) and l != 'United States' and not re.search(r'Florida\s+\d{5}', l))
    if not keep(z, 'FL'):
        fl_other.append(f"{x['title']} ({city})"); continue
    out.append(rec(name=x['title'], brand='Genetec', listing_level='Unified Elite or Strategic Partner (map does not say which)',
                   address=street, city=city, state='FL', zip=z, website=x.get('website', ''),
                   listing_url='https://www.genetec.com/contact-us/unified-elite-resellers',
                   query='Full map list (346 listings worldwide), filtered to Florida addresses',
                   notes=f"Genetec 'Find a reseller' map of Unified Elite and Strategic Partners; map coords {x.get('latitude')},{x.get('longitude')}; county: {region(z,'FL')}"))
save('/home/user/ash/leadgen/data/mfr_genetec.json', out)
print('other FL excluded:', fl_other)
