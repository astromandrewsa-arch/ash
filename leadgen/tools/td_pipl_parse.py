"""td_pipl_parse.py: parse saved pipl.systems company listing pages into dicts (no phone numbers)."""
import json, re, glob, sys, os
from bs4 import BeautifulSoup

def lines_of(txtfile):
    return [re.sub(r'\s+', ' ', l).strip() for l in open(txtfile) if l.strip()]

def section(L, start, stops):
    try:
        i = L.index(start) + 1
    except ValueError:
        return []
    out = []
    while i < len(L) and L[i] not in stops:
        out.append(L[i]); i += 1
    return out

HEADS = ['About', 'Core Expertise', 'Technology Partners', 'Service Coverage', 'Industries Served',
         'Experience, Certifications & Awards', 'Industry Associations & Memberships', 'Our Services', 'Get in Touch',
         'Why Choose Us — Reason', 'See How We Work', 'Contact Information']

def parse(html_file):
    h = open(html_file).read()
    s = BeautifulSoup(h, 'lxml')
    biz = {}
    for sc in s.find_all('script', type='application/ld+json'):
        try:
            d = json.loads(sc.string)
        except Exception:
            continue
        stack = [d]
        while stack:
            x = stack.pop()
            if isinstance(x, dict):
                if x.get('@type') == 'LocalBusiness':
                    biz = x
                stack.extend(x.values())
            elif isinstance(x, list):
                stack.extend(x)
    L = lines_of(html_file[:-5] + '.txt')
    rec = {'name': biz.get('name', ''), 'website': biz.get('url', ''),
           'city': (biz.get('address') or {}).get('addressLocality', ''),
           'state': (biz.get('address') or {}).get('addressRegion', ''),
           'zip': (biz.get('address') or {}).get('postalCode', ''),
           'street': (biz.get('address') or {}).get('streetAddress', '')}
    rec['about'] = ' '.join(section(L, 'About', HEADS))[:1500]
    rec['expertise'] = section(L, 'Core Expertise', HEADS)
    rec['partners'] = section(L, 'Technology Partners', HEADS)
    rec['coverage'] = section(L, 'Service Coverage', HEADS)
    rec['industries'] = section(L, 'Industries Served', HEADS)
    rec['certs'] = section(L, 'Experience, Certifications & Awards', HEADS)
    rec['assoc'] = section(L, 'Industry Associations & Memberships', HEADS)
    for key, lab in (('founded', 'Year Founded'), ('team', 'Team Size')):
        try:
            i = L.index(lab); rec[key] = L[i - 1]
        except ValueError:
            rec[key] = ''
    rec['claimed'] = 'Unclaimed profile' not in L
    return rec

if __name__ == '__main__':
    for f in sorted(glob.glob(os.path.join(sys.argv[1], '*.html'))):
        print(json.dumps(parse(f), ensure_ascii=False, indent=1))
