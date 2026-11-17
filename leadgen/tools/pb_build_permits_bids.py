"""Build leadgen/data/permits_bids.json from the raw permit pulls and the curated bid list.
Inputs (raw/permits/): mb_energov_permits.json, mb_workpermit_contractors.json, cg_energov_permits.json,
mdc_lowvoltage_permits.json, bids_working.json, bids_extra_summaries.json (optional).
Never writes phone numbers (all text passes through a phone mask)."""
import json, os, re, collections, sys
sys.path.insert(0, '/home/user/ash/leadgen/tools')
from pb_mask import mask

RAW = '/home/user/ash/leadgen/raw/permits/'
OUT = '/home/user/ash/leadgen/data/permits_bids.json'
CUTOFF = '2024-11-17'
MB_SRC = 'https://energovcss.miamibeachfl.gov/energovprod/selfservice#/search (permit search; contractor from the public "Building Work Permit.pdf" attachment on each permit page)'
CG_SRC = 'https://coralgablesfl-energovpub.tylerhost.net/Apps/SelfService#/search'
MDC_SRC = 'https://services.arcgis.com/8Pc9XBTAsYuxx9Ny/arcgis/rest/services/miamidade_permit_data/FeatureServer/0 (Building Permits Issued By Miami-Dade County - 2 Previous Years to Present)'

def load(name, default=None):
    p = RAW + name
    return json.load(open(p)) if os.path.exists(p) else default

# ---------- name normalization ----------
SUFFIX = r'\b(INC|INCORPORATED|LLC|L L C|CORP|CORPORATION|CO|COMPANY|LTD|LP|PA|P A|THE)\b'
def norm(n):
    n = (n or '').upper().replace('\\,', ',')
    n = re.split(r'\bD/?B/?A\b|\bDBA:?', n)[0]
    n = re.sub(r'[\[\(].*?[\]\)]', ' ', n)
    n = re.sub(r'[^A-Z0-9& ]', ' ', n)
    n = re.sub(SUFFIX, ' ', n)
    n = n.replace('&', ' AND ')
    n = re.sub(r'\s+', ' ', n).strip()
    n = re.sub(r'\s+(OF FLORIDA|OF FL|USA|US|FLORIDA)$', '', n)
    return n

ALIASES = {  # manual merges of obvious variants (normalized forms)
    'JOHNSON CONTROLS SECURITY SOLUTIONS': 'JOHNSON CONTROLS SECURITY SOLUTIONS',
    'JOHNSON CONTROLS SECURITY SOLUTIONS LL': 'JOHNSON CONTROLS SECURITY SOLUTIONS',
    'JOHNSON CONTROLS': 'JOHNSON CONTROLS SECURITY SOLUTIONS',
    'JOHNSON CONTROLS US HOLDINGS': 'JOHNSON CONTROLS SECURITY SOLUTIONS',
    'SECURITY 101 HOLDINGS': 'AVI INTEGRATORS SECURITY 101',
    'AVI INTEGRATORS': 'AVI INTEGRATORS SECURITY 101',
    'SCS TECHNOLOGIES': 'STRUCTURED CABLING SOLUTIONS SCS TECHNOLOGIES',
    'STRUCTURED CABLING SOLUTIONS': 'STRUCTURED CABLING SOLUTIONS SCS TECHNOLOGIES',
    'UNITEC': 'UNITEC',
    'ARBOR ELECTRICAL SERVICE': 'ARBOR ELECTRICAL SERVICE MR WIREMAN',
    'INTEGRATED FIRE AND SECURITY SOLUTIONS': 'INTEGRATED FIRE AND SECURITY SOLUTIONS IFSS',
    'CENTURY FIRE PROTECTION ADVANCE': 'CENTURY FIRE PROTECTION ADVANCED',
}
def key(n):
    k = norm(n)
    return ALIASES.get(k, k)

