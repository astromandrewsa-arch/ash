import json, sys
sys.path.insert(0, ".")
from build import *
d = json.load(open("data/alarm_exchange.json"))
n = sum(len(c["entries"]) for c in d["categories"])
tot = sum(c["total_listings"] for c in d["categories"])
fl = sum(1 for c in d["categories"] for e in c["entries"] if e.get("florida"))
md = sum(1 for c in d["categories"] for e in c["entries"] if e.get("miami_dade"))
intro = [
    "What this is: every listing on The Alarm Exchange (the free alarm-industry classifieds run by Kirschenbaum & Kirschenbaum PC) read and screened for IRIS: Florida dealers, subcontractors, people seeking work, account buyers/sellers, central stations, consultants, brokers, RMR add-on vendors and associations.",
    f"Source: {d['source_url']} (all 16 category views read; robots.txt-disallowed article path not fetched).",
    "Warmth tier: TIER 2 - WARM. Posters are actively buying, selling, hiring or looking for partners, which makes them open to new revenue lines.",
    f"Date collected: {d['date_collected']}.",
    f"Entries: {n} entries (from {tot} listings read across {len(d['categories'])} categories; {fl} Florida-related, {md} Miami-Dade). Within each category, Florida and Miami-Dade entries come first. No phone numbers are recorded; people seeking work are identified by first name only, as they posted.",
]
groups = []
for c in d["categories"]:
    ents = sorted(c["entries"], key=lambda e: (not e.get("miami_dade"), not e.get("florida")))
    note = f"{c['total_listings']} listings in this category; {c['included']} kept" + (f". Skipped: {c['skipped_note']}" if c.get("skipped_note") else ".")
    groups.append((c["category"], ents, note))
write_doc("../docs/T2_Alarm_Exchange.docx", "The Alarm Exchange - IRIS lead review", intro, groups, d["top_picks"],
          outro_lines=["Method notes: " + d["notes"]])
print("ok", n)

# rows for Master (Florida entries only)
from generic import rows_from_doc_entries
fl_entries = [e for c in d["categories"] for e in c["entries"] if e.get("florida")]
rows = rows_from_doc_entries(fl_entries, "T2_Alarm_Exchange.docx")
json.dump(rows, open("data/out_ax.json", "w"), indent=1)
print("ax rows", len(rows))
