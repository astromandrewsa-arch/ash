import json, sys
sys.path.insert(0, ".")
from build import *
from generic import rows_from_doc_entries
d = json.load(open("data/hiring.json"))
ents = d["entries"]
md = [e for e in ents if e.get("miami_dade")]
other = [e for e in ents if not e.get("miami_dade")]
intro = [
    "What this is: public job posts from Miami-Dade security firms (alarm dealers, integrators, low-voltage contractors, monitoring) hiring sales people or technicians, read as company-level growth signals for IRIS. No individual job-seekers' details are recorded.",
    "Sources: company career pages and public job-board copies of posts (Indeed posts mostly reached through Tallo, which mirrors them with dates; Greenhouse/Lever/company APIs where public). Indeed, LinkedIn, ZipRecruiter, Glassdoor and SimplyHired could not be read directly (login wall, bot blocks or robots.txt). Source URL is given for every entry.",
    "Warmth tier: TIER 3 - COLD. Hiring shows growth and focus (commercial, video, access control, new branches) but no relationship with us yet.",
    f"Date collected: {TODAY}.",
    f"Entries: {len(ents)} companies ({len(md)} in Miami-Dade). Small local firms are listed before national ones; dates are as posted or 'seen' on the collection date.",
]
groups = [("Miami-Dade companies hiring", md, ""), ("Nearby / South Florida (serving Miami-Dade)", other, "")]
for e in ents:
    roles = ", ".join(e.get("roles", []))
    if roles and roles not in e.get("found", ""):
        e["found"] = f"Roles: {roles}. Date: {e.get('date_posted', '?')}. " + e.get("found", "")
write_doc("../docs/T3_Hiring.docx", "Hiring signals - Miami-Dade security firms", intro, groups, d["top_picks"],
          outro_lines=["Method notes and blocked sources: " + d.get("notes", "")])
rows = rows_from_doc_entries([e for e in ents if not e["heading"].lower().startswith("confidential")], "T3_Hiring.docx")
json.dump(rows, open("data/out_hiring.json", "w"), indent=1)
print("hiring", len(ents), len(md), "rows", len(rows))
