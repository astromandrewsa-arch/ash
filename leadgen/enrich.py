"""Website enrichment: fetch a dealer's own public site (homepage + about/team/contact/services pages),
respecting robots.txt, and extract services, brands, published emails, named contacts with roles,
location count and service-area mentions. Phone numbers are stripped before anything is cached."""
import json, os, re, sys, time, hashlib, threading
from urllib.parse import urlparse, urljoin
from urllib import robotparser
import requests
from bs4 import BeautifulSoup

UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"
HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, "cache")
os.makedirs(CACHE, exist_ok=True)

PHONE_RE = re.compile(r"(?:\+?1[\s.\-]?)?\(?\b\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4}\b")
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}")
BAD_EMAIL = re.compile(r"\.(png|jpe?g|gif|webp|svg|css|js)$|sentry|wixpress|example\.com|domain\.com|yourdomain|"
                       r"email\.com$|@2x|godaddy|squarespace|schema\.org|u003e|placeholder", re.I)

SERVICES = [
    ("commercial", r"\bcommercial\b|\bbusinesses\b|\benterprise\b|office buildings?|property manage"),
    ("residential", r"\bresidential\b|\bhomeowners?\b|\byour home\b"),
    ("CCTV/video surveillance", r"\bcctv\b|video surveillance|security cameras?|surveillance cameras?|\bip cameras?\b|camera systems?|video management"),
    ("access control", r"access control|card access|keyless entry|door access"),
    ("intrusion alarms", r"burglar alarm|intrusion|alarm systems?|security alarms?"),
    ("alarm monitoring", r"24/7 monitoring|central station|alarm monitoring|monitoring services|monitored"),
    ("fire alarm", r"fire alarm|fire detection|fire safety|fire protection"),
    ("intercom", r"intercom|entry phone|door entry|telephone entry"),
    ("structured cabling", r"structured cabling|low[- ]voltage|network cabling|data cabling|fiber optic"),
    ("gates/barriers", r"\bgates?\b|gate operators?|barrier arms?|bollards?"),
    ("audio/video", r"audio[/ -]video|home theater|\ba/v\b|audio visual"),
    ("smart home/automation", r"smart home|home automation|automation"),
    ("networking/IT", r"\bnetworking\b|\bwi-?fi\b|managed it|it services"),
    ("remote video monitoring", r"remote video monitoring|virtual guard|video monitoring|remote guarding|live video monitoring"),
    ("license plate recognition", r"license plate|\blpr\b|\balpr\b"),
    ("guard services", r"security guards?|guard services|security officers?|armed guards?|unarmed guards?"),
    ("mass notification/ERRCS", r"mass notification|\berrcs\b|\bbda\b|emergency responder radio|two-way radio"),
    ("nurse call", r"nurse call"),
]
VERTICALS = [
    ("schools", r"\bschools?\b|education|campus"), ("hospitals/healthcare", r"hospital|healthcare|medical"),
    ("hotels", r"\bhotels?\b|hospitality"), ("condos/HOA", r"condo|condominium|\bhoa\b|multi-?family|apartment"),
    ("offices", r"\boffices?\b|office buildings?"), ("houses of worship", r"church|synagogue|houses? of worship|temple|mosque"),
    ("government", r"government|municipal"), ("retail", r"\bretail\b"), ("warehouses/industrial", r"warehouse|industrial|logistics"),
]
BRANDS = ["Alarm.com", "Honeywell", "Resideo", "DMP", "Bosch", "Napco", "Qolsys", "Hanwha", "Axis", "Avigilon",
          "Verkada", "Genetec", "Milestone", "Brivo", "Openpath", "Avigilon Alta", "Eagle Eye", "Rhombus",
          "Hikvision", "Dahua", "Lenel", "LenelS2", "Software House", "Kantech", "DSC", "2GIG", "Vivint", "ADT",
          "Brinks", "Interlogix", "Paxton", "ButterflyMX", "Salto", "HID", "Gallagher", "Exacqvision", "Uniview",
          "Luma", "Control4", "Speco", "Digital Watchdog", "OpenEye", "Arcules", "Meraki", "Ubiquiti", "Vicon",
          "Pelco", "Hanwha Vision", "Samsung Wisenet", "Wisenet", "Geovision", "Provision", "Lorex", "ICT",
          "Keyscan", "Feenics", "Identiv", "Comelit", "Aiphone", "2N", "Doorking", "Liftmaster", "Elk",
          "Notifier", "Fire-Lite", "Silent Knight", "Potter", "Edwards", "Simplex", "Affiliated Monitoring",
          "Rapid Response", "Becklar", "COPS Monitoring", "Avantguard", "Immix", "Vivotek", "Cisco", "Ring",
          "Resolute", "Telguard", "Vector", "IDIS", "Illustra", "American Dynamics", "Victor", "Spectrum", "Openeye"]

