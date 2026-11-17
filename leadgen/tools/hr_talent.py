"""Fetch talent.com public search pages (robots allows /jobs) and parse job cards.
One request every 4 s. Output: leadgen/raw/hiring/talent_cards.json"""
import requests, time, json, re, sys
from bs4 import BeautifulSoup
from urllib.parse import urlencode
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
OUT = '/home/user/ash/leadgen/raw/hiring/talent_cards.json'
queries = ["cctv technician","access control technician","alarm technician","low voltage technician",
           "security installer","security systems technician","security camera installer",
           "security sales","security account executive","alarm sales","security project manager",
           "low voltage project manager","fire alarm security technician"]
locs = ["Miami, FL","Hialeah, FL","Doral, FL","Homestead, FL","Coral Gables, FL","Miami Beach, FL"]
if len(sys.argv) > 1 and sys.argv[1] == 'quick':
    locs = locs[:1]
res = {}
try:
    res = json.load(open(OUT))
except Exception:
    pass
s = requests.Session(); s.headers['User-Agent'] = UA
for q in queries:
    for l in locs:
        key = f"{q}|{l}"
        if key in res: continue
        url = "https://www.talent.com/jobs?" + urlencode({"k": q, "l": l})
        try:
            r = s.get(url, timeout=30)
        except Exception as e:
            print("ERR", key, e); time.sleep(4); continue
        cards = []
        if r.status_code == 200:
            soup = BeautifulSoup(r.text, 'lxml')
            for a in soup.select('a[href*="view?id="]'):
                p = a
                for _ in range(4): p = p.parent
                parts = list(p.stripped_strings)
                cards.append({"href": "https://www.talent.com" + a['href'] if a['href'].startswith('/') else a['href'],
                              "text": ' | '.join(parts)[:700]})
        res[key] = {"status": r.status_code, "url": url, "cards": cards}
        print(key, r.status_code, len(cards), flush=True)
        json.dump(res, open(OUT, 'w'), indent=1)
        time.sleep(4)
