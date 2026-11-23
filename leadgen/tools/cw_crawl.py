"""Company-contact crawl: for each target with a website, fetch the homepage plus a few contact/location/about
pages from the company's own site (robots.txt respected, ~1.5 s between requests to one site), and extract
published phone numbers (tel: links and printed numbers, with the label text around them) and email
addresses. Raw HTML goes to raw/cw/html/, per-company extracts to raw/cw/extract/<sheet_row>.json.

usage: python3 tools/cw_crawl.py [sheet_row ...]   (no args = all targets with a domain)
       python3 tools/cw_crawl.py --url ROW URL        (crawl one explicit site for a row)
"""
import json, os, re, sys, time, hashlib, subprocess
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urlparse, urljoin
from urllib import robotparser
import requests
from bs4 import BeautifulSoup

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(HERE, "raw", "cw")
HTML_DIR = os.path.join(RAW, "html")
EXT_DIR = os.path.join(RAW, "extract")
os.makedirs(HTML_DIR, exist_ok=True)
os.makedirs(EXT_DIR, exist_ok=True)
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"

PHONE_RE = re.compile(r"(?<![\d\-])(?:\+?1[\s.\-]?)?\(?([2-9]\d{2})\)?[\s.\-‐-–]{0,3}([2-9]\d{2})[\s.\-‐-–]{1,3}(\d{4})(?!\d)")
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9\-]+(?:\.[A-Za-z0-9\-]+)*\.[A-Za-z]{2,}")
BAD_EMAIL = re.compile(r"\.(png|jpe?g|gif|webp|svg|css|js)$|sentry|wixpress|example\.com|domain\.com|yourdomain|"
                       r"@2x|godaddy|schema\.org|u003e|placeholder|youremail|name@|email@email", re.I)
KEY = re.compile(r"contact|location|office|about|support|service-request|reach|get-in-touch|find-us|visit", re.I)

_robots = {}


def allowed(url):
    p = urlparse(url)
    base = f"{p.scheme}://{p.netloc}"
    if base not in _robots:
        rp = robotparser.RobotFileParser()
        try:
            r = requests.get(base + "/robots.txt", headers={"User-Agent": UA}, timeout=12)
            if r.status_code == 200 and "html" not in r.headers.get("content-type", ""):
                rp.parse(r.text.splitlines())
            else:
                rp.parse([])
        except Exception:
            rp.parse([])
        _robots[base] = rp
    try:
        return _robots[base].can_fetch(UA, url) and _robots[base].can_fetch("*", url)
    except Exception:
        return True


def render(url):
    try:
        o = subprocess.run(["node", os.path.join(HERE, "tools", "cw_render.cjs"), url], capture_output=True,
                           text=True, timeout=100, cwd=os.path.join(HERE, "tools"))
        d = json.loads(o.stdout or "{}")
        if d.get("html") and d.get("status") in (200, None) and "Just a moment" not in d["html"][:3000]:
            return d["url"], d["html"], "rendered"
        return None, None, f"render {d.get('status')} {d.get('error', '')}"
    except Exception as e:
        return None, None, "render " + type(e).__name__


def fetch(url):
    if not allowed(url):
        return None, None, "robots"
    err = None
    for attempt in range(2):
        try:
            r = requests.get(url, headers={"User-Agent": UA, "Accept-Language": "en-US"}, timeout=20, allow_redirects=True)
            if r.status_code == 200 and "html" in r.headers.get("content-type", "html"):
                return r.url, r.text, "requests"
            err = f"http {r.status_code}"
            if r.status_code in (404, 410):
                break
        except requests.exceptions.SSLError:
            err = "SSLError"
            if url.startswith("https://"):
                url = "http://" + url[8:]
                continue
        except Exception as e:
            err = type(e).__name__
        time.sleep(2)
    return None, None, err


def cf_decode(hexstr):
    try:
        k = int(hexstr[:2], 16)
        return "".join(chr(int(hexstr[i:i + 2], 16) ^ k) for i in range(2, len(hexstr), 2))
    except Exception:
        return ""


def norm_phone(a, b, c):
    return f"{a}-{b}-{c}"