ROLE = (r"(?:Chief [A-Z][a-z]+ Officer|Co-?Owner|Owner/Operator|Owner|Co-?Founder|Founder|President\s*(?:&|and)\s*CEO|President|"
        r"Vice President(?: of [A-Z][a-z]+)?|CEO|Chief Executive Officer|COO|Chief Operating Officer|Principal|"
        r"Managing Partner|Managing Member|Managing Director|General Manager|Sales Manager|Operations Manager|"
        r"Director of Sales|Director of Operations|Account Manager|Account Executive|Sales Director|"
        r"Business Development Manager|Project Manager|Service Manager|Office Manager|Partner|Proprietor)")
NAME = r"([A-Z][a-z]{1,15}(?:\s[A-Z]\.)?(?:\s(?:Mc|Mac|O')?[A-Z][a-zA-Z'\-]{1,20}){1,2})"
NAME_STOP = set("""Security Systems System Alarm Alarms Inc Llc Services Service Contact Home About Our The Miami Florida Fire
Company Team Group Technologies Technology Solutions Call Free Request Quote Video Access Control Monitoring Smart
Commercial Residential Integrated Integration Protection Safety Low Voltage Electric Electrical Network Networks
Cameras Camera Business Read More Learn View Meet Message From Customer Office Sales Support South North West East
Coral Gables Beach Doral Hialeah Homestead Kendall Broward Palm County Dade United States America Our Founder
President Owner Partner Manager Director Vice Chief Executive Officer Operations General Account Project Leadership
Management Staff Board Of And With For Your Click Here Welcome Privacy Policy Terms Copyright Rights Reserved Blog News
Careers Jobs Gallery Portfolio Projects Clients Testimonials Reviews Locations Areas Served Service Center Central Station
Associates Corp Corporation Llp Pa Enterprises Systems Holdings International National Global Pro Professional Professionals
Certified Licensed Insured Experts Expert Industry Years Experience Since Established Family Owned Operated Locally""".split())

LOCKOUT = threading.Lock()


def _domain(url):
    try:
        d = urlparse(url if "//" in url else "http://" + url).netloc.lower()
        return d[4:] if d.startswith("www.") else d
    except Exception:
        return ""


def norm_url(url):
    url = (url or "").strip()
    if not url or url == "?":
        return ""
    if not url.startswith("http"):
        url = "http://" + url
    return url


_robots = {}


def allowed(url):
    p = urlparse(url)
    base = f"{p.scheme}://{p.netloc}"
    if base not in _robots:
        rp = robotparser.RobotFileParser()
        try:
            r = requests.get(base + "/robots.txt", headers={"User-Agent": UA}, timeout=10)
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


class _Resp:
    def __init__(self, url, text):
        self.url, self.text = url, text


def render(url):
    """Headless-browser fallback (no evasion; plain Chromium)."""
    import subprocess
    try:
        o = subprocess.run(["node", os.path.join(HERE, "tools", "render.cjs"), url], capture_output=True, text=True,
                           timeout=90, cwd=os.path.join(HERE, "tools"))
        d = json.loads(o.stdout or "{}")
        if d.get("html") and (d.get("status") in (200, None)) and "Just a moment" not in d["html"][:3000]:
            return _Resp(d["url"], d["html"]), None
        return None, f"render {d.get('status')} {d.get('error', '')}"
    except Exception as e:
        return None, "render " + type(e).__name__


def fetch(url, timeout=20, browser_fallback=False):
    if not allowed(url):
        return None, "robots"
    err = None
    for attempt in range(2):
        try:
            r = requests.get(url, headers={"User-Agent": UA, "Accept-Language": "en-US"}, timeout=timeout, allow_redirects=True)
            if r.status_code == 200 and "html" in r.headers.get("content-type", "html"):
                return r, None
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
        time.sleep(4)
    if browser_fallback:
        return render(url)
    return None, err


def page_text(html):
    s = BeautifulSoup(html, "lxml")
    mails = set()
    for a in s.select('a[href^="mailto:"]'):
        m = a.get("href", "")[7:].split("?")[0].strip()
        if EMAIL_RE.fullmatch(m):
            mails.add(m.lower())
    for t in s(["script", "style", "noscript", "svg"]):
        t.decompose()
    txt = s.get_text("\n", strip=True)
    txt = PHONE_RE.sub("[phone removed]", txt)
    links = [(a.get("href", ""), a.get_text(" ", strip=True)) for a in s.find_all("a")]
    return txt, mails, links, s


