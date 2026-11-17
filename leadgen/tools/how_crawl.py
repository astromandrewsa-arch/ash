"""how_crawl.py: shallow, polite crawl of institution websites (home page + a few about/staff/contact pages).
- one thread per host, >=3.5 s between requests to the same host, max 14 hosts at once
- saves redacted HTML + text to leadgen/raw/how/sites/<host>/<slug>.{html,txt}; phone numbers stripped on save
usage: python3 how_crawl.py @sites.txt [--max=6]
"""
import sys, os, re, time, json, threading, hashlib
from urllib.parse import urljoin, urlparse
import requests
from bs4 import BeautifulSoup
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from td_redact import redact
import warnings
warnings.filterwarnings('ignore')
UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'raw', 'how', 'sites')
KEY = re.compile(r'about|staff|team|clergy|rabbi|leader|contact|admin|faculty|board|who-we|our-|history|security|member|directory|mission|visit|location|early|preschool|school|head-of|welcome', re.I)
BAD = re.compile(r'\.(pdf|jpe?g|png|gif|svg|webp|mp4|mp3|zip|docx?|xlsx?|ics)(\?|$)|/wp-content/|/feed|login|donat|calendar|event|/tag/|/category/|mailto:|tel:|javascript:|#', re.I)


def hostkey(u):
    return urlparse(u).netloc.lower().removeprefix('www.')


def slug(u):
    p = urlparse(u)
    s = re.sub(r'[^A-Za-z0-9]+', '_', (p.path + ('_' + p.query if p.query else '')).strip('/')) or 'index'
    return s[:100] if len(s) <= 100 else s[:80] + hashlib.md5(u.encode()).hexdigest()[:8]


def get(u):
    r = requests.get(u, headers={'User-Agent': UA, 'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8', 'Accept-Language': 'en-US,en;q=0.9'},
                     timeout=30, allow_redirects=True)
    return r


def save(dirp, u, r):
    os.makedirs(dirp, exist_ok=True)
    fn = os.path.join(dirp, slug(u))
    html = r.text
    open(fn + '.html', 'w').write(redact(html))
    soup = BeautifulSoup(html, 'lxml')
    for t in soup(['script', 'style', 'noscript']):
        t.decompose()
    txt = re.sub(r'\n\s*\n+', '\n', soup.get_text('\n'))
    open(fn + '.txt', 'w').write(f'URL: {r.url}\nSTATUS: {r.status_code}\n' + redact(txt))
    return html


def crawl(site, maxpages):
    if not site.startswith('http'):
        site = 'https://' + site
    hk = hostkey(site)
    dirp = os.path.join(ROOT, hk)
    if os.path.exists(os.path.join(dirp, '_done')):
        print('SKIP', site, flush=True)
        return
    log = []
    try:
        r = get(site)
    except Exception as e:
        try:
            time.sleep(3.5)
            site2 = site.replace('https://', 'http://')
            r = get(site2)
        except Exception as e2:
            print('ERR', site, str(e)[:120], flush=True)
            os.makedirs(dirp, exist_ok=True)
            open(os.path.join(dirp, '_done'), 'w').write(f'ERR {str(e)[:200]}\n')
            return
    print(r.status_code, site, '->', r.url, flush=True)
    log.append(f'{r.status_code} {site} -> {r.url}')
    html = save(dirp, site, r)
    final_host = urlparse(r.url).netloc.lower()
    soup = BeautifulSoup(html, 'lxml')
    links = []
    for a in soup.find_all('a', href=True):
        h = urljoin(r.url, a['href'].strip())
        if urlparse(h).netloc.lower() != final_host:
            continue
        if BAD.search(h):
            continue
        txt = a.get_text(' ', strip=True)
        if KEY.search(h) or KEY.search(txt):
            h = h.split('#')[0]
            if h.rstrip('/') != r.url.rstrip('/') and h not in links:
                links.append(h)
    # prioritize leadership/staff/contact
    def score(h):
        s = h.lower()
        for i, k in enumerate(['staff', 'clergy', 'rabbi', 'leader', 'team', 'administration', 'about', 'contact', 'security', 'board', 'faculty', 'who']):
            if k in s:
                return i
        return 50
    links.sort(key=score)
    for h in links[:maxpages]:
        time.sleep(3.5)
        try:
            rr = get(h)
            log.append(f'{rr.status_code} {h}')
            if 'text/html' in rr.headers.get('content-type', ''):
                save(dirp, h, rr)
        except Exception as e:
            log.append(f'ERR {h} {str(e)[:100]}')
    open(os.path.join(dirp, '_done'), 'w').write('\n'.join(log) + '\n')


if __name__ == '__main__':
    mx = 6
    sites = []
    for a in sys.argv[1:]:
        if a.startswith('--max='):
            mx = int(a[6:])
        elif a.startswith('@'):
            sites += [l.strip() for l in open(a[1:]) if l.strip() and not l.startswith('#')]
        else:
            sites.append(a)
    # group by host so same host is never crawled concurrently
    seen, uniq = set(), []
    for s in sites:
        k = hostkey(s if s.startswith('http') else 'https://' + s)
        if k not in seen:
            seen.add(k); uniq.append(s)
    ths = []
    for s in uniq:
        while sum(1 for t in ths if t.is_alive()) >= 14:
            time.sleep(0.5)
        t = threading.Thread(target=crawl, args=(s, mx)); t.start(); ths.append(t)
    for t in ths:
        t.join()
    print('ALL DONE', flush=True)
