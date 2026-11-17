"""Build contractor_summaries + top_picks + notes into raw/permits/bids_extra_summaries.json, then re-run the builder.
Combines: Miami Beach work-permit contractors, Miami-Dade County permit contractors, bid awards (bids_working.json).
Cross-references website only from other lead files in leadgen/data (out_mfr.json, out_iaf.json) when names match."""
import json, re, collections, sys, os, subprocess
sys.path.insert(0, '/home/user/ash/leadgen/tools')
from pb_mask import mask
from pb_build_permits_bids import key, norm

RAW = '/home/user/ash/leadgen/raw/permits/'
DATA = '/home/user/ash/leadgen/data/'
SEC = ('CCTV/cameras', 'access control', 'burglar/intrusion alarm', 'BDA/ERRCS public-safety radio', 'intercom/entry')

A = json.load(open(RAW + 'pb_analysis.json'))
B = json.load(open(RAW + 'bids_working.json'))
NOTES = open(RAW + 'pb_notes.txt').read() if os.path.exists(RAW + 'pb_notes.txt') else ''

xref = {}
for f in ('out_mfr.json', 'out_iaf.json'):
    try:
        for r in json.load(open(DATA + f)):
            k = key(r.get('Name', ''))
            if k and k not in xref:
                xref[k] = {'website': r.get('Website') or '?', 'src': f, 'url': r.get('Source URL', '')}
    except Exception:
        pass

C = collections.defaultdict(lambda: {'names': collections.Counter(), 'mb': None, 'mdc': None, 'bids': [], 'poc': None, 'addr': None})
for p in A['mb']:
    c = C[p['_key']]; c['mb'] = p; c['names'][p['contractor']] += 3
for p in A['mdc']:
    c = C[p['_key']]; c['mdc'] = p; c['names'][p['contractor']] += 1

def parse_winners(b):
    for w in b.get('_winners', []):
        yield w['name'], w.get('loc', ''), w.get('poc', ''), w.get('role', '')

TRUNC = ('LLC', 'INC', 'CORP', 'CORPORATION', 'COMPANY', 'INCORPORATED', 'SYSTEMS', 'SERVICES', 'SOLUTIONS', 'TECHNOLOGIES', 'TECHNOLOGY')
def k2(k):
    toks = k.split()
    while len(toks) > 1 and any(t.startswith(toks[-1]) for t in TRUNC) and len(toks[-1]) <= 4:
        toks = toks[:-1]
    return ' '.join(toks)

# merge permit keys that differ only by truncation
for kk in list(C.keys()):
    nk = k2(kk)
    if nk != kk:
        if nk in C:
            for f in ('mb', 'mdc'):
                if C[kk][f] and not C[nk][f]: C[nk][f] = C[kk][f]
                elif C[kk][f] and C[nk][f] and C[kk][f] is not C[nk][f]:
                    a, b2 = C[nk][f], C[kk][f]
                    a['permit_count'] += b2['permit_count']
                    for t, v in b2.get('_security_tags', {}).items(): a['_security_tags'][t] = a['_security_tags'].get(t, 0) + v
                    a['_homestead'] = a.get('_homestead', 0) + b2.get('_homestead', 0)
            C[nk]['names'].update(C[kk]['names']); del C[kk]
        else:
            C[nk] = C.pop(kk)
keys = sorted(C.keys(), key=len)
for i, a in enumerate(keys):
    if a not in C or not C[a]['mdc'] or C[a]['mb']:
        continue
    if max((len(n) for n in C[a]['names']), default=0) < 36:   # county dataset truncates names at ~38 chars
        continue
    for b2 in keys[i + 1:]:
        if b2 in C and b2.startswith(a + ' ') and not C[b2]['mdc']:
            C[b2]['mdc'] = C[a]['mdc']; C[b2]['names'].update(C[a]['names']); del C[a]; break

for b in B:
    for name, loc, poc, role in parse_winners(b):
        k = k2(key(name))
        if not k:
            continue
        for kk in list(C.keys()):
            if kk != k and len(min(kk, k, key=len)) >= 12 and len(min(kk, k, key=len).split()) >= 2 and ((kk + ' ').startswith(k + ' ') or (k + ' ').startswith(kk + ' ')):
                k = kk; break
        c = C[k]; c['names'][name] += 5
        if b not in c['bids']: c['bids'].append(b)
        if poc and not c['poc']:
            c['poc'] = (poc.title() if poc.isupper() else poc, role, b['source_url'])
        if loc and not c['addr']:
            c['addr'] = loc

