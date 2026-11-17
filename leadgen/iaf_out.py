import json, re, sys
sys.path.insert(0, ".")
from build import *
from enrich import enrich, norm_url
from geo import region

SRC = "https://members.iaf-safe.org/members/directory/search_bootstrap.php?twocol=&org_id=AAFL"
OVERRIDE_TYPE = {
    "ABC Liquors": "Other", "Xfinity Home": "Other", "Comcast": "Other",
}
recs = json.load(open("data/iaf_members.json"))
try:
    _found = json.load(open("data/websites_found.json"))
except FileNotFoundError:
    _found = {}
for _r in recs:
    if not _r["website"]:
        _f = _found.get(clean_name(_r["name"])) or _found.get(_r["name"])
        if _f and _f.get("website"):
            _r["website"] = _f["website"]
rows = []
for r in recs:
    en = enrich(r["website"]) if r["website"] else None
    btype = OVERRIDE_TYPE.get(r["name"]) or classify(r["name"], en)
    contact_name = clean_contact(r["contact_name"])
    contact = pick_contact(contact_name, SRC, en)
    email = (en or {}).get("emails", [])[:1] if en and en.get("ok") else []
    services = services_string(en)
    pz_texts = [" ".join((en or {}).get("pz_mentions", []))] if en and en.get("ok") else []
    row = make_row(r["name"], r["city"], r["state"], r["zip"], norm_url(r["website"]) or "?",
                   email[0] if email else "?", btype, services, locations_value(en), contact, SRC, pz_texts)
    rows.append(row)
rows = sort_rows(rows)

# Board and committees (names as published on IAF pages; companies only where IAF states them)
board = [
    ("Farshid Pourgolafshan", "President (Executive Officer)", "Norlee Group"),
    ("Sean Githens", "Vice-President / President-Elect", "Redwire"),
    ("Diego R. del Pino", "Past President; South Region Director (Miami, Dade & Broward)", "APS Security"),
    ("Michael Sudheimer", "Treasurer", "Advanced Fire Protection Services, Inc."),
    ("Grady Medcalf", "Secretary", "Comcast"),
    ("Shannon Few", "Executive Director", "Integration Association of Florida"),
    ("Fernando Munilla", "Director - Electrical", "Thunder Electrical Contractors Inc."),
    ("Ed Greer", "Director - Fire", "Commercial Fire LLC"),
    ("Rick Seymour", "Director - Security", "Guardian Hawk"),
    ("John Minerva", "Director - Automation", "Executive Electronics of Southwest FL, Inc."),
    ("Adam Martin", "Regional Director - North Central (Volusia south to Osceola & Brevard)", "Wiginton Fire Systems"),
    ("Ryan Miller", "Regional Director - Northwest (incl. Panhandle)", "RM Integrations"),
    ("Kevin Madden", "Regional Director - Southeast (Ft. Pierce south to Palm Beach)", "Group One Safety & Security"),
    ("Nathan Barnhart", "Regional Director - West Central (Tampa south to Sarasota & Hendry)", "Pye Barker Fire & Safety"),
    ("Jorgia Wooten", "Regional Director - North Central (Tallahassee to Ocala)", "Crime Prevention Security Systems"),
    ("Jason Rountree", "Regional Director - Southwest (Charlotte, Lee & Collier)", "Summit Fire & Security"),
    ("Steven Thompson", "Regional Director - Northeast (Nassau to Flagler)", "Summit Fire & Security"),
    ("Steven Hayes", "Associate Member Representative", "WorkHorse (WorkHorseSCS.com)"),
    ("Josh Adkins", "Fire Safety Public Service Representative", "West Manatee Fire & Rescue Department"),
    ("Chief Robert Bage", "Law Enforcement Public Service Representative", "Chief of Police, City of Fort Walton Beach"),
    ("Eric Prutsman", "Legal Counsel / Lobbyist", "Prutsman & Associates, P.A."),
]
committees = {
    "Executive Committee": ["Farshid Pourgolafshan (Chair)", "Sean Githens", "Grady Medcalf", "Michael Sudheimer", "Diego R. del Pino"],
    "Legislative Committee": ["Grady Medcalf (Co-Chair)", "Diego R. del Pino (Co-Chair)", "Eric Prutsman", "Rick Seymour", "Michael Sudheimer", "Ed Greer", "Mark Simmons", "Kevin Madden", "Tommy Whisnant", "Rob Shannon", "Eric Tysinger", "Mark Astrom", "Ryan Peterson", "David Botknecht", "Will Ford"],
    "Education Committee": ["Sean Githens (Chair)", "Robert Few", "Van Linn", "Ryan Miller", "Ed Greer", "Grady Medcalf", "Natalia Burey", "Rick Lerch"],
    "Finance Committee": ["Michael Sudheimer (Chair)", "Grady Medcalf", "Jorgia Wooten", "Mark Astrom"],
    "Fire Advisory Committee": ["Michael Sudheimer (Chair)", "Mark Astrom", "Ed Greer", "Danny Harrod", "Josh Wolk", "Grady Medcalf", "Jason Rountree", "Cody Santos"],
    "Membership Committee": ["Grady Medcalf (Chair)", "Jorgia Wooten", "Kevin Madden", "Jake Voll", "Ryan Miller", "Steven Thompson", "Barb Barden", "Adam Martin", "Nathan Barnhart", "Diego del Pino", "Jason Rountree", "Steven Hayes", "Elijah Slockett", "Abby Kachris", "Angel Colon", "Scott Nelson", "Glenn Walter", "Scott Green"],
    "Public/Private Partnership Committee (incl. Alarm Management Sub-committee)": ["Chief Robert Bage (Chair)", "Grady Medcalf", "Marvin Smith"],
    "Workforce Development Committee": ["Rick Seymour (Chair)", "Michael Sudheimer", "Ed Greer", "Mark Simmons", "Steve Chernoff", "Mark Erskine", "Brian Lee", "Justin Mills", "Kenny Martin", "Steve Carulo"],
    "Convention Committee": ["Jorgia Wooten (Chair)", "Grady Medcalf", "Diego R. del Pino"],
}
company_of = {norm_name(n): c for n, _, c in board}
# match committee names against IAF directory listed contacts / employee info (same public directory)
for r in recs:
    for p in [r["contact_name"]] + r.get("employees", []):
        k = norm_name(title_person(p))
        if k and k not in company_of:
            company_of[k] = r["name"] + " (matched in IAF member directory)"
