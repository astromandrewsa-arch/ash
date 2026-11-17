"""City of Miami IQM2 (miamifl.iqm2.com) public quick-search box. robots.txt asks Crawl-delay: 60, so this waits 61 s
between requests. Usage: python3 pb_iqm2_search.py "keyword" [...]  -> raw/permits/bids/com_iqm2_<kw>.html (+ parsed .json)"""
import json, re, sys, time, requests
from bs4 import BeautifulSoup

BASE = 'https://miamifl.iqm2.com/Citizens/'
OUT = '/home/user/ash/leadgen/raw/permits/bids/'
s = requests.Session(); s.headers['User-Agent'] = 'Mozilla/5.0 (research script)'
html = open(OUT + 'com_iqm2.html', encoding='utf-8', errors='ignore').read()  # Default.aspx fetched earlier
for kw in sys.argv[1:]:
    soup = BeautifulSoup(html, 'lxml')
    data = {i.get('name'): i.get('value', '') for i in soup.find_all('input') if i.get('name') and i.get('type') in ('hidden', None, 'text')}
    data['ctl00$txtQuickSearch'] = kw
    data['ctl00$btnQuickSearch.x'] = '5'; data['ctl00$btnQuickSearch.y'] = '5'
    time.sleep(61)
    r = s.post(BASE + 'Default.aspx', data=data, timeout=120)
    fn = re.sub(r'\W+', '_', kw)
    open(OUT + f'com_iqm2_{fn}.html', 'w').write(r.text)
    res = BeautifulSoup(r.text, 'lxml')
    rows = []
    for a in res.find_all('a', href=True):
        if re.search(r'Detail_LegiFile|FileOpen|Detail_Meeting|SplitView', a['href']):
            rows.append({'text': a.get_text(' ', strip=True)[:300], 'href': a['href']})
    json.dump({'url': r.url, 'status': r.status_code, 'rows': rows}, open(OUT + f'com_iqm2_{fn}.json', 'w'), indent=1)
    print(kw, r.status_code, r.url, len(rows), flush=True)
    html = r.text
