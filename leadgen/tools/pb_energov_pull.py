"""Pull recent permits of selected types from a Tyler EnerGov CSS public search (no login; contacts are not public).
Usage: python3 pb_energov_pull.py mb|cg
Sorts by IssueDate descending and stops once IssueDate < cutoff. One request every 3.5 s."""
import json, sys, copy, time
sys.path.insert(0, '/home/user/ash/leadgen/tools')
from pb_energov import EnerGov

CUTOFF = '2024-11-17'
RAW = '/home/user/ash/leadgen/raw/permits/'
CFG = {
    'mb': dict(base='https://energovcss.miamibeachfl.gov/energovprod/selfservice', tid=3, tname='miamibeachflprod2', turl='MiamiBeachFLProd',
               types_file=RAW + 'mb_permit_types.txt',
               match=['Low Voltage', 'Fire Alarm', 'BDA', 'Emergency Fire Alarm']),
    'cg': dict(base='https://coralgablesfl-energovpub.tylerhost.net/Apps/SelfService', tid=1, tname='CoralGablesFLProd', turl='CoralGablesFLProd',
               types_file=RAW + 'cg_permit_types.txt',
               match=['Low Voltage', 'Fire - Fire Alarm', 'Fire Alarm (Simplified)', 'Fire - Access Control', 'Public Safety Amplification', 'BMT: Fire - Fire Alarm']),
}

def main(city):
    c = CFG[city]
    tmpl = json.load(open(RAW + 'mb_adv_template.json'))
    e = EnerGov(c['base'], c['tid'], c['tname'], c['turl'], tmpl)
    types = []
    for line in open(c['types_file']):
        tid, name = [x.strip() for x in line.split('|', 1)]
        if any(m.lower() in name.lower() for m in c['match']) and 'OLD DONT USE' not in name and 'TEST' not in name:
            types.append((tid, name))
    print(types, flush=True)
    out = []
    for tid, name in types:
        page = 1
        while True:
            b = copy.deepcopy(e.template)
            b['PermitCriteria'].update({'PermitTypeId': tid, 'PageNumber': page, 'PageSize': 100, 'SortBy': 'IssueDate', 'SortAscending': False})
            b.update(PageNumber=page, PageSize=100, SortBy='IssueDate', SortAscending=False)
            try:
                R = e.post('/api/energov/search/search', b)['Result']
            except Exception as ex:
                print('ERR', name, page, ex, flush=True); time.sleep(45)
                try:
                    R = e.post('/api/energov/search/search', b)['Result']
                except Exception as ex2:
                    print('ERR2', ex2, flush=True); break
            rows = R.get('EntityResults') or []
            stop = False
            for x in rows:
                d = (x.get('IssueDate') or '')[:10]
                if not d:
                    continue
                if d < CUTOFF:
                    stop = True; continue
                out.append({k: x.get(k) for k in ['CaseId', 'CaseNumber', 'CaseType', 'CaseWorkclass', 'CaseStatus', 'ProjectName', 'IssueDate', 'ApplyDate', 'FinalDate', 'AddressDisplay', 'MainParcel', 'Description']} | {'type_query': name})
            print(name, 'page', page, 'rows', len(rows), 'kept total', len(out), 'total found', R.get('TotalFound'), flush=True)
            json.dump(out, open(RAW + f'{city}_energov_permits.json', 'w'), indent=0)
            if stop or len(rows) < 100 or page >= (R.get('TotalPages') or 0):
                break
            page += 1
    print('done', len(out))

if __name__ == '__main__':
    main(sys.argv[1])