def extract(html, url):
    s = BeautifulSoup(html, "lxml")
    phones, emails = [], set()
    for a in s.select('a[href^="tel:"], a[href^="TEL:"], a[href^="callto:"]'):
        raw = a.get("href", "").split(":", 1)[1]
        m = PHONE_RE.search(re.sub(r"%20|%2D", " ", raw))
        if m:
            par = a.find_parent(["p", "li", "div", "span", "td"])
            ctx = (par.get_text(" ", strip=True) if par else a.get_text(" ", strip=True))[:160]
            phones.append({"phone": norm_phone(*m.groups()), "how": "tel", "text": a.get_text(" ", strip=True)[:60], "ctx": ctx, "url": url})
    for a in s.select('a[href^="mailto:"], a[href^="MAILTO:"]'):
        m = a.get("href", "")[7:].split("?")[0].strip()
        if EMAIL_RE.fullmatch(m):
            emails.add(m.lower())
    for el in s.select("[data-cfemail]"):
        d = cf_decode(el.get("data-cfemail", ""))
        if EMAIL_RE.fullmatch(d):
            emails.add(d.lower())
    for a in s.select('a[href*="/cdn-cgi/l/email-protection#"]'):
        d = cf_decode(a.get("href", "").split("#", 1)[1])
        if EMAIL_RE.fullmatch(d):
            emails.add(d.lower())
    raw_html = html
    for t in s(["script", "style", "noscript", "svg"]):
        t.decompose()
    txt = s.get_text("\n", strip=True)
    for m in PHONE_RE.finditer(txt):
        st = max(0, m.start() - 70)
        ctx = txt[st:m.end() + 30].replace("\n", " | ")
        phones.append({"phone": norm_phone(*m.groups()), "how": "text", "ctx": ctx, "url": url})
    for m in EMAIL_RE.finditer(txt):
        e = m.group(0).lower().rstrip(".")
        emails.add(e)
    # emails sitting in scripts / JSON-LD / attributes
    for m in EMAIL_RE.finditer(raw_html):
        e = m.group(0).lower().rstrip(".")
        if not BAD_EMAIL.search(e):
            emails.add(e)
    emails = {e for e in emails if not BAD_EMAIL.search(e)}
    links = []
    for a in s.find_all("a", href=True):
        links.append((urljoin(url, a["href"]), a.get_text(" ", strip=True)[:60]))
    # JSON-LD telephone fields
    for m in re.finditer(r'"telephone"\s*:\s*"([^"]+)"', raw_html):
        mm = PHONE_RE.search(m.group(1))
        if mm:
            phones.append({"phone": norm_phone(*mm.groups()), "how": "jsonld", "ctx": m.group(0)[:80], "url": url})
    title = (s.title.get_text(strip=True) if s.title else "")[:150]
    return phones, sorted(emails), links, txt, title


def site_host(u):
    h = urlparse(u).netloc.lower()
    return h[4:] if h.startswith("www.") else h


