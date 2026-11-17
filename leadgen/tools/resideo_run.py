# Queries the public Resideo Find-a-Pro (findapro.resideo.com) security search, the same Apex call the page makes,
# for each Miami-Dade ZIP. Phone fields are dropped before anything is written.
import json, time, subprocess, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from zips import ZIPS
URL = 'https://findapro.resideo.com/webruntime/api/apex/execute?language=en-US&asGuest=true&htmlEncode=false'
BUNDLE = os.path.join(os.path.dirname(__file__), 'certs', 'bundle_plus.pem')
out = {}
for z in ZIPS:
    body = json.dumps({"namespace":"","classname":"@udd/01pVs00000Fr3FM","method":"searchDealers","isContinuation":False,
        "params":{"serviceBackendValue":None,"concernBackendValues":None,"zipCode":z,"zipOnlyMatch":True,"sourceRecordId":None},"cacheable":False})
    for attempt in range(2):
        r = subprocess.run(['curl','--cacert',BUNDLE,'-sS','-m','60','-X','POST',URL,'-H','Content-Type: application/json',
            '-H','Origin: https://findapro.resideo.com','-H','Referer: https://findapro.resideo.com/','-A',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36','--data',body],capture_output=True,text=True)
        try:
            d = json.loads(r.stdout)['returnValue']; break
        except Exception as e:
            print(z, 'error', r.stdout[:200], r.stderr[:200]); d = None; time.sleep(45)
    if d is None: out[z] = 'ERROR'; continue
    for k in ('tier1Dealers','tier2Dealers'):
        for x in d.get(k) or []:
            x.pop('phone', None)
    d.pop('geoSearchLogId', None)
    out[z] = d
    n1, n2 = len(d.get('tier1Dealers') or []), len(d.get('tier2Dealers') or [])
    print(z, n1, n2, flush=True)
    time.sleep(3.5)
json.dump(out, open(os.path.join(os.path.dirname(__file__), '..', 'raw', 'resideo_searchDealers.json'), 'w'), indent=1)