def zipcity(c):
    mun, z = '?', '?'
    if c['addr']:
        m = re.search(r'([A-Za-z .]+),?\s*(FL|[A-Z]{2})\s*(\d{5})?', c['addr'])
        if m:
            mun = m.group(1).strip().title(); z = m.group(3) or '?'
    for src in (c['mb'], c['mdc']):
        if src and mun == '?' and src['contractor_municipality'] != '?':
            mun = src['contractor_municipality']
        if src and z == '?' and src['contractor_zip'] != '?':
            z = src['contractor_zip']
    return mun, z

def score(c):
    s = 0
    for src, w in ((c['mb'], 3.0), (c['mdc'], 1.0)):
        if not src: continue
        tags = src.get('_security_tags', {})
        s += w * sum(tags.get(t, 0) for t in SEC) + 0.3 * w * src['permit_count']
    if c['mdc']: s += 4 * c['mdc'].get('_homestead', 0)
    s += 12 * len(c['bids'])
    return s

NATIONAL = r'CONVERGINT|JOHNSON CONTROLS|SECURITAS|EVERON|\bADT\b|SIEMENS|CONVERGEONE|INTEGRATED FIRE . SECURITY SOLUTIONS|SUMMIT FIRE|CENTURY FIRE|PYE.?BARKER|KASTLE|STANLEY|ALLIED UNIVERSAL|VECTOR SECURITY|BRINKS'
OEM = r'HONEYWELL|SAFEWARE|BLACK CREEK|RAULAND|AUDIO ENHANCEMENT|IDENTISYS|ARIES IND|CUES|DEEP TREKKER|LOGIBALL|SOLOTECH'
def btype(c, name):
    tags = collections.Counter()
    for src in (c['mb'], c['mdc']):
        if src: tags.update(src.get('_security_tags', {}))
    u = name.upper()
    if re.search(OEM, u):
        return 'Other: manufacturer/OEM or reseller'
    tot = max(1, sum(tags.values()))
    secn = sum(tags.get(t, 0) for t in ('CCTV/cameras', 'access control', 'burglar/intrusion alarm'))
    secbid = any(re.search(r'CAMERA|SECURITY ACCESS|SURVEILLANCE|ACCESS CONTROL|CCTV|SECURITY EQUIPMENT|SECURITY COMMUNICATIONS', (b.get('title', '') + ' ' + b.get('what_was_bought', '')).upper()) for b in c['bids'])
    if re.search(NATIONAL, u):
        return 'Dealer/Integrator (national firm)'
    if (secn >= 3 and secn >= 0.25 * tot) or secbid:
        return 'Dealer/Integrator'
    if tags.get('fire alarm', 0) >= 0.6 * tot:
        return 'Other: fire alarm / life-safety contractor'
    if tags.get('audio/video', 0) >= 0.4 * tot:
        return 'Other: low-voltage AV/home-tech contractor'
    if tags.get('data/voice cabling', 0) >= 0.4 * tot:
        return 'Subcontractor: structured cabling/telecom'
    return 'Subcontractor: electrical/low-voltage'

def found_text(c):
    parts = []
    if c['mb']:
        p = c['mb']
        parts.append(f"Miami Beach: {p['permit_count']} low-voltage/fire-alarm permits issued {p['date_range'].replace(' (issue dates)', '')} ({p['work_types'].split(' | ')[0]}). Tags from descriptions: {', '.join(f'{k} {v}' for k, v in sorted(p['_security_tags'].items(), key=lambda x: -x[1])) or 'n/a'}. {p['notes'].split(' Permit numbers')[0]}")
    if c['mdc']:
        p = c['mdc']
        parts.append(f"Miami-Dade County permit data: {p['permit_count']} permits issued {p['date_range'].replace(' (issue dates)', '')}; {p['work_types'].split(' | ')[0]}. {p['notes']}")
    for b in c['bids']:
        parts.append(f"Award: {b['agency']} - {b['title']} ({b['date']}; value {b['value']}).")
    return mask(' '.join(parts))

