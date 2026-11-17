"""For each Miami Beach low-voltage / fire-alarm permit (from pb_energov_pull.py), read the public attachment list on the
Civic Access permit page and fetch the city-generated "Building Work Permit.pdf" (public, no login), then extract the
Contractor block (name, license, address). PDFs are kept only in a temp file and deleted; phone numbers are never stored.
One request every 3.2 s. Resumable."""
import json, os, re, subprocess, sys, time
sys.path.insert(0, '/home/user/ash/leadgen/tools')
from pb_energov import EnerGov

RAW = '/home/user/ash/leadgen/raw/permits/'
OUT = RAW + 'mb_workpermit_contractors.json'
TMP = '/tmp/claude-0/-home-user-ash/fe2b7749-daf0-570a-89ca-62af70563f44/scratchpad/pb_tmp.pdf'
PHONE = re.compile(r'\(?\d{3}\)?[ .-]?\d{3}[ .-]\d{4}')

class MB(EnerGov):
    def _wait(self):
        d = time.time() - self.last
        if d < 3.2: time.sleep(3.2 - d)
        self.last = time.time()

def parse(text):
    lines = text.splitlines()
    for i, l in enumerate(lines):
        if l.strip().startswith('Contractor:'):
            oi = l.find('Owner:')
            cut = oi if oi > 0 else len(l)
            first = l[:cut].replace('Contractor:', '').strip()
            owner = l[oi + 6:].strip() if oi > 0 else ''
            block = [first] if first else []
            for l2 in lines[i + 1:i + 7]:
                if l2.strip().startswith('Description:'):
                    break
                left = l2[:cut].strip()
                if left:
                    block.append(left)
            name = block[0] if block else ''
            lic = next((b.strip('[]') for b in block if b.startswith('[')), '')
            csz = next((b for b in block if re.search(r',\s*[A-Z]{2}\s+\d{5}', b)), '')
            m = re.search(r'^(.*?),\s*([A-Z]{2})\s+(\d{5})', csz)
            addr = next((b for b in block[1:] if not b.startswith('[') and b != csz), '')
            return {'contractor_block': block, 'contractor': name, 'license': lic, 'contractor_street': addr,
                    'contractor_city': m.group(1).strip() if m else '', 'contractor_state': m.group(2) if m else '',
                    'contractor_zip': m.group(3) if m else '', 'owner_first_line': owner}
    return {}

def main():
    permits = json.load(open(RAW + 'mb_energov_permits.json'))
    done = {}
    if os.path.exists(OUT):
        done = {r['CaseId']: r for r in json.load(open(OUT))}
    e = MB('https://energovcss.miamibeachfl.gov/energovprod/selfservice', 3, 'miamibeachflprod2', 'MiamiBeachFLProd', {})
    out = list(done.values())
    for n, p in enumerate(permits):
        if p['CaseId'] in done or p['CaseStatus'] in ('Void', 'Cancel'):
            continue
        rec = {'CaseId': p['CaseId'], 'CaseNumber': p['CaseNumber']}
        try:
            a = e.get(f"/api/energov/entity/attachments/search/entityattachments/{p['CaseId']}/1/true")
            atts = (a.get('Result') or {}).get('Attachments') or []
            rec['attachments'] = [x['FileName'] for x in atts]
            cand = sorted([x for x in atts if 'work permit' in x['FileName'].lower()], key=lambda x: x['AddedOn'], reverse=True) or \
                   sorted([x for x in atts if 'permit card' in x['FileName'].lower()], key=lambda x: x['AddedOn'], reverse=True)
            if cand:
                fid = cand[0]['AttachmentID']
                e._wait()
                r = e.s.get(e.base + '/api//energov/attachments/rangedownload/', headers={
                    'fileid': fid, 'filetoken': fid, 'filetype': 'attachment', 'downloadprovider': 'attachment',
                    'allowviewcorrection': 'false', 'range': 'bytes=0-19999999'}, timeout=90)
                if r.status_code in (200, 206) and r.content[:4] == b'%PDF':
                    open(TMP, 'wb').write(r.content)
                    txt = subprocess.run(['pdftotext', '-layout', TMP, '-'], capture_output=True, text=True).stdout
                    os.remove(TMP)
                    txt = PHONE.sub('[phone removed]', txt)
                    rec['source_file'] = cand[0]['FileName']
                    rec.update(parse(txt))
                    m = re.search(r'Master Permit:\s*(\S+)', txt)
                    rec['master_permit'] = m.group(1) if m else ''
                    m = re.search(r'Total Job Value:\s*(\$[\d,\.]+)', txt)
                    rec['job_value'] = m.group(1) if m else ''
                    m = re.search(r'Class Code:\s*(.+)', txt)
                    rec['class_code'] = m.group(1).strip() if m else ''
                else:
                    rec['error'] = f'download status {r.status_code}'
        except Exception as ex:
            rec['error'] = str(ex)[:200]
            time.sleep(30)
        out.append(rec)
        done[p['CaseId']] = rec
        if len(out) % 10 == 0:
            json.dump(out, open(OUT, 'w'), indent=0)
            print(n, len(out), rec.get('contractor'), flush=True)
    json.dump(out, open(OUT, 'w'), indent=0)
    print('done', len(out))

if __name__ == '__main__':
    main()
