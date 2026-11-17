import json, re, sys
sys.path.insert(0, ".")
from build import *
from generic import rows_from_records


def prep(recs):
    out = []
    for r in recs:
        r = dict(r)
        if r.get("contact_name"):
            r["contact_name"] = re.split(r"\s*;\s*|\s+and\s+", r["contact_name"])[0]
            role = re.split(r"\s*\(", r.get("contact_role", ""))[0].strip()
            r["contact_role"] = re.sub(r"s$", "", role) if role.lower().startswith("co-founders") else role
        if "pipl default" in (r.get("notes", "") + r.get("flag", "")) and r.get("zip", "").startswith("33131"):
            r["zip"] = ""
        fl = (r.get("flag", "") + " " + r.get("notes", "")).lower()
        if "vendor" in fl or "associate member" in fl:
            r["business_type"] = "Software/Vendor"
        elif "consultant" in fl:
            r["business_type"] = "Consultant/Broker"
        elif "gsoc" in fl or "end user" in fl:
            r["business_type"] = "Other"
        elif "guard" in fl:
            r["business_type"] = "Guard Company"
        elif "monitoring" in (r.get("tma_evidence", "") + r.get("name", "")).lower() and "listed monitoring" in r.get("tma_evidence", "").lower():
            r["business_type"] = "Monitoring Center" if re.search(r"central station|monitoring", r["name"], re.I) else "Dealer/Integrator"
        out.append(r)
    return out


# ---------------- TMA ----------------
tma = prep(json.load(open("data/tma_members.json")))
rows = rows_from_records(tma, source_key="evidence_url")
for r in rows:
    raw = r["_raw"]
    if not r["Source URL"]:
        r["Source URL"] = raw.get("listing_url", "")
rows = sort_rows(rows)
json.dump([{k: v for k, v in r.items() if k != "_raw"} for r in rows], open("data/out_tma.json", "w"), indent=1)
people = []
for t in tma:
    for p in t.get("people") or []:
        people.append((p["name"], p["role"], p["company"], p["source_url"]))
evidence = [(r["Name"], r["_raw"].get("tma_evidence", ""), r["_raw"].get("flag", "") or "clean Miami-Dade lead") for r in rows]
md = sum(1 for r in rows if r["_region"] == "Miami-Dade")
write_xlsx("../leads/T1_TMA_Members.xlsx",
           f"The Monitoring Association (TMA) members in Florida - {len(rows)} companies ({md} in Miami-Dade). Intended source: TMA member directory https://my.tma.us/tmamemberdirectory (USA > Florida) - BLOCKED by a Cloudflare bot check; rebuilt from public tma.us pages and the search-engine index of TMA directory pages (see evidence table).",
           "Warmth: TIER 1 - SUPER TOP PRIORITY. TMA members run or buy monitoring (central stations, dealers with UL-listed monitoring) and are early adopters of police-response technology. This list is INCOMPLETE until the directory is exported by hand (see run_log.md NEEDS MANUAL WORK).",
           f"Date collected: {TODAY}. Miami-Dade first. TMA board/committee people from Florida are listed below the table.",
           rows,
           extra_sections=[("TMA MEMBERSHIP EVIDENCE PER COMPANY", ["Company", "Evidence of TMA membership", "Caveat"], evidence),
                           ("TMA LEADERSHIP FROM FLORIDA (as published on tma.us)", ["Name", "TMA role", "Company (as stated)", "Source URL"], people)],
           sheet_title="TMA Members")
print("tma", len(rows), md)

# ---------------- Directories ----------------
dr = prep(json.load(open("data/directories.json")))
rows = rows_from_records(dr)
dirs = []
for r in rows:
    raw = r["_raw"]
    d = raw.get("directory") or []
    r["_dirs"] = ", ".join(d) if isinstance(d, list) else str(d)
    dirs.append((r["Name"], r["_dirs"], raw.get("flag", "")))
rows = sort_rows(rows)
json.dump([{k: v for k, v in r.items() if k != "_raw"} for r in rows], open("data/out_dir.json", "w"), indent=1)
md = sum(1 for r in rows if r["_region"] == "Miami-Dade")
write_xlsx("../leads/T3_Directories.xlsx",
           f"Security integrator directories, Miami-Dade - {len(rows)} companies ({md} in Miami-Dade). Sources: https://pipl.systems/security-integrators/florida/ ; https://www.securityinformed.com/companies/miami-security-companies/directory.html ; https://www.sourcesecurity.com/companies/systems-integrators-florida/directory.html ; BOMA Miami-Dade https://members.bomamiamidade.org/member-directory (blocked; public BOMA pages used).",
           "Warmth: TIER 3 - COLD. Directory presence only; no relationship signal. Locksmiths, cyber-only firms and manufacturers excluded.",
           f"Date collected: {TODAY}. Miami-Dade first. Which directory listed each company, and caveats, are in the table below.",
           rows,
           extra_sections=[("DIRECTORY AND CAVEATS PER COMPANY", ["Company", "Listed in", "Caveat"], dirs)],
           sheet_title="Directories")
print("dir", len(rows), md)
