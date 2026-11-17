"""Scan M-DCPS School Board agenda archive (pdfs.dadeschools.net/Bdarch, robots: Allow /Bdarch/) for procurement award
items (E-140..E-169) in 2024-2026 and keep those whose SUBJECT mentions security/camera/access/alarm/intercom/etc.
Saves masked text of matching items to raw/permits/bids/mdcps_scan/. One request every 3.2 s."""
import os, re, subprocess, time, json, sys, requests
sys.path.insert(0, '/home/user/ash/leadgen/tools')
from pb_mask import mask

BASE = 'https://pdfs.dadeschools.net'
OUTD = '/home/user/ash/leadgen/raw/permits/bids/mdcps_scan/'
TMP = '/tmp/claude-0/-home-user-ash/fe2b7749-daf0-570a-89ca-62af70563f44/scratchpad/mdcps_tmp.pdf'
KW = re.compile(r'SECURITY|CAMERA|SURVEILLANCE|ACCESS CONTROL|ALARM|INTERCOM|VIDEO|INTRUSION|PANIC|WEAPON|VISITOR|RADIO|LOW VOLTAGE|CABLING|LOCK', re.I)
os.makedirs(OUTD, exist_ok=True)
s = requests.Session(); s.headers['User-Agent'] = 'Mozilla/5.0 (research script)'
last = [0.0]
def get(url):
    d = time.time() - last[0]
    if d < 3.2: time.sleep(3.2 - d)
    last[0] = time.time()
    return s.get(url, timeout=90)

found = []
for yr in ('2024', '2025', '2026'):
    idx = get(f'{BASE}/Bdarch/{yr}/').text
    meetings = sorted(set(re.findall(rf'/Bdarch/{yr}/(Bd\d{{6}})/', idx)))
    print(yr, meetings, flush=True)
    for m in meetings:
        lst = get(f'{BASE}/Bdarch/{yr}/{m}/agenda/').text
        files = sorted(set(re.findall(rf'/Bdarch/{yr}/{m}/agenda/(e1[4-6]\d[a-z\-]*\.pdf)', lst, re.I)))
        files = [f for f in files if 'old' not in f.lower()]
        for f in files:
            r = get(f'{BASE}/Bdarch/{yr}/{m}/agenda/{f}')
            if r.status_code != 200 or r.content[:4] != b'%PDF':
                continue
            open(TMP, 'wb').write(r.content)
            txt = subprocess.run(['pdftotext', '-layout', TMP, '-'], capture_output=True, text=True).stdout
            os.remove(TMP)
            subj = re.search(r'SUBJECT:\s*(.+?)(?:\n\s*\n|COMMITTEE:)', txt, re.S)
            subj = re.sub(r'\s+', ' ', subj.group(1)) if subj else txt[:200]
            hit = bool(KW.search(subj))
            print(m, f, 'HIT' if hit else '', subj[:120], flush=True)
            if hit:
                fn = f'{m}_{f.replace(".pdf", ".txt")}'
                open(OUTD + fn, 'w').write(mask(txt))
                found.append({'meeting': m, 'file': f, 'url': f'{BASE}/Bdarch/{yr}/{m}/agenda/{f}', 'subject': subj})
        json.dump(found, open(OUTD + 'index.json', 'w'), indent=1)
print('done', len(found))
