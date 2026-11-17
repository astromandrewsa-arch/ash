# Queries the public resideo.com Find-a-Pro (Service Type = Security, radius 50 mi) for each Miami-Dade ZIP,
# the same JSON endpoint the page calls. Phone fields are removed before anything is written.
import json, time, sys, os, requests
sys.path.insert(0, os.path.dirname(__file__))
from zips import ZIPS
H = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
     'X-Requested-With': 'XMLHttpRequest', 'Referer': 'https://www.resideo.com/us/en/find-a-pro/'}
URL = 'https://www.resideo.com/rde/findAPro/professionals'
out = {}
for z in ZIPS:
    pros, start = [], 0
    while True:
        params = dict(rdesite='Resideo', rdelanguage='en-US', SiteName='Resideo', ZipCode=z, Radius='50', StartIndex=str(start),
                      PageSize='12', SortingType='Dealer Type, Distance', Categories='98551', City='', State='', Country='US',
                      SortServiceBy='CategoryName')
        for attempt in range(2):
            try:
                d = requests.get(URL, params=params, headers=H, timeout=60).json(); break
            except Exception as e:
                print(z, 'error', str(e)[:200]); d = None; time.sleep(45)
        if d is None: break
        for p in d.get('Professionals') or []:
            p.pop('PhoneNumber', None); pros.append(p)
        start += 12
        time.sleep(3.5)
        if start >= (d.get('TotalResults') or 0): break
    out[z] = pros
    print(z, len(pros), flush=True)
json.dump(out, open(os.path.join(os.path.dirname(__file__), '..', 'raw', 'resideo_rde_professionals.json'), 'w'), indent=1)