# ---------- work type tagging ----------
TAGS = [
    ('CCTV/cameras', r'CAMERA|CCTV|VIDEO SURV|SURVEILLANCE|\bNVR\b|\bDVR\b|\bVMS\b|CLOSED CIRCUIT'),
    ('access control', r'ACCESS CONTROL|CARD READER|CARD ACCESS|MAG(NETIC)? LOCK|MAGLOCK|ELECTRIC STRIKE|\bACS\b|KEY ?FOB|ACCESS SYSTEM'),
    ('intercom/entry', r'INTERCOM|ENTRY SYSTEM|VIDEO ENTRY|DOOR ENTRY|BUTTERFLY|TELEPHONE ENTRY'),
    ('burglar/intrusion alarm', r'BURGLAR|INTRUSION|SECURITY ALARM|ALARM SYSTEM(?!.*FIRE)|GLASS BREAK|MOTION DETECT|SECURITY SYSTEM'),
    ('fire alarm', r'FIRE ALARM|SMOKE DETECT|\bFACP\b|FIRE DETECT|NOTIFICATION APPLIANCE|ELEVATOR RECALL|DUCT DETECT'),
    ('BDA/ERRCS public-safety radio', r'\bBDA\b|BI-?DIRECTIONAL|ERRCS|RADIO ENHANCEMENT|PUBLIC SAFETY (RADIO|AMPLIF)|DAS\b|RF ASSESSMENT|RADIO ENCHANCEMENT'),
    ('data/voice cabling', r'DATA|VOICE|CABLING|STRUCTURED|FIBER|CAT ?6|CAT ?5|NETWORK|TELEPHONE|COMMUNICATION'),
    ('audio/video', r'AUDIO|SPEAKER|SOUND|\bAV\b|A/V|THEATER|TV OUTLET|MASTER TV'),
    ('electrified fence', r'ELECTRIFIED FENCE|ELECTRIC FENCE'),
]
def tags_for(text):
    t = (text or '').upper()
    out = [name for name, rx in TAGS if re.search(rx, t)]
    return out

CLASS_LABEL = [
    (r'^R1', 'hotel/transient residential'), (r'^R2', 'condo/apartment building'), (r'^R3', 'single-family/duplex'),
    (r'^I2', 'hospital/institutional'), (r'^I', 'institutional'), (r'^B', 'business/office'), (r'^M', 'mercantile/retail'),
    (r'^A', 'assembly (restaurant/venue)'), (r'^E', 'educational'), (r'^S', 'storage/parking'), (r'^F', 'factory'),
]
def class_label(cc):
    cc = (cc or '').strip()
    if not cc or cc.startswith('Statement'):
        return ''
    for rx, lab in CLASS_LABEL:
        if re.match(rx, cc):
            return lab
    return ''

BIZ = r'\b(LLC|INC|CORP|CONDO|CONDOMINIUM|ASSOC|ASSOCIATION|HOTEL|CENTER|CITY OF|COUNTY|SCHOOL|UNIVERSITY|MEDICAL|HOSPITAL|CHURCH|TEMPLE|ACADEMY|LP|L\.P\.|LTD|PARTNERS|HOLDINGS|PROPERTIES|PROPERTY|TRUST CO|BANK|CLUB|RESORT|APARTMENTS|TOWER|PLAZA|MARINA|FOUNDATION)\b'
def biz_name(s):
    s = re.split(r'\s%|\bC/O\b|\bc/o\b|\bATTN\b', (s or ''))[0].strip().strip(',')
    return s if re.search(BIZ, s.upper()) else ''

def fmt_range(dates):
    ds = sorted(d for d in dates if d)
    return f'{ds[0]} to {ds[-1]}' if ds else '?'

# ---------- Miami Beach ----------
def mb_name(block, fallback):
    if not block:
        return fallback, ''
    parts, lic = [], ''
    for ln in block:
        m = re.search(r'[\[\(]\s*([A-Z]{1,3}\d{5,}|\d{2}[A-Z]{1,2}\d{4,})\s*[\]\)]', ln)
        if m:
            lic = m.group(1)
            pre = ln[:m.start()].strip()
            if pre and not re.match(r'^\d', pre):
                parts.append(pre)
            break
        if re.match(r'^(\d|P\.?O\.? BOX)', ln.upper()) or re.search(r',\s*[A-Z]{2}\s+\d{5}', ln):
            break
        parts.append(ln)
    name = re.sub(r'\s+', ' ', ' '.join(parts)).strip(' ,')
    return name or fallback, lic

