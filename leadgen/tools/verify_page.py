"""Fetch a page once and print sentences mentioning given keywords plus address-like lines (phones stripped)."""
import sys, re, requests, time
sys.path.insert(0, '/home/user/ash/leadgen/tools')
from mfr_common import UA, strip_phones
from bs4 import BeautifulSoup
url = sys.argv[1]; kws = sys.argv[2].split('|')
try:
    r = requests.get(url, headers={'User-Agent': UA}, timeout=40)
except Exception as e:
    print('ERR', e); sys.exit()
print('STATUS', r.status_code, r.url)
s = BeautifulSoup(r.text, 'lxml')
for t in s(['script', 'style', 'noscript']): t.decompose()
title = s.title.get_text(strip=True) if s.title else ''
print('TITLE', title)
txt = s.get_text('\n', strip=True)
lines = txt.split('\n')
shown = set()
for i, l in enumerate(lines):
    if any(k.lower() in l.lower() for k in kws) and l not in shown and len(l) < 500:
        shown.add(l); print('KW:', strip_phones(l)[:400])
for l in lines:
    if re.search(r'\b(FL|Florida)\b[ ,]*\d{5}', l) and l not in shown:
        shown.add(l); print('ADDR:', strip_phones(l)[:300])
