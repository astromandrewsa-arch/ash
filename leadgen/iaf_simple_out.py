import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from openpyxl import load_workbook, Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter
from enrich import norm_url, _domain
from geo import region, municipality, MD_ZIPS
from dade_recheck import check

k = json.load(open("data/../raw/keep_rows.json"))
ws = load_workbook("/home/user/ash/leads/IAF_Members_Qualified.xlsx")["IAF Members Qualified"]
rows = list(ws.iter_rows(values_only=True)); h = rows[0]
R = {i: dict(zip(h, r)) for i, r in enumerate(rows, 1)}
members = {m["name"]: m for m in json.load(open("data/iaf_members_2026-11-20.json"))}
REG = {"Miami-Dade": 0, "Broward": 1, "Palm Beach": 2, "Other FL": 3, "Out of state": 4}


def people(r):
    out = []
    c = r["IAF Contact Person"] or ""
    if c and not c.startswith("("):
        out.append(c)
    for o in (r["Other People on IAF Listing"] or "").split(", "):
        toks = o.split()
        name_like = 2 <= len(toks) <= 4 and all(t[:1].isupper() for t in toks if t.isalpha())
        company_words = set(re.findall(r"[a-z]+", r["Company (as on IAF)"].lower()))
        if o and o not in out and name_like and not re.search(r"admin|address|addres|p\.?o\.? box|\d|acres|beach|springs|\bcity\b|\blake\b|fedora", o, re.I) \
                and not any(t.lower() in company_words for t in toks):
            out.append(o)
    own = r["Owner / Leader Named on Website"] or ""
    if own:
        nm = own.split(" (")[0]
        if not any(nm.split()[-1].lower() in p.lower() and nm.split()[0].lower() in p.lower() for p in out):
            out.append(own.replace(")", ", per website)") if "(" in own else own + " (per website)")
    return "; ".join(out)


def sells(r):
    s = (r["Security Products / Services on Website"] or "").lower()
    parts = [lbl for key, lbl in (("cctv", "cameras"), ("access control", "access control"), ("intrusion", "burglar alarms"),
                                  ("alarm monitoring", "monitoring"), ("fire alarm", "fire alarm"), ("intercom", "intercom"),
                                  ("remote video", "remote video monitoring")) if key in s]
    if r["Commercial Work (Y/N)"] == "Y":
        parts.insert(0, "commercial")
    b = r["Brands on Website"] or ""
    return ", ".join(parts) + (f" | brands: {b}" if b else "")


out = []
for i in k["keep1"] + k["keep2"]:
    r = R[i]
    m = members.get(r["Company (as on IAF)"]) or next((v for n, v in members.items() if n.lower() == r["Company (as on IAF)"].lower()), {})
    reg = r["County / Region (IAF address)"]
    city_raw = r["IAF Address City"] or ""
    office_city = municipality(city_raw, r["IAF ZIP"], r["IAF State"]) if reg == "Miami-Dade" else (city_raw.title() if city_raw.isupper() else city_raw)
    locs, office_md, sofla = [], [], False
    if reg == "Miami-Dade":
        office_md.append(municipality(city_raw, r["IAF ZIP"], r["IAF State"]))
    c = check(r["Website"]) if r["Website"] else None
    if c and c.get("ok"):
        for f in c["found"]:
            if f.startswith("office:"):
                if f[7:] not in office_md:
                    office_md.append(f[7:])
            elif f != "South Florida":
                locs.append(f)
            elif reg in ("Broward", "Palm Beach"):
                sofla = True
    if not office_md and not locs and not sofla:
        continue  # not in and not covering Miami-Dade
    locs = [l for l in dict.fromkeys(locs) if l not in office_md]
    if "Miami" in locs and len(locs) > 1:
        locs.remove("Miami"); locs.append("Miami")
    loc_text = "; ".join(x for x in [("Office in " + ", ".join(office_md)) if office_md else "",
                                      ("Covers " + ", ".join(locs)) if locs else ("Covers South Florida" if sofla else "")] if x)
    dealer = r["Security Dealer?"] if r["Security Dealer?"].startswith("YES") else "LIKELY - no website to confirm"
    notes = []
    if r["IAF Board / Committee Role"]:
        notes.append("IAF: " + r["IAF Board / Committee Role"])
    n = (r["Notes"] or "")
    if re.search(r"rapidsos", n, re.I): notes.append("Owned by RapidSOS (911 data company)")
    if re.search(r"parent company is convergint|convergint", n, re.I) and "Integrated Security" in r["Company (as on IAF)"]: notes.append("Part of Convergint")
    if re.search(r"Fisec", r["Company (as on IAF)"]): notes.append("Website down")
    out.append({"Company (as on IAF)": r["Company (as on IAF)"], "Security Dealer?": dealer,
                "Miami-Dade Locations": loc_text, "People": people(r),
                "Main Office City (IAF listing)": office_city, "What They Sell": sells(r) if dealer.startswith("YES") else "",
                "Website": r["Website"] or "", "Email": r["Email (published on website)"] or "", "Notes": "; ".join(notes),
                "_rank": (0 if office_md else 1 if locs else 2, 0 if dealer.startswith("YES") else 1, REG.get(reg, 9), -len(locs)),
                "_dom": _domain(norm_url(r["Website"])) if r["Website"] else r["Company (as on IAF)"],
                "_root": re.sub(r"[^a-z]", "", r["Company (as on IAF)"].lower())[:9]})
# one row per company website (branch listings of the same firm collapse; Miami-Dade branch wins)
out.sort(key=lambda x: (x["_rank"], x["Company (as on IAF)"].lower()))
seen, final = {}, []
for x in out:
    if x["_dom"] in seen or x["_root"] in seen:
        continue
    seen[x["_dom"]] = x; seen[x["_root"]] = x; final.append(x)
cols = ["Company (as on IAF)", "Security Dealer?", "Miami-Dade Locations", "People", "Main Office City (IAF listing)", "What They Sell", "Website", "Email", "Notes"]
wb = Workbook(); s = wb.active; s.title = "Miami-Dade Security Dealers"
for j, c in enumerate(cols, 1):
    cell = s.cell(row=1, column=j, value=c); cell.font = Font(bold=True, color="FFFFFF"); cell.fill = PatternFill("solid", fgColor="1F3864")
for i, x in enumerate(final, 2):
    for j, c in enumerate(cols, 1):
        s.cell(row=i, column=j, value=x[c])
for j, w in enumerate([38, 26, 46, 46, 22, 46, 34, 30, 40], 1):
    s.column_dimensions[get_column_letter(j)].width = w
s.freeze_panes = "B2"; s.auto_filter.ref = f"A1:I{len(final)+1}"
p = "/home/user/ash/leads/IAF_Miami-Dade_Security_Dealers.xlsx"; wb.save(p)
json.dump([{c: x[c] for c in cols} for x in final], open("data/iaf_simple.json", "w"), indent=1)
print(p, len(final), sum(1 for x in final if x["_rank"][0] == 0), "with office in MD")
for x in final: print(" ", x["Company (as on IAF)"][:40], "|", x["Security Dealer?"][:24], "|", x["Miami-Dade Locations"][:80], "|", x["People"][:50])