def build_mb():
    permits = {p['CaseId']: p for p in load('mb_energov_permits.json', [])}
    rows = load('mb_workpermit_contractors.json', [])
    groups = collections.OrderedDict()
    no_contr = 0
    for r in rows:
        p = permits.get(r['CaseId'])
        if not p:
            continue
        name, lic = mb_name(r.get('contractor_block'), r.get('contractor') or '')
        lic = lic or r.get('license', '')
        if not name:
            no_contr += 1
            continue
        g = groups.setdefault(key(name), {'names': collections.Counter(), 'lic': set(), 'rows': [], 'city': collections.Counter(), 'zip': collections.Counter()})
        g['names'][name] += 1
        if lic: g['lic'].add(lic)
        if r.get('contractor_city'): g['city'][r['contractor_city'].strip().title()] += 1
        if r.get('contractor_zip'): g['zip'][r['contractor_zip']] += 1
        g['rows'].append((p, r))
    out = []
    for k, g in groups.items():
        name = g['names'].most_common(1)[0][0]
        types = collections.Counter()
        tagc = collections.Counter()
        ex, dates, vals = [], [], 0.0
        for p, r in g['rows']:
            tq = p['type_query']
            types[tq] += 1
            for t in tags_for((p.get('Description') or '') + ' ' + tq):
                tagc[t] += 1
            dates.append((p.get('IssueDate') or '')[:10])
            try: vals += float((r.get('job_value') or '0').replace('$', '').replace(',', ''))
            except ValueError: pass
            resid = 'Residential' in tq or class_label(r.get('class_code')) == 'single-family/duplex'
            if resid:
                ex.append('single-family residence')
            else:
                owner = biz_name(r.get('owner_first_line'))
                lab = class_label(r.get('class_code'))
                addr = re.sub(r'\s+', ' ', (p.get('AddressDisplay') or '').split(' Miami Beach')[0].split(' MIAMI BEACH')[0]).strip()
                addr = re.sub(r'\s*Unit:\s*(?!COMMON)\S+', ' (unit in building)', addr)
                desc = re.sub(r'\s+', ' ', (p.get('Description') or ''))
                desc = re.sub(r'(UNIT|APT|APARTMENT)\s*(#|NO\.?)?\s*:?\s*[\w-]+', r'\1 #', desc, flags=re.I)[:90]
                bits = [b for b in [addr, owner, lab] if b]
                ex.append(' / '.join(bits) + (f' - "{desc}"' if desc else ''))
        exu = list(dict.fromkeys(ex))
        n_sfr = ex.count('single-family residence')
        examples = '; '.join([e for e in exu if e != 'single-family residence'][:5])
        if n_sfr:
            examples += ('; ' if examples else '') + f'{n_sfr} single-family residence(s)'
        out.append({
            'contractor': name,
            'city_portal': 'Miami Beach',
            'permit_count': len(g['rows']),
            'work_types': '; '.join(f'{t} ({c})' for t, c in types.most_common()) + (' | description tags: ' + ', '.join(f'{t} {c}' for t, c in tagc.most_common()) if tagc else ''),
            'examples': mask(examples),
            'date_range': fmt_range(dates) + ' (issue dates)',
            'contractor_municipality': g['city'].most_common(1)[0][0] if g['city'] else '?',
            'contractor_zip': g['zip'].most_common(1)[0][0] if g['zip'] else '?',
            'website': '?',
            'source_url': MB_SRC,
            'notes': mask(f"License(s) on work permit: {', '.join(sorted(g['lic'])) or 'n/a'}. Sum of job values on these permits: ${vals:,.0f}. Permit numbers: {', '.join(p['CaseNumber'] for p, r in g['rows'][:12])}{' ...' if len(g['rows']) > 12 else ''}."),
            '_key': k, '_security_tags': dict(tagc), '_types': dict(types),
        })
    out.sort(key=lambda x: -x['permit_count'])
    return out, no_contr, len(rows), len(permits)

# ---------- Coral Gables (no contractor names public) ----------
def build_cg():
    R = load('cg_energov_permits.json', [])
    by = collections.defaultdict(list)
    for p in R:
        if p['CaseStatus'] in ('Cancelled', 'Void'):
            continue
        by[p['type_query']].append(p)
    out = []
    for tq, ps in sorted(by.items(), key=lambda x: -len(x[1])):
        tagc = collections.Counter(t for p in ps for t in tags_for((p.get('Description') or '') + ' ' + tq))
        exs = []
        resid = 'Residential' in tq
        for p in ps:
            if resid:
                continue
            addr = re.sub(r'\s+', ' ', (p.get('AddressDisplay') or '').split(' Coral Gables')[0]).strip()
            addr = re.sub(r'\s*Unit:\s*\S+', ' (suite)', addr)
            desc = re.sub(r'\s+', ' ', (p.get('Description') or ''))[:100]
            if re.search(r'UNIVERSITY|UM |HOSPITAL|HOTEL|TOWER|PLAZA|BANK|SCHOOL|MALL|MERRICK|OFFICE|SUITE|RESTAURANT|CONDO|GARAGE|CITY OF|POLICE|ACCESS|CAMERA|CCTV|BDA', desc.upper()):
                exs.append(f'{addr} - "{desc}"')
        examples = '; '.join(list(dict.fromkeys(exs))[:6])
        if resid:
            examples = f'{len(ps)} permits, mostly single-family residences (addresses not listed)'
        out.append({
            'contractor': 'NOT PUBLIC - Coral Gables Civic Access hides contacts/attachments unless logged in as a record contact',
            'city_portal': 'Coral Gables',
            'permit_count': len(ps),
            'work_types': tq + (' | description tags: ' + ', '.join(f'{t} {c}' for t, c in tagc.most_common()) if tagc else ''),
            'examples': mask(examples),
            'date_range': fmt_range([(p.get('IssueDate') or '')[:10] for p in ps]) + ' (issue dates)',
            'contractor_municipality': '?', 'contractor_zip': '?', 'website': '?',
            'source_url': CG_SRC,
            'notes': 'Aggregate row (one per permit type). Contractor names need a manual look-up per permit number with a logged-in account or a public-records request. Permit numbers: ' + ', '.join(p['CaseNumber'] for p in ps[:10]) + ' ...',
        })
    return out, len(R)

