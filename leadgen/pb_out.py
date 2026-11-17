import json, re, sys
sys.path.insert(0, ".")
from build import *
from generic import rows_from_doc_entries
from docx.shared import Pt
d = json.load(open("data/permits_bids.json"))
cs = d["contractor_summaries"]
bt_map = lambda b: "Dealer/Integrator" if b.lower().startswith("dealer") else ("Subcontractor" if "sub" in b.lower() or "electric" in b.lower() else (b if b in ("Monitoring Center", "Guard Company", "Consultant/Broker", "Software/Vendor", "Other") else "Other"))
for e in cs:
    e["business_type_raw"] = e.get("business_type", "")
    e["business_type"] = bt_map(e.get("business_type", "") or "")
    if e["business_type_raw"] and e["business_type_raw"] != e["business_type"]:
        e["found"] = f"[{e['business_type_raw']}] " + e.get("found", "")
mdz = lambda e: region(e.get("zip", ""), "FL", e.get("municipality")) == "Miami-Dade"
from geo import region
cs_md = [e for e in cs if mdz(e)]
cs_other = [e for e in cs if not mdz(e)]
bids = []
for b in d["bids"]:
    bids.append({"heading": f"{b['agency']}: {b['title']}"[:200], "poc": "", "municipality": "?", "state": "FL", "zip": "?",
                 "website": "?", "email": "?", "business_type": "Other",
                 "found": f"What was bought: {b.get('what_was_bought','?')} Winner(s): {b.get('winner','?')}. Value: {b.get('value','?')}. Date: {b.get('date','?')}." + (f" Notes: {b['notes']}" if b.get("notes") else ""),
                 "why": "Shows who wins public security/camera work in Miami-Dade; winners already install cameras in schools and public buildings (prime IRIS sites).",
                 "next_step": "approach winners as resellers; reference the contract in the call",
                 "source_url": b.get("source_url", "?")})
n_permits = sum(p.get("permit_count", 0) for p in d["permits"])
portals = sorted({p.get("city_portal", "") for p in d["permits"]})
intro = [
    "What this is: (1) low-voltage, alarm, CCTV and access-control permits pulled in the last 24 months, summarized per contractor; (2) public bid awards for security/camera work by Miami-Dade public bodies.",
    "Sources: Coral Gables and Miami Beach permit portals / open data, Miami-Dade County permit data, and agency procurement pages (Miami-Dade County Public Schools, Miami-Dade County, City of Miami, Coral Gables, Miami Beach, Homestead, Jackson Health). Every entry carries its source URL; the method notes at the end list each portal and what was blocked.",
    "Warmth tier: TIER 3 - COLD. Permits and awards prove who is installing cameras and access control in commercial buildings right now, but there is no relationship yet.",
    f"Date collected: {TODAY}.",
    f"Entries: {len(cs)} contractor summaries ({len(cs_md)} based in Miami-Dade) built from {len(d['permits'])} contractor-by-portal permit groups ({n_permits} permits; portals/datasets: {', '.join(p for p in portals if p)}), and {len(bids)} bid awards. Private single-family home addresses are not listed.",
]
groups = [("Contractors pulling security permits - based in Miami-Dade", cs_md, ""),
          ("Contractors pulling security permits - based elsewhere", cs_other, ""),
          ("Public bid awards for security / camera / access-control work", bids, "")]
top = d.get("top_picks") or []
write_doc("../docs/T3_Permits_and_Bids.docx", "Permits and bid awards - security work in Miami-Dade", intro, groups, top,
          outro_lines=[])
# appendix table of permit groups
from docx import Document
doc = Document("../docs/T3_Permits_and_Bids.docx")
doc.add_heading("Appendix: permits by contractor and portal", 1)
t = doc.add_table(rows=1, cols=5)
t.style = "Light Grid Accent 1"
for c, h in zip(t.rows[0].cells, ["Contractor", "Portal / dataset", "Permits", "Work types", "Date range"]):
    c.text = h
for p in sorted(d["permits"], key=lambda x: -x.get("permit_count", 0)):
    cells = t.add_row().cells
    vals = [p.get("contractor", ""), p.get("city_portal", ""), str(p.get("permit_count", "")), (p.get("work_types", "") or "")[:300], p.get("date_range", "")]
    for c, v in zip(cells, vals):
        c.text = v
        for para in c.paragraphs:
            for run in para.runs:
                run.font.size = Pt(8)
doc.add_heading("Method notes and blocked sources", 1)
doc.add_paragraph(d.get("notes", ""))
doc.save("../docs/T3_Permits_and_Bids.docx")
rows = rows_from_doc_entries(cs, "T3_Permits_and_Bids.docx")
json.dump(rows, open("data/out_pb.json", "w"), indent=1)
print("pb", len(cs), len(cs_md), len(bids), len(d["permits"]))