cm_rows = []
for cname, members in committees.items():
    for m in members:
        base = re.sub(r"\s*\(.*\)", "", m).replace("Chief ", "")
        k = norm_name(base)
        comp = company_of.get(k) or company_of.get(norm_name("Chief " + base)) or "?"
        cm_rows.append((m, cname, comp, "https://www.iaf-safe.org/committees.php"))
board_rows = [(n, role, comp, "https://www.iaf-safe.org/directors.php") for n, role, comp in board]

md = sum(1 for r in rows if r["_region"] == "Miami-Dade")
write_xlsx("../leads/T1_IAF_Members.xlsx",
           f"Integration Association of Florida (IAF) member directory - all {len(rows)} public listings (search with blank fields). Source: {SRC}",
           "Warmth: TIER 1 - SUPER TOP PRIORITY. Trade-association members are licensed, established Florida integrators/alarm dealers who invest in the industry. "
           f"Sorted Miami-Dade first ({md}), then Broward, Palm Beach, rest of Florida, out of state; then Fit Score.",
           f"Date collected: {TODAY}. Board and committee members (from iaf-safe.org/directors.php and /committees.php) are listed in sections below the main table.",
           rows,
           extra_sections=[("IAF BOARD OF DIRECTORS (as published at https://www.iaf-safe.org/directors.php)",
                            ["Name", "Board Role", "Company (as stated by IAF)", "Source URL"], board_rows),
                           ("IAF COMMITTEE MEMBERS (as published at https://www.iaf-safe.org/committees.php)",
                            ["Name", "Committee", "Company (IAF-stated, or matched to IAF directory listing)", "Source URL"], cm_rows)],
           sheet_title="IAF Members")
json.dump([{k: v for k, v in r.items()} for r in rows], open("data/out_iaf.json", "w"), indent=1)
from collections import Counter
print(len(rows), Counter(r["_region"] for r in rows), Counter(r["Fit Score"] for r in rows))
print(sum(1 for r in rows if r["Point of Contact"]), "with contact;", sum(1 for r in rows if r["Email"] != "?"), "with email")
