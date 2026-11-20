import ast, json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build import classify, clean_contact, title_person, norm_name, clean_name
from enrich import norm_url, _domain
from geo import region, municipality, MD_ZIPS, MD_CITY_NAMES
from iaf_qualify_crawl import crawl
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter

SRC = "https://members.iaf-safe.org/members/directory/search_bootstrap.php?twocol&org_id=AAFL"
members = json.load(open("data/iaf_members_2026-11-20.json"))
found = json.load(open("data/websites_found.json"))
verified = json.load(open("data/verified_sites.json"))
ver_by_dom = {_domain(norm_url(v.get("website") or "")): v for v in verified.values() if v.get("website")}
ver_by_name = {norm_name(k): v for k, v in verified.items()}
cache_dir = "cache"

# IAF board / committee roles (from iaf-safe.org/directors.php and committees.php, read earlier)
src = open("iaf_out.py").read()
tree = ast.parse(src)
vals = {}
for node in tree.body:
    if isinstance(node, ast.Assign) and isinstance(node.targets[0], ast.Name) and node.targets[0].id in ("board", "committees"):
        vals[node.targets[0].id] = ast.literal_eval(node.value)
roles = {}
for n, role, comp in vals["board"]:
    roles.setdefault(norm_name(n.replace("Chief ", "")), []).append("IAF " + role)
for cname, mem in vals["committees"].items():
    for m in mem:
        base = re.sub(r"\s*\(.*\)", "", m).replace("Chief ", "")
        roles.setdefault(norm_name(base), []).append(cname + (" (Chair)" if "Chair" in m else ""))


def site_owner(dom, name):
    v = ver_by_dom.get(dom) or ver_by_name.get(norm_name(name))
    if v and v.get("owner_name"):
        return v["owner_name"], v.get("owner_role", ""), v.get("owner_source", ""), v.get("notes", "")
    f = os.path.join(cache_dir, re.sub(r"[^a-z0-9.\-]", "_", dom) + ".json")
    if os.path.exists(f):
        en = json.load(open(f))
        order = ["owner", "founder", "president", "ceo", "chief executive", "principal", "managing", "general manager"]
        cs = [c for c in en.get("contacts", []) if any(k in c["role"].lower() for k in order)]
        if cs:
            cs.sort(key=lambda c: next(i for i, k in enumerate(order) if k in c["role"].lower()))
            return cs[0]["name"], cs[0]["role"], cs[0]["url"], (v or {}).get("notes", "")
    return "", "", "", (v or {}).get("notes", "")


SEC = {"intrusion alarms", "alarm monitoring", "CCTV/video surveillance", "access control"}


def qualify(name, c, vnote, v=None):
    n = name.lower()
    if "integration association of florida" in n:
        return "OTHER - trade association (IAF itself)", ""
    if v and v.get("site_status") == "ok" and v.get("cameras") and not re.search(r"fire-only|fire only|fire-alarm only|not a security|different business|distributor", (v.get("notes") or "").lower()):
        return ("YES - security dealer (residential focus)" if v.get("residential_only") else "YES - security dealer"), "hand-checked site: cameras" + (", commercial" if v.get("commercial") else "")
    if re.search(r"liquor", n):
        return "NO - not a security business", "Retailer (end user of security)"
    if re.search(r"xfinity|comcast", n):
        return "YES - security provider (national telecom, residential)", "Xfinity Home sells alarm and camera systems"
    vn = (vnote or "").lower()
    if c is None:
        hint = ("name suggests alarm/security" if re.search(r"alarm|security|secur|protect|guard|surveil|camera|access", n) else
                "name suggests fire/life-safety" if re.search(r"fire|sprinkler|life ?safety", n) else
                "name suggests electrical/low-voltage" if re.search(r"electric|voltage|wiring|communication", n) else "")
        return "UNKNOWN - no website on IAF listing", hint
    if not c.get("ok"):
        return "UNKNOWN - website down or blocked", c.get("error", "")
    svc = set(c.get("services", []))
    bt = classify(name, {"ok": True, "services": list(svc)})
    if "not a security dealer" in vn or "different business" in vn or "street lighting" in vn:
        return "NO - not a security business", "per hand check of the site"
    if bt == "Software/Vendor" or re.search(r"distribut|manufactur|wholesale|supply", n):
        return "OTHER - vendor / distributor / manufacturer (sells to dealers)", ""
    if bt == "Monitoring Center":
        return "OTHER - monitoring center", ""
    if bt == "Consultant/Broker":
        return "OTHER - consultant / broker / engineering", ""
    cam, acc, burg, fire = c.get("camera_words", 0), c.get("access_words", 0), c.get("burglar_words", 0), c.get("fire_words", 0)
    ev = ", ".join(x for x, n in (("cameras/CCTV", cam), ("access control", acc), ("burglar/security alarms", burg)) if n)
    fire_led = (("fire-only" in vn or "fire-alarm only" in vn or "fire only" in vn)
                or (re.search(r"\bfire\b", n) and cam + acc == 0 and fire >= 1)
                or (cam + acc == 0 and burg <= 1 and fire >= 2))
    if cam + acc + burg + fire == 0 and not svc:
        return "UNKNOWN - website has too little text to tell", ""
    if fire_led:
        return "PARTLY - fire / life-safety company (no cameras or access control on site)", f"fire mentions {fire}; security mentions {cam + acc + burg}"
    if cam or acc or burg >= 2:
        if "residential" in svc and "commercial" not in svc:
            return "YES - security dealer (residential focus)", ev
        return "YES - security dealer", ev
    if fire > 0 or "fire alarm" in svc:
        return "PARTLY - fire / life-safety only (no burglar alarm or cameras on site)", ""
    if bt == "Subcontractor" or re.search(r"electric", n):
        return "NO - electrical / low-voltage contractor, no security products on site", ""
    if c.get("text_len", 0) < 600:
        return "UNKNOWN - website has too little text to tell", ""
    return "NO - no alarms or security products on site", ""


