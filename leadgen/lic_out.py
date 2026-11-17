import json, re, sys
from collections import defaultdict
sys.path.insert(0, ".")
from build import *
from enrich import enrich, norm_url
from mfr_out import norm_key

SRC = "https://www2.myfloridalicense.com/sto/file_download/extracts/lic08el.csv"
PAGE = "https://www2.myfloridalicense.com/electrical-contractors/public-records/"
lic = json.load(open("data/dbpr_licenses.json"))
# websites found for license holders (by name key) from other sources / website search
known = {}
for f in ["data/out_iaf.json", "data/out_mfr.json"]:
    try:
        for r in json.load(open(f)):
            if r.get("Website") not in ("?", ""):
                known.setdefault(norm_key(r["Name"]), r["Website"])
    except FileNotFoundError:
        pass
try:
    for k, v in json.load(open("data/websites_found.json")).items():
        if v.get("website"):
            known.setdefault(norm_key(k), v["website"])
except FileNotFoundError:
    pass

by = defaultdict(list)
for x in lic:
    by[norm_key(x["dba"] or x["licensee"])].append(x)
rows, det = [], []
for k, g in by.items():
    x = sorted(g, key=lambda y: (y["status"] != "Current/Active", y["occupation"]))[0]
    name = x["dba"] or x["licensee"]
    site = known.get(k, "")
    en = enrich(site) if site else None
    person = title_person(x["licensee"])
    contact = pick_contact(person, SRC, en)
    if contact[1] == "Listed contact":
        contact = (contact[0], "License holder (DBPR " + x["occupation"].split("(")[-1].rstrip(")") + ")", SRC)
    email = ((en or {}).get("emails") or ["?"])[0] if en and en.get("ok") else "?"
    services = services_string(en)
    pz = [" ".join((en or {}).get("pz_mentions", []))] if en and en.get("ok") else []
    btype = classify(name, en) if x["dba"] else "Dealer/Integrator"
    row = make_row(name, x["city"], x["state"], x["zip"], site or "?", email, btype, services, locations_value(en),
                   contact, SRC, pz)
    row["_active"] = any(y["status"] == "Current/Active" for y in g)
    rows.append(row)
    for y in g:
        det.append((row["Name"], y["license"], y["occupation"], title_person(y["licensee"]), y["status"],
                    y["original_date"], y["expires"], row["Municipality"], row["ZIP Code"]))
# active licenses first within region ordering
rows = sorted(sort_rows(rows), key=lambda r: (0 if r["_active"] else 1))
json.dump(rows, open("data/out_lic.json", "w"), indent=1)

from openpyxl import Workbook
wb = Workbook()
ws = wb.active
ws.title = "Licenses"
n_act = sum(1 for r in rows if r["_active"])
write_sheet(ws, f"Florida DBPR alarm system contractor licenses (Certified Alarm System Contractor I = EF, II = EG) with a Miami-Dade (county code 23) address - {len(rows)} businesses / {len(lic)} licenses. Source: DBPR Electrical Contractors public-records licensee extract {SRC} (listed on {PAGE}).",
            "Warmth: TIER 3 - COLD. Licensed alarm contractors in the county, no relationship signal. Useful to confirm licensing of other leads and to find small owner-run shops the trade lists miss. "
            f"Active licenses first ({n_act}); Point of Contact = the license holder named on the DBPR record. Websites only where one was confirmed (other sources or web search). Full license details on the 'License details' tab.",
            f"Date collected: {TODAY}.", rows)
ws2 = wb.create_sheet("License details")
hdr = ["Business (DBA or licensee)", "License #", "License type", "License holder", "Status", "Original license date", "Expires", "Municipality", "ZIP Code"]
for j, h in enumerate(hdr, 1):
    c = ws2.cell(row=1, column=j, value=h); c.font = Font(bold=True)
for i, d in enumerate(det, 2):
    for j, v in enumerate(d, 1):
        ws2.cell(row=i, column=j, value=v)
for j, w in enumerate([40, 12, 40, 26, 16, 14, 12, 22, 10], 1):
    ws2.column_dimensions[get_column_letter(j)].width = w
wb.save("../leads/T3_Licenses.xlsx")
from collections import Counter
print(len(rows), Counter(r["_region"] for r in rows), "active", n_act, "with site", sum(1 for r in rows if r["Website"] != "?"))
