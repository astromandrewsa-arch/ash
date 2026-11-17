"""Florida DBPR Electrical Contractors' Licensing Board licensee extract (public download).
Keep Certified Alarm System Contractor I (EF) and II (EG) licenses whose county code is 23 (Dade)."""
import csv, json, re
from collections import defaultdict
SRC = "https://www2.myfloridalicense.com/sto/file_download/extracts/lic08el.csv"
OCC = {"EF": "Certified Alarm System Contractor I (EF)", "EG": "Certified Alarm System Contractor II (EG)"}
rows = list(csv.reader(open("raw/lic08el.csv", encoding="latin-1")))
recs = []
for r in rows:
    if r[1] not in OCC or r[11] != "23":
        continue
    status = {"C": "Current", "P": "Probation", "S": "Suspended"}.get(r[13], r[13]) + "/" + {"A": "Active", "I": "Inactive"}.get(r[14], r[14])
    last, _, first = r[2].partition(",")
    person = (first.strip() + " " + last.strip()).strip()
    recs.append(dict(license=r[20], occupation=OCC[r[1]], licensee=person, dba=r[3].strip(), city=r[8].strip(),
                     state=r[9].strip(), zip=r[10].strip(), status=status, original_date=r[15], expires=r[17],
                     po_box=bool(re.search(r"P\.?\s*O\.?\s*BOX", r[5], re.I))))
json.dump(recs, open("data/dbpr_licenses.json", "w"), indent=1)
by = defaultdict(list)
for x in recs:
    by[(x["dba"] or x["licensee"]).upper()].append(x)
print(len(recs), "licenses;", len(by), "distinct businesses/individuals;", sum(1 for x in recs if x["dba"]), "with DBA")
