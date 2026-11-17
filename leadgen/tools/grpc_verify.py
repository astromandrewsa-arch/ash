"""Group C: fetch public pages; print snippets around brand mentions and FL addresses. Phone numbers are masked.
Usage: python3 -I grpc_verify.py <brand_regex> <url> [<url> ...]"""
import sys, re, time, requests
from bs4 import BeautifulSoup
UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36'
PHONE = re.compile(r'(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}')
brand = re.compile(sys.argv[1], re.I)
for i, url in enumerate(sys.argv[2:]):
    if i: time.sleep(3)
    try:
        r = requests.get(url, headers={'User-Agent': UA}, timeout=30)
    except Exception as e:
        print('##', url, 'ERROR', str(e)[:200]); continue
    s = BeautifulSoup(r.content, 'lxml')
    title = s.title.get_text(strip=True) if s.title else ''
    for x in s(['script', 'style', 'noscript']): x.decompose()
    t = PHONE.sub('[phone]', s.get_text(' ', strip=True))
    print('##', url, r.status_code, r.url, '|', title)
    for n, m in enumerate(brand.finditer(t)):
        if n >= 4: break
        print('   B:', t[max(0, m.start()-160):m.end()+160])
    addrs = set(m.group(0) for m in re.finditer(r'\d{2,6}\s+[^|]{3,70}?,?\s*(?:FL|Florida)\.?,?\s+3\d{4}', t))
    for a in list(addrs)[:5]: print('   A:', a)
    em = set(re.findall(r'[\w.+-]+@[\w-]+\.[\w.]+', t))
    if em: print('   E:', ', '.join(list(em)[:4]))
