"""For each local firm website: obey robots.txt, fetch homepage, find career/job links, fetch them, save text.
Output: leadgen/raw/hiring/careers/<domain>.txt and a summary line per site."""
import requests, time, re, os, sys
from urllib.parse import urljoin, urlparse
from urllib import robotparser
from bs4 import BeautifulSoup
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
OUTD = '/home/user/ash/leadgen/raw/hiring/careers'; os.makedirs(OUTD, exist_ok=True)
sites = sys.argv[1:]
KW = re.compile(r'career|job|employ|hiring|join[-_ ]?(our|the)?[-_ ]?team|work[-_ ]with[-_ ]us|opportunit', re.I)
def get(u):
    return requests.get(u, headers={'User-Agent': UA}, timeout=25, allow_redirects=True)
for site in sites:
    base = site if site.startswith('http') else 'https://' + site
    dom = urlparse(base).netloc.replace('www.', '')
    rp = robotparser.RobotFileParser()
    try:
        rr = get(urljoin(base, '/robots.txt'))
        rp.parse(rr.text.splitlines() if rr.status_code == 200 else [])
    except Exception:
        rp.parse([])
    lines = []
    try:
        if not rp.can_fetch('*', base):
            print(dom, 'ROBOTS DISALLOW'); continue
        r = get(base); time.sleep(3)
        s = BeautifulSoup(r.text, 'lxml')
        links = set()
        for a in s.select('a[href]'):
            href = a['href']; txt = a.get_text(' ', strip=True)
            if KW.search(href) or KW.search(txt):
                u = urljoin(r.url, href)
                if urlparse(u).netloc.replace('www.', '') == urlparse(r.url).netloc.replace('www.', '') or any(k in u for k in ['careerplug','bamboohr','applytojob','workable','paylocity','indeed','greenhouse','lever','breezy','rippling','adp','ziprecruiter','jobs']):
                    links.add(u)
        print(dom, r.status_code, 'career-links:', sorted(links)[:8], flush=True)
        lines.append(f'HOME {r.url} {r.status_code}')
        for u in sorted(links)[:4]:
            if urlparse(u).netloc.replace('www.','') == dom and not rp.can_fetch('*', u):
                lines.append(f'SKIP robots {u}'); continue
            try:
                rr = get(u); time.sleep(3)
                t = ' '.join(BeautifulSoup(rr.text, 'lxml').get_text(' ', strip=True).split())
                lines.append(f'=== {u} {rr.status_code}\n{t[:6000]}')
            except Exception as e:
                lines.append(f'ERR {u} {e}')
    except Exception as e:
        print(dom, 'ERR', e, flush=True)
        lines.append(f'ERR {e}')
    open(os.path.join(OUTD, dom + '.txt'), 'w').write('\n'.join(lines))
