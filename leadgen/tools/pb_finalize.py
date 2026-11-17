"""Finalize leadgen/data/permits_bids.json: build permits/bids, build summaries, fill notes, choose top picks, rebuild."""
import json, subprocess, re, sys, collections
sys.path.insert(0, '/home/user/ash/leadgen/tools')
from pb_mask import mask
RAW = '/home/user/ash/leadgen/raw/permits/'
T = '/home/user/ash/leadgen/tools/'

def run(script):
    r = subprocess.run(['python3', '-I', T + script], capture_output=True, text=True)
    if r.returncode: print(r.stderr); raise SystemExit(1)
    return r.stdout

run('pb_build_permits_bids.py')
A = json.load(open(RAW + 'pb_analysis.json'))
st = A['stats']
mbrows = json.load(open(RAW + 'mb_workpermit_contractors.json'))
named = sum(1 for p in A['mb'] for _ in range(p['permit_count']))
hs = sum(p.get('_homestead', 0) for p in A['mdc'])
from pb_build_permits_bids import mdc_rows
hs_rows = sum(1 for r in mdc_rows() if r.get('City') == 'HOMESTEAD')
notes = open(RAW + 'pb_notes_template.txt').read().format(
    MB_TOTAL=st['mb_permits_24mo'], MB_CHECKED=st['mb_checked'], MB_NAMED=named, MB_NOC=st['mb_no_contractor'],
    CG_TOTAL=st['cg_permits_24mo'], MDC_ROWS=st['mdc_rows_24mo'], HS_ROWS=hs_rows)
if st['mb_checked'] < st['mb_permits_24mo'] - 10:
    notes += f"\n8. Miami Beach work-permit PDF harvest incomplete at time of writing: {st['mb_checked']} of {st['mb_permits_24mo']} permits checked (rerun leadgen/tools/pb_mb_workpermits.py, it resumes)."
open(RAW + 'pb_notes.txt', 'w').write(mask(notes))

out = run('pb_summaries.py')
S = json.load(open(RAW + 'bids_extra_summaries.json'))
by = {s['heading']: s for s in S['contractor_summaries']}

def find(pat):
    for h in by:
        if re.search(pat, h, re.I):
            return h
    return None

mbc = {p['_key']: p for p in A['mb']}
def mbn(pat):
    for k, p in mbc.items():
        if re.search(pat, k, re.I): return p['permit_count']
    return 0

picks = []
def add(pat, reason):
    h = find(pat)
    if h and h not in [x[0] for x in picks]:
        picks.append([h, reason])

add(r'SOUTH FLORIDA ELECTRICAL CONSULTANT', 'Installs Miami Beach Police CCTV (5 park/neighborhood/beachwalk CCTV projects 2022-2025) and LPRs - closest fit to police-facing video in a preferred zone.')
add(r'^INTEGRATED SECURITY SYSTEMS', f'Holds Miami Beach Citywide Security Access contract (extended to 11/2027) and pulled {mbn("^INTEGRATED SECURITY SYSTEMS")} Miami Beach access-control permits incl. city buildings.')
add(r'AVI INTEGRATORS', 'Miami Beach Citywide Security Access contract (renewal to 11/2027); also county access-control/fire permits incl. Homestead (as Security 101).')
add(r'CONVERGINT', f'Most active security integrator in Miami Beach permits ({mbn("CONVERGINT")} permits, mostly cameras and access control at Mount Sinai Medical Center).')
add(r'JOHNSON CONTROLS US HOLDINGS|JOHNSON CONTROLS SECURITY', 'Miami Beach Citywide Security Access contract + Homestead and county burglar/access/CCTV permits; national firm with local branch.')
add(r'4 BEST BUSINESS', 'Primary M-DCPS camera maintenance contractor ($4.52M/yr, per-camera pricing) and on the 2026-2029 camera install pool.')
add(r'QUALITY WIRING', 'On every M-DCPS camera pool (2021, 2026 supplemental, 2026-2029) and the County security/access-control pool EVN0001568; Doral-based.')
add(r'ADVANCE SECURITY GROUP', 'M-DCPS camera pools 2021/2026 + 2026 fire alarm alternate; Miami (33015) local integrator with public-sector track record.')
add(r'EVERON', 'M-DCPS 2026-2029 camera pool; Miami Beach CCTV/access permits and 100+ county permits (Miramar branch).')
add(r'BRYANT INTEGRATED', 'M-DCPS 2026 camera pool + County security pool EVN0001568 (access control/security equipment) + Miami Beach permits.')
add(r'WISE BUILDING TECHNOLOGIES', 'Primary M-DCPS fire alarm contractor 2026-2029 and the busiest county fire-alarm permit holder (incl. Homestead) - life-safety channel into commercial buildings.')
add(r'CERTIFIED NETWORK PROFESSIONALS', 'Runs the Miami International Airport Airport Security Network (incl. Homestead Airport); sole authorized service provider; $28.2M contract.')
S['top_picks'] = picks
S['notes'] = mask(notes)
json.dump(S, open(RAW + 'bids_extra_summaries.json', 'w'), indent=1)
run('pb_build_permits_bids.py')
d = json.load(open('/home/user/ash/leadgen/data/permits_bids.json'))
txt = json.dumps(d)
ph = re.findall(r'(?<!\d)(?:\+?1[\s.-]*)?\(?\d{3}\)?[\s.-]*\d{3}[\s.-]+\d{4}(?!\d)', txt)
print('permits', len(d['permits']), 'bids', len(d['bids']), 'summaries', len(d['contractor_summaries']), 'top', len(d['top_picks']), 'phone-like', ph[:5])
print(collections.Counter(p['city_portal'].split(' (')[0] for p in d['permits']))
