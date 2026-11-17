"""how_extract.py: summarize crawled site folders (leadgen/raw/how/sites/<host>) for manual review:
emails published on the site (mailto, text, Cloudflare-obfuscated), leadership lines, size and security lines.
usage: python3 how_extract.py HOST [HOST ...]   (or no args = all hosts)
Output is printed (no phone numbers: raw files were already redacted)."""
import os, re, sys, glob, json
from urllib.parse import unquote
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'raw', 'how', 'sites')
EM = re.compile(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}')
ROLE = re.compile(r'\b(senior rabbi|spiritual leader|executive director|head of school|principal|security|administrator|rosh yeshiva|dean|ceo|chief executive|managing director|school director|founding director|executive vice president)\b|^rabbi\b|\brabbi [A-Z]', re.I)
SIZE = re.compile(r'\b(\d[\d,]*\+?)\s+(member families|member households|families|members|students|children|households|congregants|acres|square[- ]feet|sq\.? ?ft|buildings)\b', re.I)
SEC = re.compile(r'security|armed guard|police officer|off-duty|nonprofit security grant|NSGP|safety committee|guard', re.I)
BADEM = re.compile(r'\.(png|jpe?g|gif|webp|svg)$|example\.com|sentry|wixpress|godaddy|domain\.com|email\.com$|yourname|@2x', re.I)


def cf_decode(hexs):
    try:
        k = int(hexs[:2], 16)
        return ''.join(chr(int(hexs[i:i + 2], 16) ^ k) for i in range(2, len(hexs), 2))
    except Exception:
        return ''


def host_summary(h, maxlines=int(os.environ.get('MAXL', '14'))):
    d = os.path.join(ROOT, h)
    emails, roles, sizes, secs, pages = {}, [], [], [], []
    done = open(os.path.join(d, '_done')).read() if os.path.exists(os.path.join(d, '_done')) else ''
    for f in sorted(glob.glob(os.path.join(d, '*.html'))):
        html = open(f, errors='replace').read()
        txtf = f[:-5] + '.txt'
        txt = open(txtf, errors='replace').read() if os.path.exists(txtf) else ''
        url = txt.split('\n', 1)[0].replace('URL: ', '')
        pages.append(url)
        for m in re.findall(r'mailto:([^"\'?>\s]+)', html):
            e = unquote(m).strip()
            if EM.fullmatch(e) and not BADEM.search(e):
                emails.setdefault(e.lower(), url)
        for m in re.findall(r'(?:data-cfemail="|email-protection#)([0-9a-f]{10,})', html):
            e = cf_decode(m)
            if EM.fullmatch(e) and not BADEM.search(e):
                emails.setdefault(e.lower(), url)
        for e in EM.findall(txt):
            if not BADEM.search(e):
                emails.setdefault(e.lower(), url)
        lines = [l.strip() for l in txt.split('\n') if l.strip()]
        for i, l in enumerate(lines):
            if len(l) > 220:
                ls = l[:220]
            else:
                ls = l
            if ROLE.search(l) and len(l) < 160:
                ctx = ' / '.join(x[:80] for x in lines[max(0, i - 1):i + 2])
                roles.append((ctx, url))
            if SIZE.search(l):
                sizes.append((ls, url))
            if SEC.search(l) and len(l) < 400:
                secs.append((ls, url))
    print('=' * 100)
    print('HOST', h, '| pages:', len(pages), '|', done.split('\n')[0][:150])
    for p in pages:
        print('  page', p)
    print('  EMAILS:', '; '.join(f'{e} <{u}>' for e, u in emails.items()))
    seen = set()
    n = 0
    for c, u in roles:
        if c in seen:
            continue
        seen.add(c); n += 1
        if n > maxlines:
            break
        print('  ROLE:', c, '<', u, '>')
    seen = set()
    for c, u in sizes[:int(os.environ.get('MAXS', '12'))]:
        if c in seen:
            continue
        seen.add(c)
        print('  SIZE:', c, '<', u, '>')
    seen = set()
    for c, u in secs[:int(os.environ.get('MAXS', '12'))]:
        if c in seen:
            continue
        seen.add(c)
        print('  SEC:', c[:250], '<', u, '>')


if __name__ == '__main__':
    hosts = sys.argv[1:] or sorted(os.listdir(ROOT))
    for h in hosts:
        if os.path.isdir(os.path.join(ROOT, h)):
            host_summary(h)
