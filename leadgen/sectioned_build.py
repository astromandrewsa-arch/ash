"""Build the sectioned sheet: each company row (main line, 2nd phone, company email, dealer details),
then indented person rows (title, Phone 1 best, Phone 2, company email). Company-domain emails only."""
import json, re, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from enrich import _domain, norm_url

PERSONAL = re.compile(r"@(gmail|yahoo|aol|hotmail|msn|me|icloud|outlook|live|bellsouth|comcast|verizon|earthlink|att|sbcglobal|mac|protonmail|cox|charter|optonline|juno)\.", re.I)
iaf = json.load(open("raw/simple_rows.json"))[1:]          # rows 2-39 (9 cols)
ven = json.load(open("raw/vendor_rows.json"))              # rows 41-73
cc = {x["sheet_row"]: x for x in json.load(open("data/company_contacts.json"))}
pp = {x["sheet_row"]: x for x in json.load(open("data/rocketreach_people_v2.json"))}
# emails Clearout found to bounce (mailbox not found); kept out of git like the other contact data
BOUNCED = set(json.load(open("data/bounced_emails.json"))) if os.path.exists("data/bounced_emails.json") else set()


def company_emails(s):
    out = []
    for e in re.split(r"[;,]\s*", s or ""):
        e = re.sub(r"\s*\(.*$", "", e).strip()
        if e and "@" in e and not PERSONAL.search(e) and e.lower() not in BOUNCED and e not in out:
            out.append(e)
    return out


def digits(s):
    """The 10-digit US number in a phone cell, ignoring the +1, punctuation and the (label)."""
    d = re.sub(r"\D", "", re.sub(r"\(.*$", "", s or ""))
    return d[-10:] if len(d) >= 10 else ""


def block(row, r):
    # r: 0 company,1 dealer,2 loc,3 people(listing),4 city,5 sells,6 website,7 email,8 notes
    c = cc.get(row, {})
    site = c.get("website") or r[6] or ""
    dom = _domain(norm_url(site)) if site else ""
    cem = company_emails(c.get("company_email", "")) or company_emails(r[7])
    comp = [r[0], "Company", c.get("main_phone", ""), c.get("phone_2", ""), cem[0] if cem else "", cem[1] if len(cem) > 1 else "",
            r[1], r[2], r[5], site, r[4], r[8]]
    rows = [comp]
    company_lines = {digits(comp[2]), digits(comp[3])} - {""}
    for p in (pp.get(row, {}).get("people") or [])[:2]:
        ems = company_emails(p.get("company_email", "")) + company_emails(p.get("company_email_2", ""))
        ems = list(dict.fromkeys(ems))
        # a person's number that is just the company main line is dropped; the other number moves up
        phones = [x for x in (p.get("phone_1", ""), p.get("phone_2", "")) if x and digits(x) not in company_lines]
        phones += [""] * (2 - len(phones))
        rows.append(["      ↳ " + p.get("name", ""), p.get("title", ""), phones[0], phones[1],
                     ems[0] if ems else "", ems[1] if len(ems) > 1 else "", "", "", "", "", "", ""])
    return rows


HEAD = ["Company / Contact", "Role", "Phone 1 (best)", "Phone 2", "Email (company)", "Email 2 (company)", "Security Dealer?",
        "Miami-Dade Locations", "What They Sell", "Website", "Main Office City", "Notes"]
grid = [HEAD, ["IAF MEMBERS"] + [""] * 11]
kinds = ["header", "section"]
for i, r in enumerate(iaf, 2):
    for j, x in enumerate(block(i, r)):
        grid.append(x); kinds.append("company" if j == 0 else "person")
grid.append([""] * 12); kinds.append("blank")
grid.append(["Company (NON MEMBER ASSOCATION)"] + [""] * 11); kinds.append("section")
for i, r in enumerate(ven, 41):
    for j, x in enumerate(block(i, r)):
        grid.append(x); kinds.append("company" if j == 0 else "person")
for row in grid:
    for k, v in enumerate(row):
        if isinstance(v, str) and v and v[0] in "+=-@":
            row[k] = "'" + v
json.dump({"grid": grid, "kinds": kinds}, open("data/sectioned_grid.json", "w"))
from collections import Counter
print(len(grid), Counter(kinds))