def dade_status(r, c, site_addrs_md):
    reg = region(r["zip"], r["state"], r["city"])
    if reg == "Miami-Dade":
        return "A", f"Located in Miami-Dade ({municipality(r['city'], r['zip'], r['state'])}) per IAF address"
    if site_addrs_md:
        return "A", "Office in Miami-Dade per website: " + "; ".join(sorted(set(site_addrs_md)))
    if c and c.get("ok") and c.get("dade_mentions"):
        return "B", "Website mentions: " + ", ".join(c["dade_mentions"])
    if c and c.get("ok") and c.get("sofla_mentions"):
        return "C", "Website mentions South Florida only"
    if c and c.get("ok"):
        return "D", "No Miami-Dade mention on website"
    return "D", "No website to check" if not c else "Website not readable"


rows = []
for r in members:
    web = r["website"] or (found.get(r["name"]) or {}).get("website", "")
    c = crawl(web) if web else None
    dom = _domain(norm_url(web)) if web else ""
    addrs = c.get("addresses", []) if c and c.get("ok") else []
    site_md = []
    for street, city, z in addrs:
        if z in MD_ZIPS:
            site_md.append(f"{municipality(city, z, 'FL')} {z}")
    owner, orole, osrc, vnote = site_owner(dom, r["name"]) if web else ("", "", "", "")
    vrec = (ver_by_dom.get(dom) if dom else None) or ver_by_name.get(norm_name(r["name"]))
    qual, why = qualify(r["name"], c, vnote, vrec)
    tier, dade = dade_status(r, c, site_md)
    contact = clean_contact(r["contact_name"]) or ""
    others = [title_person(e) for e in r.get("employees", []) if norm_name(title_person(e)) != norm_name(contact)]
    iaf_roles = "; ".join(roles.get(norm_name(contact), []))
    for e in others:
        if roles.get(norm_name(e)):
            iaf_roles += ("; " if iaf_roles else "") + f"{e}: " + "; ".join(roles[norm_name(e)])
    svc = c.get("services", []) if c and c.get("ok") else []
    reg = region(r["zip"], r["state"], r["city"])
    priority = ("1 - Security dealer IN Miami-Dade" if qual.startswith("YES") and tier == "A" else
                "2 - Security dealer SERVING Miami-Dade" if qual.startswith("YES") and tier == "B" else
                "3 - Security dealer, South Florida mention" if qual.startswith("YES") and tier == "C" else
                "4 - Security dealer, no Dade link" if qual.startswith("YES") else
                "5 - Check by hand (no/unknown website)" if qual.startswith("UNKNOWN") and reg in ("Miami-Dade", "Broward", "Palm Beach") else
                "6 - Unknown (no website), outside South Florida" if qual.startswith("UNKNOWN") else
                "7 - Not a security dealer / other")
    rows.append({
        "Priority": priority,
        "Company (as on IAF)": clean_name(r["name"]),
        "IAF Contact Person": contact or (f"(no person named; listing shows '{r['contact_name']}')" if r["contact_name"] else "(none listed)"),
        "Other People on IAF Listing": ", ".join(others),
        "IAF Board / Committee Role": iaf_roles,
        "Security Dealer?": qual,
        "Evidence (mentions on website)": why,
        "Security Products / Services on Website": ", ".join(svc) if svc else ("?" if not (c and c.get("ok")) else "none found"),
        "Brands on Website": ", ".join(c.get("brands", [])) if c and c.get("ok") else "",
        "Commercial Work (Y/N)": "Y" if "commercial" in svc else ("N" if c and c.get("ok") else "?"),
        "Cameras (Y/N)": "Y" if "CCTV/video surveillance" in svc else ("N" if c and c.get("ok") else "?"),
        "Miami-Dade Location / Coverage": dade,
        "Miami-Dade Areas Named on Website": ", ".join(c.get("dade_mentions", [])) if c and c.get("ok") else "",
        "Addresses on Website (city ZIP)": "; ".join(f"{city} {z}" for _, city, z in addrs) if addrs else ("none printed" if c and c.get("ok") else "?"),
        "IAF Address City": r["city"].title() if r["city"].isupper() else r["city"],
        "IAF State": r["state"],
        "IAF ZIP": (r["zip"] or "")[:5],
        "County / Region (IAF address)": reg,
        "Municipality (if Miami-Dade)": municipality(r["city"], r["zip"], r["state"]) if reg == "Miami-Dade" else "",
        "Website": web or "",
        "Email (published on website)": ", ".join(c.get("emails", [])[:2]) if c and c.get("ok") else "",
        "Owner / Leader Named on Website": f"{owner} ({orole})" if owner else "",
        "Owner Source URL": osrc,
        "Notes": (vnote or "")[:300],
        "IAF Directory": SRC,
    })
