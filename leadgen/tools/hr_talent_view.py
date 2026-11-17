"""Fetch talent.com /view?id= pages (allowed by robots) and print key text. 4 s between requests."""
import requests, time, sys, re, json
from bs4 import BeautifulSoup
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
out = {}
for u in sys.argv[1:]:
    r = requests.get(u, headers={'User-Agent': UA}, timeout=30)
    s = BeautifulSoup(r.text, 'lxml')
    info = {'status': r.status_code}
    for sc in s.select('script[type="application/ld+json"]'):
        try:
            d = json.loads(sc.string)
        except Exception:
            continue
        items = d.get('@graph', [d]) if isinstance(d, dict) else d
        for it in items:
            if isinstance(it, dict) and it.get('@type') == 'JobPosting':
                info['title'] = it.get('title'); info['datePosted'] = it.get('datePosted'); info['validThrough'] = it.get('validThrough')
                info['org'] = (it.get('hiringOrganization') or {}).get('name')
                loc = it.get('jobLocation'); info['loc'] = json.dumps(loc)[:250]
                info['salary'] = json.dumps(it.get('baseSalary'))[:200]
                info['desc'] = BeautifulSoup(it.get('description', ''), 'lxml').get_text(' ', strip=True)[:2500]
    if 'title' not in info:
        info['text'] = ' '.join(s.get_text(' ', strip=True).split())[:2500]
    out[u] = info
    print('=' * 100); print(u); 
    for k, v in info.items(): print(f'  {k}: {v}')
    time.sleep(4)