# ---------- Miami-Dade County dataset ----------
MDC_CATS_EXCLUDE = {'ENERGY MANAGEMENT SYSTEM', 'INSULATION', 'FIRE SPRINKLERS', 'TEMP SERV FOR CONSTR', 'TEMP SERVICE TEST & REPAIR',
                    'CHANGE OUT OF EXACT REPLACEMENT OF AC', 'FREE STANDING SERVICE', 'LIGHTING POLE (STANDARD)', 'FENCE', 'UTILITY ELECTRICAL'}
MUNI = {'01': 'Miami', '02': 'Miami Beach', '03': 'Coral Gables', '04': 'Hialeah', '05': 'Miami Springs', '06': 'North Miami', '07': 'North Miami Beach',
        '08': 'Opa-locka', '09': 'South Miami', '10': 'Homestead', '11': 'Miami Shores', '12': 'Bal Harbour', '13': 'Bay Harbor Islands', '14': 'Surfside',
        '15': 'West Miami', '16': 'Florida City', '17': 'Biscayne Park', '18': 'El Portal', '19': 'Golden Beach', '20': 'Pinecrest', '21': 'Indian Creek',
        '22': 'Medley', '23': 'North Bay Village', '24': 'Key Biscayne', '25': 'Sweetwater', '26': 'Virginia Gardens', '27': 'Hialeah Gardens', '28': 'Aventura',
        '30': 'Unincorporated', '31': 'Sunny Isles Beach', '32': 'Miami Lakes', '33': 'Palmetto Bay', '34': 'Miami Gardens', '35': 'Doral', '36': 'Cutler Bay'}

def mdc_rows():
    R = load('mdc_lowvoltage_permits.json', [])
    out = []
    for r in R:
        if (r.get('PermitIssuedDate') or '') < CUTOFF:
            continue
        cats = {r.get(f'CategoryDescription{i}') for i in range(1, 11)} - {None}
        if cats and cats <= MDC_CATS_EXCLUDE:
            continue
        name = (r.get('ContractorName') or '').replace('\\,', ',').strip()
        if not name or name.upper() in ('OWNER', 'OWNER BUILDER'):
            continue
        out.append(r)
    return out

