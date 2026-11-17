import json, re
from bs4 import BeautifulSoup
s = BeautifulSoup(open("raw/iaf_results_p1.html").read(), "lxml")
out = []
for sr in s.select("div.search-result"):
    name = sr.select_one(".name-plate").get_text(" ", strip=True)
    contact = sr.select_one(".second-line-name")
    contact = contact.get_text(" ", strip=True) if contact else ""
    addr = [d.get_text(" ", strip=True) for d in sr.select(".address-block > div")]
    city = state = zp = ""
    street = []
    for a in addr:
        m = re.match(r"^(.*?),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)\s*$", a)
        if m:
            city, state, zp = m.groups()
        else:
            street.append(a)
    w = sr.select_one("a.website-link")
    web = w.get("href", "").strip() if w else ""
    emp = sr.select_one(".additional-info")
    emps = []
    if emp:
        t = emp.get_text("\n", strip=True).replace("Employee Info:", "")
        emps = [x.strip() for x in t.split("\n") if x.strip()]
    certs = [i.get("title", "") for i in sr.select(".cert-display [title]")]
    out.append(dict(name=name, contact_name=contact, address=" ".join(street), city=city, state=state, zip=zp,
                    website=web, employees=emps, certs=certs, id=sr.get("id")))
json.dump(out, open("data/iaf_members.json", "w"), indent=1)
from collections import Counter
from geo import region
print(len(out), Counter(region(r["zip"], r["state"]) for r in out))
print(sum(1 for r in out if r["website"]), "with website")
