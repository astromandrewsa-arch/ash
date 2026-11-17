"""Miami-Dade County legislative keyword search (public search box at miamidade.gov/govaction/keywordsearch.asp).
Usage: python3 pb_mdc_govaction.py "kw1" "kw2" ...   -> raw/permits/bids/mdc_govaction_<kw>.json (title, file no, link)
One request every 4 s."""
import json, re, sys, time, requests
from bs4 import BeautifulSoup

URL = 'https://www.miamidade.gov/govaction/keywordsearch.asp'

def search(s, kw, d1='01/01/2024', d2='11/17/2026'):
    r = s.post(URL, data={'mtintro': d1, 'mtintro2': d2, 'mttitle': kw, 'btnSubmit': 'Search'}, timeout=120)
    soup = BeautifulSoup(r.text, 'lxml')
    rows = []
    for tr in soup.find_all('tr'):
        tds = tr.find_all('td')
        if len(tds) < 2:
            continue
        a = tr.find('a', href=True)
        txt = [td.get_text(' ', strip=True) for td in tds]
        if a and re.search(r'matter|\.pdf|legistarfiles', a['href'], re.I):
            rows.append({'cells': txt, 'href': a['href']})
    return r.status_code, rows, r.text

if __name__ == '__main__':
    s = requests.Session(); s.headers['User-Agent'] = 'Mozilla/5.0 (research script)'
    s.get('https://www.miamidade.gov/govaction/keywordsearch.asp', timeout=60)
    for kw in sys.argv[1:]:
        time.sleep(4)
        code, rows, html = search(s, kw)
        print(kw, code, len(rows), flush=True)
        fn = re.sub(r'\W+', '_', kw)
        json.dump(rows, open(f'/home/user/ash/leadgen/raw/permits/bids/mdc_govaction_{fn}.json', 'w'), indent=1)
        if not rows:
            open(f'/home/user/ash/leadgen/raw/permits/bids/mdc_govaction_{fn}.html', 'w').write(html)