order = lambda x: (x["Priority"], {"Miami-Dade": 0, "Broward": 1, "Palm Beach": 2, "Other FL": 3, "Out of state": 4}.get(x["County / Region (IAF address)"], 9), x["Company (as on IAF)"].lower())
rows.sort(key=order)
wb = Workbook()
ws = wb.active
ws.title = "IAF Members Qualified"
first = ["Company (as on IAF)", "Security Dealer?", "Evidence (mentions on website)", "Security Products / Services on Website", "Brands on Website", "Commercial Work (Y/N)", "Cameras (Y/N)", "Priority", "IAF Contact Person"]
cols = first + [k for k in rows[0].keys() if k not in first]
fills = {"1": "C6EFCE", "2": "DDEBF7", "3": "FFF2CC"}
for j, h in enumerate(cols, 1):
    cell = ws.cell(row=1, column=j, value=h)
    cell.font = Font(bold=True, color="FFFFFF"); cell.fill = PatternFill("solid", fgColor="1F3864")
    cell.alignment = Alignment(wrap_text=True, vertical="center")
for i, r in enumerate(rows, 2):
    for j, h in enumerate(cols, 1):
        ws.cell(row=i, column=j, value=r[h])
    f = fills.get(r["Priority"][0])
    if f:
        for j in range(1, 3):
            ws.cell(row=i, column=j).fill = PatternFill("solid", fgColor=f)
W = {"Priority": 30, "Company (as on IAF)": 36, "IAF Contact Person": 22, "Other People on IAF Listing": 22, "IAF Board / Committee Role": 28,
     "Security Dealer?": 34, "Evidence (mentions on website)": 36, "Security Products / Services on Website": 50, "Brands on Website": 24, "Commercial Work (Y/N)": 10, "Cameras (Y/N)": 9,
     "Miami-Dade Location / Coverage": 44, "Miami-Dade Areas Named on Website": 30, "Addresses on Website (city ZIP)": 34, "IAF Address City": 18,
     "IAF State": 6, "IAF ZIP": 8, "County / Region (IAF address)": 14, "Municipality (if Miami-Dade)": 20, "Website": 32,
     "Email (published on website)": 30, "Owner / Leader Named on Website": 30, "Owner Source URL": 36, "Notes": 50, "IAF Directory": 30}
for j, h in enumerate(cols, 1):
    ws.column_dimensions[get_column_letter(j)].width = W.get(h, 16)
ws.freeze_panes = "B2"
ws.auto_filter.ref = f"A1:{get_column_letter(len(cols))}{len(rows) + 1}"
s = wb.create_sheet("Summary")
from collections import Counter
pc = Counter(r["Priority"] for r in rows); qc = Counter(r["Security Dealer?"] for r in rows); rc = Counter(r["County / Region (IAF address)"] for r in rows)
lines = [("IAF member qualification - Miami-Dade focus", ""), ("Source", SRC + " (pulled 2026-11-20, blank search = all members)"),
         ("Members", len(rows)), ("", ""), ("BY PRIORITY", "")] + sorted(pc.items()) + [("", ""), ("SECURITY DEALER?", "")] + sorted(qc.items(), key=lambda x: -x[1]) + \
        [("", ""), ("IAF ADDRESS REGION", "")] + sorted(rc.items(), key=lambda x: -x[1]) + [("", ""), ("HOW TO READ", ""),
         ("Security Dealer?", "From each company's own website: YES = sells/installs alarms, cameras, access control or monitoring; PARTLY = fire/life-safety only; OTHER = monitoring center, vendor/distributor, consultant; UNKNOWN = no website or site down."),
         ("Miami-Dade Location / Coverage", "Located in Miami-Dade = IAF address or an address printed on the website is in a Miami-Dade ZIP; 'Website mentions' = Miami-Dade places named on the site (service area, projects, offices)."),
         ("IAF Contact Person", "The person named on the company's IAF directory listing; 'Other People' = the listing's Employee Info."),
         ("Owner / Leader Named on Website", "Most senior person named with a role on the company's own site (Miami-Dade sites hand-checked earlier)."),
         ("Phone numbers", "Not collected, per your rules.")]
for i, (a, b) in enumerate(lines, 1):
    s.cell(row=i, column=1, value=a).font = Font(bold=a.isupper() and bool(a))
    s.cell(row=i, column=2, value=b)
s.column_dimensions["A"].width = 46; s.column_dimensions["B"].width = 120
out = "/home/user/ash/leads/IAF_Members_Qualified.xlsx"
wb.save(out)
print(out, len(rows)); [print(" ", k, v) for k, v in sorted(pc.items())]
