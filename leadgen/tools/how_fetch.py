"""how_fetch.py: polite fetcher for the houses-of-worship research (>=3.5 s between requests to the SAME host).
Saves redacted HTML + visible text under leadgen/raw/how/<slug>.{html,txt}. Phone numbers are stripped on save.
usage: python3 how_fetch.py URL [URL ...]   or   python3 how_fetch.py @urls.txt   (add --force to refetch)
Different hosts are fetched concurrently (one thread per host), each host strictly sequential with 3.5 s gaps.
"""
import sys, os, time, re, hashlib, threading
from urllib.parse import urlparse
import requests
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from td_redact import redact
from bs4 import BeautifulSoup

UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'raw', 'how')
os.makedirs(OUT, exist_ok=True)


def slug(u):
    s = re.sub(r'^https?://(www\.)?', '', u).strip('/')
    s = re.sub(r'[^A-Za-z0-9]+', '_', s)
    if len(s) > 150:
        s = s[:130] + '_' + hashlib.md5(u.encode()).hexdigest()[:10]
    return s or hashlib.md5(u.encode()).hexdigest()


def path_for(u):
    return os.path.join(OUT, slug(u))


def fetch_one(u, force=False):
    fn = path_for(u)
    if os.path.exists(fn + '.html') and not force:
        print('SKIP', u, flush=True)
        return None
    try:
        r = requests.get(u, headers={'User-Agent': UA, 'Accept': 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
                                     'Accept-Language': 'en-US,en;q=0.9'}, timeout=40, allow_redirects=True)
        print(r.status_code, u, '->', r.url if r.url != u else '', len(r.text), flush=True)
        txt_raw = r.text
        open(fn + '.html', 'w').write(redact(txt_raw))
        open(fn + '.meta', 'w').write(f'{r.status_code}\n{r.url}\n')
        if 'json' in r.headers.get('content-type', ''):
            open(fn + '.txt', 'w').write(redact(txt_raw))
        else:
            soup = BeautifulSoup(txt_raw, 'lxml')
            for t in soup(['script', 'style', 'noscript']):
                t.decompose()
            txt = re.sub(r'\n\s*\n+', '\n', soup.get_text('\n'))
            open(fn + '.txt', 'w').write(redact(txt))
        return True
    except Exception as e:
        print('ERR', u, str(e)[:200], flush=True)
        open(fn + '.meta', 'w').write(f'ERR\n{str(e)[:300]}\n')
        return False


def run(urls, force=False):
    by_host = {}
    for u in urls:
        by_host.setdefault(urlparse(u).netloc.lower().removeprefix('www.'), []).append(u)

    def worker(lst):
        last = 0
        for u in lst:
            if os.path.exists(path_for(u) + '.html') and not force:
                print('SKIP', u, flush=True)
                continue
            wait = 3.5 - (time.time() - last)
            if wait > 0:
                time.sleep(wait)
            fetch_one(u, force)
            last = time.time()

    ths = []
    for h, lst in by_host.items():
        t = threading.Thread(target=worker, args=(lst,))
        t.start()
        ths.append(t)
        # cap concurrency at 12 hosts
        while sum(1 for x in ths if x.is_alive()) >= 12:
            time.sleep(0.5)
    for t in ths:
        t.join()


if __name__ == '__main__':
    force = '--force' in sys.argv
    args = [a for a in sys.argv[1:] if a != '--force']
    urls = []
    for a in args:
        if a.startswith('@'):
            urls += [l.strip() for l in open(a[1:]) if l.strip() and not l.startswith('#')]
        else:
            urls.append(a)
    run(urls, force)
