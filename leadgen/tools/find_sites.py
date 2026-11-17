"""Find official websites for named companies by testing candidate domains built from the company name.
A candidate is accepted only if the fetched homepage text contains the company's distinctive name
AND a Florida/Miami marker. Nothing is invented: unverified candidates are discarded."""
import json, re, sys, time
from concurrent.futures import ThreadPoolExecutor
import requests
sys.path.insert(0, "/home/user/ash/leadgen")
from enrich import UA, page_text, allowed

GENERIC = {"inc", "llc", "corp", "corporation", "co", "company", "the", "of", "and", "dba", "pa", "ltd", "group", "usa"}
FILLER = {"systems", "system", "services", "service", "security", "alarm", "alarms", "technologies", "technology",
          "solutions", "electric", "electrical", "contractors", "contractor", "fire", "florida", "fl", "miami", "integrated", "enterprises"}


def tokens(name):
    n = re.sub(r"[&+]", " and ", name.lower())
    n = re.sub(r"[^a-z0-9 ]", " ", n)
    return [t for t in n.split() if t not in GENERIC]


def candidates(name):
    t = tokens(name)
    if not t:
        return []
    core = [x for x in t if x not in FILLER]
    stems = ["".join(t)]
    if core and core != t:
        stems += ["".join(core) + w for w in ("security", "alarm", "systems", "")] 
    stems += ["".join(t) + "inc", "".join(t) + "fl", "".join(t) + "miami", "-".join(t)]
    seen, out = set(), []
    for s in stems:
        if len(s) < 5 or s in seen:
            continue
        seen.add(s)
        for tld in (".com", ".net"):
            out.append(s + tld)
    return out[:12]


def distinct_phrase(name):
    t = tokens(name)
    return " ".join(t)


def check(domain, name):
    for scheme in ("https://", "http://"):
        url = scheme + "www." + domain
        try:
            if not allowed(url):
                return None
            r = requests.get(url, headers={"User-Agent": UA}, timeout=10, allow_redirects=True)
        except Exception:
            continue
        if r.status_code != 200 or "html" not in r.headers.get("content-type", ""):
            continue
        txt, _, _, _ = page_text(r.text)
        low = re.sub(r"[^a-z0-9 ]", " ", txt.lower())
        low = re.sub(r"\s+", " ", low)
        phrase = distinct_phrase(name)
        core = [x for x in tokens(name) if x not in FILLER]
        name_ok = phrase in low or (core and " ".join(core) in low and len(" ".join(core)) >= 5 and all(x in low for x in tokens(name)))
        geo_ok = re.search(r"\bmiami\b|\bflorida\b|\bfl\s+33\d\d\d|\bhialeah\b|\bdoral\b|\bhomestead\b|\bcoral gables\b|\bmiami beach\b|\bbroward\b", low)
        parked = re.search(r"domain (is )?for sale|buy this domain|parked|godaddy|this domain|coming soon|under construction", low)
        if name_ok and geo_ok and not parked and len(low) > 400:
            return r.url
        return None
    return None


def find(item):
    name = item["name"]
    for d in candidates(name):
        u = check(d, name)
        if u:
            return name, {"website": u, "method": "candidate domain verified (name + Florida marker on homepage)"}
        time.sleep(0.3)
    return name, {"website": "", "method": "not found"}


if __name__ == "__main__":
    targets = json.load(open(sys.argv[1]))
    out_path = sys.argv[2]
    try:
        out = json.load(open(out_path))
    except Exception:
        out = {}
    todo = [t for t in targets if t["name"] not in out]
    with ThreadPoolExecutor(10) as ex:
        for i, (n, res) in enumerate(ex.map(find, todo)):
            out[n] = res
            if i % 20 == 0:
                json.dump(out, open(out_path, "w"), indent=1)
    json.dump(out, open(out_path, "w"), indent=1)
    print("found", sum(1 for v in out.values() if v["website"]), "of", len(out))