KEY_PAGES = re.compile(r"about|team|staff|leadership|who-we-are|our-company|contact|location|service|commercial|"
                       r"business|video|camera|surveillance|cctv|access", re.I)


ROLE_START = re.compile(r"^(?:Senior |Sr\.? |Executive |Division |Regional |National |Assistant |Interim |Acting )?" + ROLE + r"\b", re.I)
NAME_RE = re.compile(r"^" + NAME + r"(?:,?\s+(?:Jr\.?|Sr\.?|II|III|IV|CPP|PSP|CFA|PE|P\.E\.|SET|NICET))*\.?$")
EXTRA_STOP = set("As Proud Honoree Smooth Five Meet Dear Thank Thanks Hello Hi Mr Mrs Ms Dr Read Bio Email Phone Fax Get Started".split())


def _name_ok(name):
    toks = name.replace(".", "").replace(",", "").split()
    if len(toks) < 2 or len(toks) > 5:
        return False
    if any(t in NAME_STOP or t in EXTRA_STOP for t in toks):
        return False
    return True


def _role_ok(role, company_tokens):
    """Reject roles that belong to another organization (testimonials/quotes)."""
    m = re.search(r"(?:,|\bof\b|\bat\b)\s+(.+)$", role)
    if m and company_tokens:
        tail = m.group(1).lower()
        generic = re.search(r"sales|operations|marketing|business|estimating|engineering|technology|service|finance|"
                            r"healthcare|commercial|residential|information|security|fire|development|accounts|region|"
                            r"division|integration|installation|project|strategic|human|customer|capital|construction", tail)
        if not generic and not any(t in tail for t in company_tokens):
            return False
    return len(role) <= 80


def extract_contacts(text, company_tokens=()):
    segs = []
    for line in text.split("\n"):
        for part in re.split(r"\s+\|\s+", line):
            part = part.strip(" \u200b\xa0")
            if part:
                segs.append(part)
    out = []
    for i, seg in enumerate(segs):
        # Card layout: "Name" then "Role" in the next segment
        if NAME_RE.match(seg) and i + 1 < len(segs) and ROLE_START.match(segs[i + 1]) and len(segs[i + 1]) < 80:
            name, role = seg, segs[i + 1]
        else:
            m = re.match(r"^" + NAME + r"\s*(?:,|–|—|-|:)\s*(?:the\s|our\s)?(.{3,80})$", seg)
            if m and ROLE_START.match(m.group(2)):
                name, role = m.group(1), m.group(2)
            else:
                m = re.match(r"^((?:Senior |Executive |Division |National )?" + ROLE + r")\s*:\s*" + NAME + r"\b", seg)
                if m:
                    role, name = m.group(1), m.group(2)
                else:
                    m = re.search(NAME + r",?\s+(?:is|serves as)\s+(?:the\s+|our\s+)?((?:co-?)?(?:founder|owner|president|ceo|principal)[^.]{0,60})", seg, re.I)
                    if m and re.match(r"[A-Z]", m.group(1)[0:1].upper()):
                        name, role = m.group(1), m.group(2)
                    else:
                        continue
        name = re.sub(r",?\s+(?:CPP|PSP|CFA|PE|SET|NICET)\b.*$", "", name).strip(" ,.")
        role = role.strip(" ,.;")
        if not _name_ok(name) or not _role_ok(role, company_tokens):
            continue
        if role.lower().startswith(("message from", "contact")):
            continue
        ctx = " | ".join(segs[max(0, i - 1): i + 3])[:200]
        out.append({"name": name, "role": role, "context": ctx})
    seen, res = set(), []
    for c in out:
        k = c["name"].lower()
        if k not in seen:
            seen.add(k)
            res.append(c)
    return res


ADDR_RE = re.compile(r"\b(\d{2,6})\s+[A-Za-z0-9 .#'\-]{2,40}?\b(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|"
                     r"Way|Court|Ct|Lane|Ln|Parkway|Pkwy|Highway|Hwy|Terrace|Ter|Place|Pl|Circle|Trail|Trl|Plaza|Causeway)\b"
                     r"[^\n]{0,80}?\b([A-Z]{2})\.?,?\s+(\d{5})\b")


def count_locations(texts):
    seen = set()
    for t in texts:
        flat = t.replace("\n", ", ")
        for m in ADDR_RE.finditer(flat):
            seen.add((m.group(1), m.group(3)))
    return len(seen)