def why_text(c, bt):
    w = []
    tags = collections.Counter()
    for src in (c['mb'], c['mdc']):
        if src: tags.update(src.get('_security_tags', {}))
    if tags.get('CCTV/cameras'): w.append(f"installs cameras/CCTV in commercial buildings ({tags['CCTV/cameras']} permits tagged)")
    if tags.get('access control'): w.append(f"does access control ({tags['access control']})")
    if tags.get('BDA/ERRCS public-safety radio'): w.append('does BDA/public-safety radio work (already sells to buildings on first-responder needs)')
    if c['mb']: w.append('active in Miami Beach (preferred zone)')
    if c['mdc'] and c['mdc'].get('_homestead'): w.append(f"active in Homestead ({c['mdc']['_homestead']} permits; preferred zone)")
    if any('School' in b['agency'] for b in c['bids']): w.append('on the M-DCPS camera/security vendor pool (school safety buyer, police-dispatch relevance)')
    if any(b['agency'].startswith('Miami-Dade County (') for b in c['bids']): w.append('holds Miami-Dade County security/fire contracts')
    if any('Miami Beach' in b['agency'] for b in c['bids']): w.append('holds City of Miami Beach security/CCTV contracts (Police Support Services / Facilities)')
    if not w: w.append('low-voltage contractor in target area')
    return 'IRIS fit: ' + '; '.join(w) + '. Sold through dealers, so an integrator already installing cameras in commercial buildings can resell IRIS to the same building owners.'

rows = []
for k, c in C.items():
    if not (c['mb'] or c['mdc'] or c['bids']):
        continue
    rows.append((score(c), k, c))
rows.sort(key=lambda x: -x[0])

summ = []
SKIP_BID_ONLY = r'ARIES IND|CUES|DEEP TREKKER|LOGIBALL|BORE TECH|GHD SERVICES|MCFARLAND|MODAXO|JENOPTIK|DAKTRONICS'
sel = rows[:50] + [r for r in rows[50:] if r[2]['bids'] and not re.search(SKIP_BID_ONLY, ' '.join(r[2]['names']), re.I)]
for s, k, c in sel:
    names = [n for n, _ in c['names'].most_common()]
    name = max(names[:3], key=len) if names else k
    name = name.replace('\\,', ',')
    mun, z = zipcity(c)
    bt = btype(c, name)
    x = xref.get(k)
    poc = c['poc']
    srcs = []
    if c['mb']: srcs.append(c['mb']['source_url'].split(' ')[0])
    if c['mdc']: srcs.append(c['mdc']['source_url'].split(' ')[0])
    srcs += [b['source_url'] for b in c['bids']]
    summ.append({
        'heading': name,
        'poc': poc[0] if poc else '',
        'role': poc[1] if poc else '',
        'contact_source': poc[2] if poc else '',
        'municipality': mun,
        'state': 'FL',
        'zip': z,
        'website': x['website'] if x else '?',
        'email': '?',
        'business_type': bt,
        'found': found_text(c),
        'why': why_text(c, bt),
        'next_step': ('Ask for the IRIS dealer conversation: they already install cameras/access control in commercial buildings in the target zones; offer a pilot on one of the buildings in their permit list.' if bt == 'Dealer/Integrator' else
                      'National firm: reach the Miami-Dade branch/sales lead (not corporate); pitch IRIS as an add-on for the hospital/condo/school accounts shown in their permits and contracts.' if bt.startswith('Dealer/Integrator') else
                      'Fire/life-safety contractor: pitch IRIS as a building-map and first-responder add-on to their fire-alarm/BDA customers; confirm whether they also install cameras.' if 'fire alarm' in bt else
                      'Lower priority: confirm whether they sell/maintain cameras (not just wiring) before outreach; could be a subcontractor partner for installs.'),
        'source_url': ' | '.join(dict.fromkeys(srcs)),
        '_score': round(s, 1),
    })
    if x and x['website'] not in ('?', ''):
        summ[-1]['found'] += f" Website cross-referenced from leadgen/data/{x['src']}."

json.dump({'contractor_summaries': [{k: v for k, v in r.items() if not k.startswith('_')} for r in summ],
           'top_picks': json.load(open(RAW + 'pb_top_picks.json')) if os.path.exists(RAW + 'pb_top_picks.json') else [],
           'notes': NOTES}, open(RAW + 'bids_extra_summaries.json', 'w'), indent=1)
for r in summ[:45]:
    print(r['_score'], '|', r['heading'], '|', r['business_type'], '|', r['municipality'], r['zip'], '|', r['poc'], '|', r['website'])
