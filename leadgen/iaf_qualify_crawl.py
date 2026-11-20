"""Crawl each IAF member's own website (home + contact/locations/about/service-area pages, robots.txt respected)
and extract: what they sell, addresses printed on the site, and Miami-Dade place mentions. Phones are never stored."""
import json, os, re, sys, time
from urllib.parse import urljoin
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from enrich import fetch, page_text, norm_url, _domain, SERVICES, BRANDS, EMAIL_RE, BAD_EMAIL
from geo import MD_ZIPS, MD_CITY_NAMES, municipality, region

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "cache_loc")
PAGES = re.compile(r"contact|location|office|about|service-?area|areas-?(we-)?serve|coverage|branch|find-us|where|team|services|commercial|security", re.I)
ADDR = re.compile(r"(\d{2,6}\s+[A-Za-z0-9 .#'\-]{2,50}?)\W{0,4}(?:(?:Suite|Ste|Unit|Bay|#)\.?\s*[\w\-]+\W{0,3})?\b([A-Z][A-Za-z .'\-]{2,30}?),?\s+(?:FL|Florida|[A-Z]{2})\.?,?\s+(\d{5})\b")
DADE_PLACES = ["Miami-Dade", "Dade County", "Miami Beach", "North Miami Beach", "North Miami", "South Miami", "Miami Gardens",
               "Miami Lakes", "Miami Shores", "Miami Springs", "Coral Gables", "Homestead", "Florida City", "Doral", "Hialeah",
               "Kendall", "Aventura", "Cutler Bay", "Pinecrest", "Palmetto Bay", "Key Biscayne", "Medley", "Sweetwater",
               "Opa-locka", "Sunny Isles", "Surfside", "Bal Harbour", "Brickell", "Coconut Grove", "Little Havana", "Westchester",
               "Miami"]
SOFLA = ["South Florida", "Southeast Florida", "Tri-County", "tri-county"]


def crawl(url, max_pages=6):
    url = norm_url(url)
    dom = _domain(url)
    cf = os.path.join(OUT, re.sub(r"[^a-z0-9.\-]", "_", dom) + ".json")
    if os.path.exists(cf):
        return json.load(open(cf))
    res = {"website": url, "ok": False}
    r, err = fetch(url)
    if r is None and url.startswith("http://"):
        r, err = fetch("https://" + url[7:])
    if r is None:
        r, err = fetch(url, browser_fallback=True)
    if r is None:
        res["error"] = err
        json.dump(res, open(cf, "w"))
        return res
    final = r.url
    txt, mails, links, _ = page_text(r.text)
    texts = {final: txt}
    cand = []
    for href, label in links:
        if not href or href.startswith(("mailto:", "tel:", "#", "javascript")):
            continue
        u = urljoin(final, href).split("#")[0]
        if _domain(u) == _domain(final) and (PAGES.search(u) or PAGES.search(label or "")) and u not in cand and u.rstrip("/") != final.rstrip("/"):
            cand.append(u)
    cand.sort(key=lambda u: 0 if re.search(r"contact|location|office|area|branch", u, re.I) else 1 if re.search(r"about", u, re.I) else 2)
    for u in cand[:max_pages]:
        time.sleep(1.0)
        r2, _ = fetch(u)
        if r2 is not None:
            t2, m2, _, _ = page_text(r2.text)
            texts[r2.url] = t2
            mails |= m2
    allt = "\n".join(texts.values())
    flat = re.sub(r"\s*\n\s*", ", ", allt)
    addrs = {}
    for m in ADDR.finditer(flat):
        street, city, z = m.group(1).strip(" ,"), m.group(2).strip(" ,"), m.group(3)
        city = re.sub(r"^(?:.*,\s*)", "", city)
        addrs.setdefault(z + "|" + street[:20].lower(), (street, city, z))
    for e in EMAIL_RE.findall(allt):
        mails.add(e.lower())
    emails = sorted(e for e in mails if not BAD_EMAIL.search(e))
    same = [e for e in emails if _domain(final).split(".")[0] in e.split("@")[-1]]
    dade = []
    for p in DADE_PLACES:
        if re.search(r"(?<![A-Za-z])" + re.escape(p) + r"(?![A-Za-z])", allt, re.I):
            if p == "Miami" and not re.search(r"(?<![A-Za-z-])Miami(?![- ](?:Dade|Beach|Gardens|Lakes|Shores|Springs))", allt):
                continue
            dade.append(p)
    res.update({
        "ok": True, "final_url": final, "pages": list(texts),
        "services": [n for n, p in SERVICES if re.search(p, allt, re.I)],
        "brands": sorted({b for b in BRANDS if re.search(r"(?<![A-Za-z])" + re.escape(b) + r"(?![A-Za-z])", allt)}),
        "addresses": [list(v) for v in addrs.values()][:12],
        "dade_mentions": dade,
        "sofla_mentions": [p for p in SOFLA if p.lower() in allt.lower()],
        "emails": (same or emails)[:3],
        "title": re.sub(r"\s+", " ", txt[:160]),
        "fire_words": len(re.findall(r"fire alarm|fire sprinkler|fire protection|fire suppression|extinguisher|fire safety|backflow|kitchen hood", allt, re.I)),
        "camera_words": len(re.findall(r"cctv|security cameras?|surveillance|video monitoring|video management|ip cameras?|camera systems?|video security|\bnvr\b|\bdvr\b", allt, re.I)),
        "access_words": len(re.findall(r"access control|card access|keyless entry|door access|key ?fobs?|credential", allt, re.I)),
        "burglar_words": len(re.findall(r"burglar|intrusion|security alarms?|home security|business security|security monitoring|alarm monitoring for (?:homes|businesses)|(?<!fire )(?<!fire-)alarm systems? for (?:homes|businesses)|security systems?", allt, re.I)),
        "security_words": len(re.findall(r"burglar|intrusion|security system|security alarm|alarm system|cctv|camera|surveillance|access control|alarm monitoring|video", allt, re.I)),
        "sells_products": bool(re.search(r"\bshop\b|add to cart|buy now|products|store", allt, re.I)),
        "text_len": len(allt),
    })
    json.dump(res, open(cf, "w"), indent=1)
    return res


def _main():
    urls = json.load(open(sys.argv[1]))
    with ThreadPoolExecutor(12) as ex:
        res = list(ex.map(lambda u: (u, _safe(u)), urls))
    print("done", len(res), sum(1 for _, r in res if r.get("ok")))


def _safe(u):
    try:
        return crawl(u)
    except Exception as e:
        return {"ok": False, "error": repr(e)}


if __name__ == "__main__":
    _main()