def crawl(row, start_urls, max_pages=6):
    log = []
    pages = []
    home_url = home_html = None
    for u in start_urls:
        fu, html, how = fetch(u)
        log.append([u, how if html else how])
        if html and len(BeautifulSoup(html, "lxml").get_text(" ", strip=True)) < 400:
            ru, rh, rhow = render(fu or u)
            if rh:
                fu, html, how = ru, rh, rhow
        if not html:
            ru, rh, rhow = render(u)
            log.append([u, rhow])
            if rh:
                fu, html, how = ru, rh, rhow
        if html:
            home_url, home_html = fu, html
            break
        time.sleep(1.5)
    if not home_html:
        return {"sheet_row": row, "ok": False, "log": log}
    host = site_host(home_url)
    seen = {home_url.rstrip("/")}
    queue = [(home_url, home_html, how)]
    ph, em, title = [], set(), ""
    txts = {}
    i = 0
    while queue and i < max_pages:
        u, html, how = queue.pop(0)
        i += 1
        fn = hashlib.md5(u.encode()).hexdigest()[:10]
        with open(os.path.join(HTML_DIR, f"{row}_{fn}.html"), "w") as f:
            f.write(html)
        p, e, links, txt, t = extract(html, u)
        if i == 1:
            title = t
            # if too few numbers on a JS page fetched by requests, try rendering it
            if not p and how == "requests":
                ru, rh, rhow = render(u)
                if rh:
                    p2, e2, l2, txt2, _ = extract(rh, u)
                    p += p2; e += e2; links += l2; txt += "\n" + txt2
        ph += p
        em |= set(e)
        txts[u] = txt[:6000]
        if i == 1:
            cands = []
            for lu, lt in links:
                lu = lu.split("#")[0]
                if site_host(lu) != host or lu.rstrip("/") in seen:
                    continue
                if re.search(r"\.(pdf|jpe?g|png|gif|zip|docx?)$", lu, re.I):
                    continue
                if KEY.search(urlparse(lu).path) or KEY.search(lt or ""):
                    seen.add(lu.rstrip("/"))
                    pri = 0 if re.search(r"contact", lu + " " + (lt or ""), re.I) else (1 if re.search(r"location|office", lu, re.I) else 2)
                    cands.append((pri, lu))
            cands.sort()
            for _, lu in cands[: max_pages - 1]:
                time.sleep(1.5)
                fu, h2, how2 = fetch(lu)
                log.append([lu, how2])
                if h2 and how2 == "requests":
                    p2, *_ = extract(h2, fu)
                    if not p2:
                        ru, rh, rhow = render(fu)
                        if rh:
                            h2, how2 = rh, rhow
                if h2:
                    queue.append((fu, h2, how2))
    # dedupe phones
    agg = {}
    for x in ph:
        k = x["phone"]
        a = agg.setdefault(k, {"phone": k, "n": 0, "tel": 0, "ctx": [], "urls": []})
        a["n"] += 1
        if x["how"] in ("tel", "jsonld"):
            a["tel"] += 1
        c = x.get("ctx", "")
        if c and c not in a["ctx"] and len(a["ctx"]) < 4:
            a["ctx"].append(c)
        if x["url"] not in a["urls"]:
            a["urls"].append(x["url"])
    out = {"sheet_row": row, "ok": True, "home": home_url, "host": host, "title": title,
           "phones": sorted(agg.values(), key=lambda a: (-a["tel"], -a["n"])), "emails": sorted(em), "log": log,
           "pages": list(txts.keys())}
    with open(os.path.join(EXT_DIR, f"{row}.json"), "w") as f:
        json.dump(out, f, indent=1)
    with open(os.path.join(EXT_DIR, f"{row}_text.json"), "w") as f:
        json.dump(txts, f, indent=1)
    return out


def starts(domain):
    d = domain.strip().lower()
    d = re.sub(r"^https?://", "", d).strip("/")
    if d.startswith("www."):
        d = d[4:]
    if "/" in d:
        return ["https://" + d, "http://" + d]
    return ["https://www." + d, "https://" + d, "http://www." + d]


def main():
    tg = json.load(open(os.path.join(HERE, "data", "rr_targets.json")))
    args = sys.argv[1:]
    if args and args[0] == "--url":
        r = crawl(int(args[1]), [args[2]])
        print(json.dumps({k: r.get(k) for k in ("sheet_row", "ok", "home", "title")}), len(r.get("phones", [])), r.get("emails"))
        return
    rows = {int(a) for a in args}
    jobs = [t for t in tg if t["website_domain"] and (not rows or t["sheet_row"] in rows)]

    def one(t):
        try:
            r = crawl(t["sheet_row"], starts(t["website_domain"]))
        except Exception as e:
            r = {"sheet_row": t["sheet_row"], "ok": False, "log": [repr(e)[:200]]}
            with open(os.path.join(EXT_DIR, f"{t['sheet_row']}.json"), "w") as f:
                json.dump(r, f)
        print(t["sheet_row"], t["company"][:40], r.get("ok"), r.get("home"), len(r.get("phones", [])), "phones", r.get("emails", [])[:4], flush=True)

    with ThreadPoolExecutor(6) as ex:
        list(ex.map(one, jobs))


if __name__ == "__main__":
    main()
