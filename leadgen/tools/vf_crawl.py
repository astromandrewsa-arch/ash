"""Crawl each verify target's OWN website: homepage + About/Team/Contact/Locations/Services pages.
Saves phone-stripped visible text per page to raw/verify/<slug>.json. Obeys robots.txt, >=2.5 s between
requests to the same site. No forms, no logins."""
import json, re, sys, time, urllib.parse, urllib.robotparser, concurrent.futures as cf
import requests
from bs4 import BeautifulSoup
sys.path.insert(0, '/home/user/ash/leadgen/tools')
from mfr_common import UA, strip_phones

OUT = '/home/user/ash/leadgen/raw/verify'
DELAY = 2.6
KW = [('about', 10), ('team', 10), ('leadership', 10), ('management', 9), ('who-we-are', 10), ('our-company', 9),
      ('company', 6), ('staff', 9), ('meet', 8), ('history', 7), ('founder', 9), ('owner', 9), ('people', 8),
      ('contact', 9), ('location', 8), ('office', 6), ('services', 7), ('service', 5), ('solutions', 6),
      ('commercial', 7), ('business', 5), ('video', 6), ('surveillance', 7), ('cctv', 7), ('camera', 7),
      ('security', 3), ('industr', 5), ('market', 5), ('vertical', 6), ('partner', 5), ('brand', 5),
      ('product', 3), ('access-control', 4), ('quienes', 8), ('nosotros', 8), ('contacto', 7)]
SKIP = re.compile(r'(\.(pdf|jpg|jpeg|png|gif|zip|docx?|xlsx?|mp4|svg|webp)$)|(/(wp-admin|wp-login|cart|checkout|login|signin|account|feed|tag|category|author|page/\d)/?)|mailto:|tel:|javascript:|#', re.I)
EMAIL_RE = re.compile(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}')
BAD_EMAIL = re.compile(r'(sentry|wixpress|example\.|domain\.com|email\.com|yourdomain|@2x|\.png|\.jpg|\.webp|godaddy|squarespace|cloudflare|wordpress|schema\.org|u003e)', re.I)


def slugify(name):
    return re.sub(r'[^a-z0-9]+', '_', name.lower()).strip('_')[:60]


def cfdecode(enc):
    try:
        r = int(enc[:2], 16)
        return ''.join(chr(int(enc[i:i + 2], 16) ^ r) for i in range(2, len(enc), 2))
    except Exception:
        return ''


def reg_dom(host):
    host = (host or '').lower().split(':')[0]
    if host.startswith('www.'):
        host = host[4:]
    return host


def page_info(resp):
    html = resp.text
    s = BeautifulSoup(html, 'lxml')
    emails = set()
    for a in s.select('a[href^="mailto:"], a[href^="MAILTO:"]'):
        e = urllib.parse.unquote(a['href'][7:].split('?')[0]).strip()
        if EMAIL_RE.fullmatch(e):
            emails.add(e)
    for el in s.select('[data-cfemail]'):
        e = cfdecode(el['data-cfemail'])
        if EMAIL_RE.fullmatch(e or ''):
            emails.add(e)
    for a in s.select('a[href*="/cdn-cgi/l/email-protection#"]'):
        e = cfdecode(a['href'].split('#')[-1])
        if EMAIL_RE.fullmatch(e or ''):
            emails.add(e)
    jsonld = []
    for sc in s.select('script[type="application/ld+json"]'):
        t = sc.get_text()
        for m in re.finditer(r'"(streetAddress|addressLocality|postalCode|addressRegion|founder|name|email)"\s*:\s*"([^"]{1,120})"', t):
            jsonld.append(f'{m.group(1)}={strip_phones(m.group(2))}')
    links = []
    for a in s.select('a[href]'):
        links.append((a['href'], a.get_text(' ', strip=True)[:80]))
    meta = ''
    md = s.find('meta', attrs={'name': 'description'})
    if md and md.get('content'):
        meta = md['content']
    for t in s(['script', 'style', 'noscript', 'svg']):
        t.decompose()
    title = s.title.get_text(strip=True) if s.title else ''
    txt = s.get_text('\n', strip=True)
    for e in EMAIL_RE.findall(txt):
        emails.add(e)
    emails = sorted(e for e in emails if not BAD_EMAIL.search(e))
    return title, strip_phones(meta), strip_phones(txt), emails, links, jsonld