def enrich(website, force=False, max_pages=7):
    url = norm_url(website)
    if not url:
        return {"ok": False, "error": "no website"}
    dom = _domain(url)
    cf = os.path.join(CACHE, re.sub(r"[^a-z0-9.\-]", "_", dom) + ".json")
    if os.path.exists(cf) and not force:
        return json.load(open(cf))
    res = {"ok": False, "website": url, "domain": dom, "pages": [], "error": None}
    r, err = fetch(url)
    if r is None and url.startswith("http://"):
        r, err = fetch("https://" + url[7:])
    if r is None:
        r, err = fetch(url, browser_fallback=True)
    if r is None:
        res["error"] = err
        json.dump(res, open(cf, "w"), indent=1)
        return res
    final = r.url
    res["final_url"] = final
    txt, mails, links, soup = page_text(r.text)
    texts = {final: txt}
    allm = set(mails)
    cand = []
    for href, label in links:
        if not href or href.startswith(("mailto:", "tel:", "#", "javascript")):
            continue
        u = urljoin(final, href).split("#")[0]
        if _domain(u) != _domain(final):
            continue
        if KEY_PAGES.search(u) or KEY_PAGES.search(label or ""):
            if u not in cand and u.rstrip("/") != final.rstrip("/"):
                cand.append(u)
    # prioritize about/team/contact
    pri = lambda u: (0 if re.search(r"about|team|staff|leader|who-we", u, re.I) else
                     1 if re.search(r"contact|location", u, re.I) else 2)
    cand.sort(key=pri)
    for u in cand[:max_pages]:
        time.sleep(1.5)
        r2, e2 = fetch(u)
        if r2 is None:
            continue
        t2, m2, _, _ = page_text(r2.text)
        texts[r2.url] = t2
        allm |= m2
    alltext = "\n".join(texts.values())
    for m in EMAIL_RE.findall(alltext):
        allm.add(m.lower())
    emails = sorted(e for e in allm if not BAD_EMAIL.search(e))
    # prefer same-domain emails
    same = [e for e in emails if _domain(final).split(".")[-2] in e.split("@")[-1]]
    res["emails"] = same or emails[:3]
    low = alltext
    res["services"] = [n for n, p in SERVICES if re.search(p, low, re.I)]
    res["verticals"] = [n for n, p in VERTICALS if re.search(p, low, re.I)]
    res["brands"] = sorted({b for b in BRANDS if re.search(r"(?<![A-Za-z])" + re.escape(b) + r"(?![A-Za-z])", low)})
    contacts = []
    ctoks = [t for t in re.split(r"[^a-z]+", _domain(final).split(".")[0]) if len(t) >= 4] or [_domain(final).split(".")[0]]
    for u, t in texts.items():
        for c in extract_contacts(t, ctoks):
            c["url"] = u
            contacts.append(c)
    seen = set(); res["contacts"] = []
    for c in contacts:
        if c["name"].lower() not in seen:
            seen.add(c["name"].lower()); res["contacts"].append(c)
    res["locations"] = count_locations(texts.values())
    m = re.search(r"\b(\d{1,2})\s+(?:office\s+|branch\s+)?(?:locations|offices|branches)\b", alltext, re.I)
    res["locations_claim"] = int(m.group(1)) if m else None
    pz = re.findall(r"coral gables|miami[- ]beach|homestead|miami[- ]dade|dade county|south florida", low, re.I)
    res["pz_mentions"] = sorted({p.lower() for p in pz})
    res["miami_mentions"] = len(re.findall(r"miami", low, re.I))
    res["pages"] = list(texts.keys())
    res["snippet"] = re.sub(r"\s+", " ", txt[:600])
    res["ok"] = True
    # store a short sanitized text sample for later review (no phones)
    res["text_sample"] = re.sub(r"\s+", " ", alltext)[:4000]
    json.dump(res, open(cf, "w"), indent=1)
    return res


def enrich_many(urls, workers=6):
    from concurrent.futures import ThreadPoolExecutor
    urls = [u for u in dict.fromkeys(norm_url(u) for u in urls) if u]
    out = {}
    with ThreadPoolExecutor(workers) as ex:
        for u, r in zip(urls, ex.map(lambda x: _safe(x), urls)):
            out[u] = r
    return out


def _safe_force(u):
    try:
        return enrich(u, force=True)
    except Exception as e:
        return {"ok": False, "error": repr(e)}


def _safe(u):
    try:
        return enrich(u)
    except Exception as e:
        return {"ok": False, "error": repr(e)}


if __name__ == "__main__":
    for u in sys.argv[1:]:
        r = enrich(u, force=True)
        print(json.dumps({k: v for k, v in r.items() if k not in ("text_sample",)}, indent=1)[:3000])
