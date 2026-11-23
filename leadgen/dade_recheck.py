"""Deep re-check of each security dealer's own site for real Miami-Dade coverage.
Reads home page, sitemap URLs and pages whose address or link text names a Miami-Dade place or a service-area page
(up to 15 pages), then keeps a place only when the site says it serves / has an office / lists it as a service city."""
import json, os, re, sys, time
from urllib.parse import urljoin
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from enrich import fetch, page_text, norm_url, _domain
from geo import MD_ZIPS, municipality
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cache_dade")
PLACES = ["Miami-Dade", "Dade County", "Miami Beach", "North Miami Beach", "North Miami", "South Miami", "Miami Gardens", "Miami Lakes",
          "Miami Shores", "Miami Springs", "Coral Gables", "Homestead", "Florida City", "Doral", "Hialeah", "Kendall", "Aventura",
          "Cutler Bay", "Pinecrest", "Palmetto Bay", "Key Biscayne", "Medley", "Sweetwater", "Opa-locka", "Sunny Isles", "Surfside",
          "Bal Harbour", "Brickell", "Coconut Grove", "Miami"]
SLUG = re.compile(r"miami|dade|doral|hialeah|homestead|kendall|coral-?gables|aventura|cutler|pinecrest|palmetto-?bay|key-?biscayne|"
                  r"medley|sweetwater|brickell|south-?florida|service-?area|areas-?(we-)?serv|locations?|cities|counties|coverage|where-we", re.I)
SERVE = re.compile(r"serv|area|cover|throughout|location|cities|count(y|ies)|office|branch|headquarter|based|local|near|install|"
                   r"provid|including|across|surrounding|communit|we are|proudly|located", re.I)
NOT_DADE = re.compile(r"miami (valley|university|county|township|oklahoma|ok\b|oh\b|ohio|indiana|in\b|dolphins|heat|hurricanes|marlins|vice)|"
                      r"university of miami|miami herald", re.I)
GEN = re.compile(r"contact|about|who-we-are|our-company|services|commercial|residential|testimonial|projects|portfolio|clients", re.I)
ADDR = re.compile(r"\b([A-Z][A-Za-z .'\-]{2,30}?),?\s+(?:FL|Florida)\.?,?\s+(\d{5})\b")


def check(url):
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
        res["error"] = err; json.dump(res, open(cf, "w")); return res
    final = r.url
    txt, _, links, _ = page_text(r.text)
    pages = {final: txt}
    cand = []
    for href, label in links:
        if not href or href.startswith(("mailto:", "tel:", "#", "javascript")):
            continue
        u = urljoin(final, href).split("#")[0]
        if _domain(u) == _domain(final) and (SLUG.search(u) or SLUG.search(label or "") or GEN.search(u) or GEN.search(label or "")) and u not in cand:
            cand.append(u)
    sm, _ = fetch(urljoin(final, "/sitemap.xml"))
    if sm is not None:
        for loc in re.findall(r"<loc>\s*([^<]+?)\s*</loc>", sm.text)[:2000]:
            if loc.endswith(".xml"):
                s2, _ = fetch(loc)
                if s2 is not None:
                    for l2 in re.findall(r"<loc>\s*([^<]+?)\s*</loc>", s2.text)[:2000]:
                        if SLUG.search(l2) and l2 not in cand:
                            cand.append(l2)
            elif SLUG.search(loc) and loc not in cand:
                cand.append(loc)
    cand.sort(key=lambda u: 0 if re.search(r"miami|dade|doral|hialeah|homestead|kendall|gables", u, re.I) else
              1 if re.search(r"area|location|contact|about|cities|count", u, re.I) else 2)
    for u in cand[:18]:
        time.sleep(0.8)
        r2, _ = fetch(u)
        if r2 is not None:
            t2, _, _, _ = page_text(r2.text)
            pages[r2.url] = t2
    found, evidence = {}, {}
    for u, t in pages.items():
        flat = re.sub(r"\s+", " ", t)
        for m in ADDR.finditer(flat):
            if m.group(2) in MD_ZIPS:
                p = "office:" + municipality(m.group(1), m.group(2), "FL")
                found[p] = True; evidence.setdefault(p, u)
        for p in PLACES:
            for m in re.finditer(r"(?<![A-Za-z-])" + re.escape(p) + r"(?![A-Za-z])", flat, re.I):
                ctx = flat[max(0, m.start() - 120): m.end() + 120]
                if NOT_DADE.search(ctx):
                    continue
                if p == "Miami" and re.match(r"-?\s*(Dade|Beach|Gardens|Lakes|Shores|Springs)", flat[m.end(): m.end() + 8], re.I):
                    continue
                listy = len(re.findall(r"(?<![A-Za-z])(" + "|".join(map(re.escape, PLACES + ["Fort Lauderdale", "Hollywood", "Pembroke Pines", "Boca Raton", "Palm Beach", "Broward"])) + r")(?![A-Za-z])", ctx, re.I)) >= 3
                slug = bool(re.search(re.escape(p.lower().replace(" ", "-")), u.lower()))
                if SERVE.search(ctx) or listy or slug or re.search(re.escape(p) + r",?\s+(FL|Florida)", ctx, re.I):
                    found[p] = True; evidence.setdefault(p, u)
                    break
        if re.search(r"south florida|tri-?county", flat, re.I) and SERVE.search(flat):
            found.setdefault("South Florida", True); evidence.setdefault("South Florida", u)
    res.update({"ok": True, "final_url": final, "pages": list(pages), "found": sorted(found), "evidence": evidence})
    json.dump(res, open(cf, "w"), indent=1)
    return res


if __name__ == "__main__":
    urls = json.load(open(sys.argv[1]))
    def safe(u):
        try:
            return check(u)
        except Exception as e:
            return {"ok": False, "error": repr(e)}
    with ThreadPoolExecutor(12) as ex:
        res = list(ex.map(safe, urls))
    print("done", len(res), sum(1 for r in res if r.get("ok")))