def crawl(rec):
    name = rec['name']
    url = rec['website'].split(' ')[0].strip()
    if not url.startswith('http'):
        url = 'http://' + url
    p = urllib.parse.urlparse(url)
    url = f'{p.scheme}://{p.netloc.lower()}{p.path or "/"}'
    sess = requests.Session()
    sess.headers.update({'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9'})
    res = {'name': name, 'start_url': url, 'pages': [], 'robots': '', 'errors': []}
    last = [0.0]

    def get(u):
        w = DELAY - (time.time() - last[0])
        if w > 0:
            time.sleep(w)
        try:
            r = sess.get(u, timeout=30, allow_redirects=True)
        except Exception as e:
            last[0] = time.time()
            return None, str(e)[:200]
        last[0] = time.time()
        return r, ''

    # robots
    rp = urllib.robotparser.RobotFileParser()
    root = f'{p.scheme}://{p.netloc}'
    r, err = get(root + '/robots.txt')
    if r is not None and r.status_code == 200 and 'html' not in r.headers.get('content-type', ''):
        rp.parse(r.text.splitlines()); res['robots'] = 'parsed'
    else:
        rp.parse([]); res['robots'] = f'none ({r.status_code if r is not None else err})'

    def allowed(u):
        try:
            return rp.can_fetch(UA, u) and rp.can_fetch('*', u)
        except Exception:
            return True

    if not allowed(url):
        res['errors'].append('robots disallows homepage'); return res
    r, err = get(url)
    if r is None and url.startswith('https://'):
        url2 = 'http://' + url[8:]
        r, err = get(url2)
    if r is None:
        res['errors'].append('home: ' + err); return res
    res['final_home'] = r.url
    try:
        title, meta, txt, emails, links, jl = page_info(r)
    except Exception as e:
        res['errors'].append('parse: ' + str(e)[:100]); return res
    res['pages'].append({'url': r.url, 'status': r.status_code, 'title': title, 'meta': meta, 'text': txt[:60000],
                         'emails': emails, 'jsonld': jl})
    home_dom = reg_dom(urllib.parse.urlparse(r.url).netloc)
    cands = {}
    for href, text in links:
        if SKIP.search(href.split('?')[0]) and not href.startswith('#'):
            if 'mailto' in href or 'tel:' in href:
                continue
        if href.startswith(('mailto:', 'tel:', 'javascript:')) or href.startswith('#'):
            continue
        u = urllib.parse.urljoin(r.url, href).split('#')[0]
        pu = urllib.parse.urlparse(u)
        if pu.scheme not in ('http', 'https') or reg_dom(pu.netloc) != home_dom:
            continue
        if re.search(r'\.(pdf|jpe?g|png|gif|zip|docx?|xlsx?|mp4|svg|webp)$', pu.path, re.I):
            continue
        if re.search(r'/(wp-admin|wp-login|cart|checkout|login|account|feed|tag|author)/', pu.path, re.I):
            continue
        key = (pu.path.rstrip('/') or '/') + (('?' + pu.query) if pu.query else '')
        if key in ('/', '') or u.rstrip('/') == r.url.rstrip('/'):
            continue
        hay = (pu.path + ' ' + text).lower()
        sc = sum(w for k, w in KW if k in hay)
        if sc <= 0:
            continue
        if re.search(r'blog|news|post|privacy|terms|career|job|faq|sitemap|login|pay', hay):
            sc -= 6
        if sc > cands.get(key, (0, ''))[0]:
            cands[key] = (sc, u)
    picked = sorted(cands.values(), key=lambda x: -x[0])[:11]
    for sc, u in picked:
        if not allowed(u):
            res['errors'].append('robots disallows ' + u); continue
        rr, err = get(u)
        if rr is None:
            res['errors'].append(u + ': ' + err); continue
        try:
            title, meta, txt, emails, _, jl = page_info(rr)
        except Exception as e:
            res['errors'].append('parse ' + u); continue
        res['pages'].append({'url': rr.url, 'status': rr.status_code, 'title': title, 'meta': meta,
                             'text': txt[:40000], 'emails': emails, 'jsonld': jl})
    return res


def main():
    targets = json.load(open('/home/user/ash/leadgen/data/verify_targets.json'))
    only = set(sys.argv[1:])
    if only:
        targets = [t for t in targets if t['name'] in only or slugify(t['name']) in only]

    def job(t):
        try:
            res = crawl(t)
        except Exception as e:
            res = {'name': t['name'], 'pages': [], 'errors': ['crash ' + str(e)[:200]]}
        json.dump(res, open(f"{OUT}/{slugify(t['name'])}.json", 'w'), indent=1, ensure_ascii=False)
        tot = sum(len(pg['text']) for pg in res['pages'])
        print(f"{t['name'][:45]:45} pages={len(res['pages'])} chars={tot} err={res['errors'][:2]}", flush=True)
    with cf.ThreadPoolExecutor(10) as ex:
        list(ex.map(job, targets))


if __name__ == '__main__':
    main()