def build_mdc():
    R = mdc_rows()
    groups = collections.OrderedDict()
    for r in R:
        name = (r['ContractorName'] or '').replace('\\,', ',').strip()
        g = groups.setdefault(key(name), {'names': collections.Counter(), 'rows': [], 'city': collections.Counter(), 'zip': collections.Counter(), 'lic': set()})
        g['names'][name] += 1; g['rows'].append(r)
        cc = (r.get('ContractorCity') or '').replace('\\,', ',').strip()
        if cc and len(cc) > 2 and not re.search(r'\d|\[phone\]', cc): g['city'][cc.title()] += 1
        zz = str(r.get('ContractorZip') or '').strip()
        if re.fullmatch(r'\d{5}(-?\d{4})?', zz): g['zip'][zz[:5]] += 1
        if r.get('ContractorNumber'): g['lic'].add(r['ContractorNumber'])
    out = []
    for k, g in groups.items():
        rows = g['rows']
        hs = [r for r in rows if r.get('City') == 'HOMESTEAD']
        if len(rows) < 3 and not hs:
            continue
        cats = collections.Counter(r.get('CategoryDescription1') or '?' for r in rows)
        tagc = collections.Counter(t for r in rows for t in tags_for(' '.join(str(r.get(f'CategoryDescription{i}') or '') for i in range(1, 11)) + ' ' + (r.get('DetailDescriptionComments') or '')))
        munis = collections.Counter(MUNI.get((r.get('FolioNumber') or '')[:2], 'other') for r in rows)
        exs = []
        for r in sorted(rows, key=lambda r: (r.get('City') != 'HOMESTEAD', -(float(r.get('EstimatedValue') or 0) if str(r.get('EstimatedValue') or '0').replace('.', '', 1).isdigit() else 0))):
            use = (r.get('ProposedUseDescription') or '').strip()
            if r.get('ResidentialCommercial') == 'R' or re.search(r'SINGLE FAMILY|DUPLEX|TOWNHOUSE', use.upper()):
                exs.append('single-family residence'); continue
            owner = biz_name(r.get('OwnerName'))
            area = 'Homestead' if r.get('City') == 'HOMESTEAD' else MUNI.get((r.get('FolioNumber') or '')[:2], '')
            exs.append(' / '.join(b for b in [r.get('PropertyAddress', '').strip() + (f' ({area})' if area else ''), owner, use.title()] if b))
        exu = list(dict.fromkeys(exs))
        examples = '; '.join([e for e in exu if e != 'single-family residence'][:5])
        n_sfr = exs.count('single-family residence')
        if n_sfr:
            examples += ('; ' if examples else '') + f'{n_sfr} single-family residence(s)'
        name = g['names'].most_common(1)[0][0]
        out.append({
            'contractor': name,
            'city_portal': 'Miami-Dade County open data (County-issued permits: unincorporated areas + MDFR fire-alarm reviews in municipalities incl. Homestead)',
            'permit_count': len(rows),
            'work_types': '; '.join(f'{c} ({n})' for c, n in cats.most_common(6)) + (' | tags: ' + ', '.join(f'{t} {c}' for t, c in tagc.most_common()) if tagc else ''),
            'examples': mask(examples),
            'date_range': fmt_range([r.get('PermitIssuedDate') for r in rows]) + ' (issue dates)',
            'contractor_municipality': g['city'].most_common(1)[0][0] if g['city'] else '?',
            'contractor_zip': g['zip'].most_common(1)[0][0] if g['zip'] else '?',
            'website': '?',
            'source_url': MDC_SRC,
            'notes': mask(f"Homestead (city) permits: {len(hs)}. Property areas: {', '.join(f'{m} {c}' for m, c in munis.most_common(5))}. Contractor no.: {', '.join(sorted(g['lic'])[:3])}."),
            '_key': k, '_security_tags': dict(tagc), '_homestead': len(hs),
        })
    out.sort(key=lambda x: (-x['_homestead'] > 0, -x['permit_count']))
    out.sort(key=lambda x: -x['permit_count'])
    return out, len(R)

# ---------- bids ----------
def build_bids():
    B = load('bids_working.json', [])
    return [{k: mask(v) if isinstance(v, str) else v for k, v in b.items() if not k.startswith('_')} for b in B], B

if __name__ == '__main__':
    mb, mb_noc, mb_rows, mb_total = build_mb()
    cg, cg_total = build_cg()
    mdc, mdc_total = build_mdc()
    bids, braw = build_bids()
    extra = load('bids_extra_summaries.json', {}) or {}
    permits = mb + cg + mdc
    data = {
        'permits': [{k: v for k, v in p.items() if not k.startswith('_')} for p in permits],
        'bids': bids,
        'contractor_summaries': extra.get('contractor_summaries', []),
        'top_picks': extra.get('top_picks', []),
        'notes': extra.get('notes', ''),
    }
    json.dump(data, open(OUT, 'w'), indent=1, ensure_ascii=False)
    # also dump an analysis helper for summary writing
    json.dump({'mb': mb, 'mdc': mdc, 'stats': {'mb_permits_24mo': mb_total, 'mb_checked': mb_rows, 'mb_no_contractor': mb_noc, 'cg_permits_24mo': cg_total, 'mdc_rows_24mo': mdc_total}},
              open(RAW + 'pb_analysis.json', 'w'), indent=1)
    print('permits rows', len(data['permits']), 'mb', len(mb), 'cg', len(cg), 'mdc', len(mdc), 'bids', len(bids))
    print({'mb_permits_24mo': mb_total, 'mb_checked': mb_rows, 'mb_no_contractor': mb_noc, 'cg_permits_24mo': cg_total, 'mdc_rows_24mo': mdc_total})
