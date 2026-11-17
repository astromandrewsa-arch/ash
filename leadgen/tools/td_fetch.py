"""td_fetch.py: polite fetcher (>=3.5 s between requests) that saves HTML + text.
usage: python3 td_fetch.py OUTDIR URL [URL ...]   or   python3 td_fetch.py OUTDIR @urls.txt
"""
import sys, os, time, re, hashlib
import requests
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from td_redact import redact
from bs4 import BeautifulSoup
UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
out = sys.argv[1]
urls = []
for a in sys.argv[2:]:
    if a.startswith('@'):
        urls += [l.strip() for l in open(a[1:]) if l.strip()]
    else:
        urls.append(a)
os.makedirs(out, exist_ok=True)
def slug(u):
    s = re.sub(r'^https?://', '', u).strip('/')
    s = re.sub(r'[^A-Za-z0-9]+', '_', s)[:120]
    return s or hashlib.md5(u.encode()).hexdigest()
for i, u in enumerate(urls):
    fn = os.path.join(out, slug(u))
    if os.path.exists(fn + '.html'):
        print('SKIP', u); continue
    try:
        r = requests.get(u, headers={'User-Agent': UA, 'Accept': 'text/html,application/xhtml+xml'}, timeout=40)
        print(r.status_code, u, len(r.text))
        open(fn + '.html', 'w').write(redact(r.text))
        soup = BeautifulSoup(r.text, 'lxml')
        for t in soup(['script', 'style', 'noscript']): t.decompose()
        txt = re.sub(r'\n\s*\n+', '\n', soup.get_text('\n'))
        open(fn + '.txt', 'w').write(redact(txt))
    except Exception as e:
        print('ERR', u, str(e)[:200])
    if i < len(urls) - 1:
        time.sleep(3.5)
