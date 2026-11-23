import json, re, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from enrich import _domain, norm_url
from dade_recheck import check
from geo import MD_ZIPS

cand = json.load(open("raw/vendor_cand.json"))
master = json.load(open("data/out_master.json"))
ver = json.load(open("data/verified_sites.json"))
ver_dom = {_domain(norm_url(v["website"])): v for v in ver.values() if v.get("website")}
m_dom = {}
for r in master:
    if r.get("Website") not in ("?", ""):
        m_dom.setdefault(_domain(norm_url(r["Website"])), r)
m_name = {re.sub(r"[^a-z]", "", r["Name"].lower()): r for r in master}
NATIONAL = re.compile(r"convergint|allied universal|securitas|everon|siemens|pavion|prosegur|vector security|summit companies|conti corporation", re.I)
REG = {"Miami-Dade": 0, "Broward": 1, "Palm Beach": 2}


def sells(svc):
    s = (svc or "").lower()
    parts = [lbl for key, lbl in (("cctv", "cameras"), ("access control", "access control"), ("intrusion", "burglar alarms"),
                                  ("alarm monitoring", "monitoring"), ("fire alarm", "fire alarm"), ("intercom", "intercom"),
                                  ("remote video", "remote video monitoring")) if key in s]
    if "commercial" in s:
        parts.insert(0, "commercial")
    b = re.search(r"brands: ([^,]+(?:/[^,]+)*)", svc or "")
    brands = b.group(1).replace("/", ", ") if b else ""
    return ", ".join(parts) + (f" | brands: {brands}" if brands else "")


rows = []
for r in cand:
    web = r["Website"] if r["Website"] != "?" else ""
    dom = _domain(norm_url(web)) if web else ""
    office = [r["Municipality"]] if r["_region"] == "Miami-Dade" else []
    covers = []
    c = check(web) if web else None
    if c and c.get("ok"):
        for f in c["found"]:
            if f.startswith("office:"):
                if f[7:] not in office:
                    office.append(f[7:])
            elif f != "South Florida":
                covers.append(f)
    if not office and not covers:
        continue
    if re.search(r"^(I AM Guarded|Convergint)", r["Name"]):
        continue  # I AM Guarded is now Pye-Barker; Convergint Miami is the same office as Integrated Security Systems (both already on the sheet)
    covers = [x for x in dict.fromkeys(covers) if x not in office]
    if "Miami-Dade" in covers and "Dade County" in covers: covers.remove("Dade County")
    if "Miami-Dade" in covers: covers.remove("Miami-Dade"); covers.insert(0, "Miami-Dade")
    if "Miami" in covers and len(covers) > 1: covers.remove("Miami"); covers.append("Miami")
    loc = "; ".join(x for x in [("Office in " + ", ".join(office)) if office else "", ("Covers " + ", ".join(covers)) if covers else ""] if x)
    mr = m_dom.get(dom) or m_name.get(re.sub(r"[^a-z]", "", r["Name"].lower()))
    people = []
    v = ver_dom.get(dom)
    if v and v.get("owner_name"):
        people.append(f"{v['owner_name']} ({v.get('owner_role') or 'per website'})")
    if mr and mr.get("Point of Contact") and not any(mr["Point of Contact"].split()[-1] in p for p in people):
        role = (mr.get("Contact Role") or "").split(" (")[0]
        people.append(f"{mr['Point of Contact']} ({role})" if role else mr["Point of Contact"])
    elif r.get("Point of Contact") and not people:
        people.append(f"{r['Point of Contact']} ({(r.get('Contact Role') or '').split(' (')[0]})")
    svc = r["Services Listed on Website"]
    resi = bool(v and v.get("residential_only")) or ("residential" in (svc or "").lower() and "commercial" not in (svc or "").lower())
    lv = []
    for l in (r.get("_levels") or [f"{b}: " for b in r["_brands"]]):
        b, _, t = l.partition(": ")
        t = re.sub(r"\(.*?\)|self-declared.*|\"", "", t).strip(" ;,")
        t = re.sub(r"(?i)qolsys authorized dealer.*", "dealer", t)
        lv.append((b + " " + re.sub(r"\s*\(.*$", "", t[:40])).strip() + (" (says so on own site)" if "self-declared" in l else ""))
    notes = ["Vendor list: " + "; ".join(dict.fromkeys(lv))]
    if NATIONAL.search(r["Name"]): notes.append("National firm")
    vn = (v or {}).get("notes", "") or ""
    if re.search(r"rapidsos", vn, re.I): notes.append("Owned by RapidSOS")
    if re.search(r"site down", vn, re.I) or (c and not c.get("ok")): notes.append("Website down or blocked")
    email = r["Email"] if r["Email"] not in ("?", "") else ""
    rows.append({"Company (as on IAF)": r["Name"], "Security Dealer?": "YES - security dealer" + (" (residential focus)" if resi else ""),
                 "Miami-Dade Locations": loc, "People": "; ".join(people), "Main Office City (IAF listing)": r["Municipality"],
                 "What They Sell": sells(svc), "Website": web, "Email": email, "Notes": "; ".join(notes),
                 "_rank": (0 if office else 1, 1 if NATIONAL.search(r["Name"]) else 0, REG.get(r["_region"], 9), -len(covers)), "_dom": dom or r["Name"]})
rows.sort(key=lambda x: (x["_rank"], x["Company (as on IAF)"].lower()))
seen, final = set(), []
for x in rows:
    k = x["_dom"]; k2 = re.sub(r"[^a-z]", "", x["Company (as on IAF)"].lower())[:10]
    if k in seen or k2 in seen:
        continue
    seen |= {k, k2}; final.append(x)
cols = ["Company (as on IAF)", "Security Dealer?", "Miami-Dade Locations", "People", "Main Office City (IAF listing)", "What They Sell", "Website", "Email", "Notes"]
json.dump([[x[c] for c in cols] for x in final], open("raw/vendor_rows.json", "w"))
print(len(final))
for x in final: print(" ", x["Company (as on IAF)"][:38], "|", x["Miami-Dade Locations"][:70], "|", x["People"][:40], "|", x["Notes"][:60])
