"""Shared builders: record finalization, fit score, xlsx and docx writers."""
import re, datetime
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill
from openpyxl.utils import get_column_letter
from docx import Document
from docx.shared import Pt
from geo import municipality, preferred_zone, region, zip5

TODAY = datetime.date.today().isoformat()
COLUMNS = ["Name", "Point of Contact", "Contact Role", "Contact Source", "Municipality", "State", "Website", "Email",
           "Business Type", "Services Listed on Website", "Number of Locations", "ZIP Code", "Preferred Zone (Y/N)",
           "Fit Score", "Source URL"]
REGION_ORDER = {"Miami-Dade": 0, "Broward": 1, "Palm Beach": 2, "Other FL": 3, "Out of state": 4}


def services_string(en, extra_brands=()):
    """Short comma-separated services from the company's own site, plus brands carried."""
    if not en or not en.get("ok"):
        parts = []
    else:
        parts = list(en.get("services", []))
        v = en.get("verticals", [])
        if v:
            parts.append("serves " + "/".join(v))
    brands = sorted(set(extra_brands) | set((en or {}).get("brands", []) if en and en.get("ok") else set()),
                    key=str.lower)
    if brands:
        parts.append("brands: " + "/".join(brands))
    return ", ".join(parts) if parts else "?"


def locations_value(en):
    if not en or not en.get("ok"):
        return "?"
    c = en.get("locations_claim")
    if c and 1 <= c <= 50:
        return c
    n = en.get("locations") or 0
    return n if n >= 1 else "?"


def residential_only(services):
    s = services.lower()
    return "residential" in s and "commercial" not in s


def fit_score(rec):
    s = rec.get("Services Listed on Website", "") or ""
    low = s.lower()
    score = 0
    if "commercial" in low:
        score += 1
    if "cctv" in low or "video" in low or "camera" in low:
        score += 1
    if rec.get("Preferred Zone (Y/N)") == "Y":
        score += 1
    if rec.get("Business Type") == "Dealer/Integrator":
        score += 1
    loc = rec.get("Number of Locations")
    if isinstance(loc, int) and 1 <= loc <= 3:
        score += 1
    if residential_only(s) or "residential (only)" in low:
        score = min(score, 1)
    return max(score, 1) if rec.get("Business Type") == "Dealer/Integrator" else score


def pick_contact(listing_name, listing_url, en):
    """Listing contact first (role from the company's own site if the same person is named there with a role).
    Else a named person with a role on the company's own site. Else blank."""
    site = (en or {}).get("contacts", []) if en and en.get("ok") else []
    order = ["owner", "co-owner", "founder", "co-founder", "president", "ceo", "chief executive", "principal",
             "managing", "general manager", "vice president", "coo", "director", "sales manager", "account", "partner"]
    rank = lambda c: next((i for i, k in enumerate(order) if k in c["role"].lower()), 99)
    if listing_name:
        ln = norm_name(listing_name)
        for c in site:
            if norm_name(c["name"]) == ln or (ln.split()[0] == norm_name(c["name"]).split()[0] and ln.split()[-1] == norm_name(c["name"]).split()[-1]):
                return listing_name, c["role"], f"{listing_url} ; role: {c['url']}"
        return listing_name, "Listed contact", listing_url
    if site:
        c = sorted(site, key=rank)[0]
        if rank(c) < 99:
            return c["name"], c["role"], c["url"]
    return "", "", ""


def norm_name(n):
    n = re.sub(r"\b[A-Z]\.\s*", "", n or "")
    n = re.sub(r"[^A-Za-z \-']", "", n).strip().lower()
    return re.sub(r"\s+", " ", n)


def clean_name(n):
    n = re.sub(r"\s+", " ", (n or "").strip())
    if n.isupper() and len(n) > 4:
        small = {"OF", "AND", "THE", "FOR"}
        n = " ".join(w if w.strip(",.") in ("LLC", "INC", "CCTV", "USA", "ADT", "DMP", "IT", "AV", "LV", "FL", "FCS", "CMS", "AT&I") or len(w) <= 2 and w not in small
                     else w.capitalize() if w not in small else w.lower() for w in n.split())
    return n


def title_person(n):
    n = re.sub(r"\s+", " ", (n or "").strip())
    if n.isupper() or n.islower():
        n = " ".join(w.capitalize() if not re.fullmatch(r"[A-Z]\.?", w) else w for w in n.split())
        n = re.sub(r"\bMc([a-z])", lambda m: "Mc" + m.group(1).upper(), n)
    return n


def make_row(name, city, state, zipcode, website, email, btype, services, locations, contact, source_url,
             pz_texts=()):
    muni = municipality(city, zipcode, state)
    pz, why = preferred_zone(muni, *pz_texts)
    row = {
        "Name": clean_name(name), "Point of Contact": contact[0] or "", "Contact Role": contact[1] or "",
        "Contact Source": contact[2] or "", "Municipality": muni, "State": (state or "?").upper()[:2] or "?",
        "Website": website or "?", "Email": email or "?", "Business Type": btype, "Services Listed on Website": services,
        "Number of Locations": locations, "ZIP Code": zip5(zipcode) or "?", "Preferred Zone (Y/N)": pz,
        "Fit Score": 0, "Source URL": source_url,
    }
    apply_verified(row)
    row["Fit Score"] = fit_score(row)
    row["_region"] = region(row["ZIP Code"] if row["ZIP Code"] != "?" else zipcode, state, city)
    row["_pz_why"] = why
    return row


_VER = None
TYPE_OVERRIDE = {  # from the hand check of each company's own site (leadgen/data/verified_sites.json notes)
    "rd electric": "Other", "allied electrical services inc": "Other", "rrr electrical llc": "Other",
    "lsn international llc": "Other", "netsync network solutions inc miami beach fl": "Other",
    "tech security electronic inc": "Software/Vendor", "johnson controls - miami fire": "Software/Vendor",
    "arco security central station corp": "Monitoring Center", "brinks home - miami": "Monitoring Center",
}


def _verified():
    global _VER
    if _VER is None:
        import json, os
        from enrich import _domain, norm_url
        _VER = {}
        f = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "verified_sites.json")
        if os.path.exists(f):
            for name, v in json.load(open(f)).items():
                v = dict(v, _name=name)
                _VER[("n", norm_name(name))] = v
                if v.get("website"):
                    _VER[("d", _domain(norm_url(v["website"])))] = v
    return _VER


def apply_verified(row):
    """Overlay what a person-equivalent read of the company's own site found (leadgen/data/verified_sites.json)."""
    from enrich import _domain, norm_url
    V = _verified()
    if not V:
        return
    v = None
    if row.get("Website") not in ("?", ""):
        v = V.get(("d", _domain(norm_url(row["Website"]))))
    v = v or V.get(("n", norm_name(row["Name"])))
    if not v:
        return
    st = v.get("site_status", "ok")
    if st == "different company":
        row["Website"], row["Services Listed on Website"], row["Number of Locations"] = "?", "?", "?"
        if "role:" in row.get("Contact Source", "") or (row.get("Contact Source", "").startswith("http") and "myfloridalicense" not in row["Contact Source"] and "iaf-safe" not in row["Contact Source"]):
            pass
        return
    if st != "ok":
        return
    tov = TYPE_OVERRIDE.get(norm_name(v["_name"]))
    if tov:
        row["Business Type"] = tov
    # A contact our keyword extractor took from this company's own site is replaced by the hand-checked result
    cs = row.get("Contact Source", "")
    site_dom = _domain(norm_url(row["Website"])) if row.get("Website") not in ("?", "") else ""
    if row.get("Point of Contact") and site_dom and cs.startswith("http") and _domain(cs.split(" ;")[0]) == site_dom:
        if v.get("owner_name"):
            row["Point of Contact"], row["Contact Role"], row["Contact Source"] = v["owner_name"], v.get("owner_role") or "Listed contact", v.get("owner_source", "")
        else:
            row["Point of Contact"], row["Contact Role"], row["Contact Source"] = "", "", ""
    svc = [x.strip() for x in row.get("Services Listed on Website", "?").split(",") if x.strip() and x.strip() != "?"]
    svc = [x for x in svc if not x.startswith(("commercial", "residential", "CCTV"))]
    head = []
    if v.get("commercial"):
        head.append("commercial")
    if v.get("residential_only"):
        head.append("residential (only)")
    if v.get("cameras"):
        head.append("CCTV/video surveillance")
    rest = [x for x in svc if not x.startswith(("serves ", "brands:"))]
    tail = []
    if v.get("verticals"):
        tail.append("serves " + "/".join(v["verticals"]))
    brands = sorted(set(v.get("brands") or []) | set(sum([x[len("brands: "):].split("/") for x in svc if x.startswith("brands:")], [])), key=str.lower)
    if brands:
        tail.append("brands: " + "/".join(b for b in brands if b))
    row["Services Listed on Website"] = ", ".join(head + rest + tail) or "?"
    loc = v.get("locations")
    if isinstance(loc, int) and loc > 0:
        row["Number of Locations"] = loc
    if v.get("email") and row.get("Email") in ("?", ""):
        row["Email"] = v["email"]
    if row.get("ZIP Code") in ("?", "") and v.get("hq_zip"):
        row["ZIP Code"] = str(v["hq_zip"])[:5]
    owner = (v.get("owner_name") or "").strip()
    if owner:
        cur = row.get("Point of Contact", "")
        if not cur:
            row["Point of Contact"], row["Contact Role"], row["Contact Source"] = owner, v.get("owner_role") or "Listed contact", v.get("owner_source", "")
        elif norm_name(cur).split()[-1:] == norm_name(owner).split()[-1:] and norm_name(cur).split()[:1] == norm_name(owner).split()[:1]:
            if row.get("Contact Role") in ("Listed contact", "") or row.get("Contact Role", "").startswith("License holder"):
                row["Contact Source"] = (row.get("Contact Source") or "") + " ; role: " + v.get("owner_source", "")
                row["Contact Role"] = v.get("owner_role") or row["Contact Role"]
        row["_verified_owner"] = (owner, v.get("owner_role", ""), v.get("owner_source", ""))
    if v.get("notes"):
        row["_verified_notes"] = v["notes"]


def sort_rows(rows):
    return sorted(rows, key=lambda r: (REGION_ORDER.get(r.get("_region"), 9), -r["Fit Score"],
                                       0 if r["Preferred Zone (Y/N)"] == "Y" else 1, r["Name"].lower()))


def write_xlsx(path, line1, line2, line3, rows, extra_sections=None, sheet_title="Leads"):
    wb = Workbook()
    ws = wb.active
    ws.title = sheet_title
    write_sheet(ws, line1, line2, line3, rows)
    if extra_sections:
        r = ws.max_row + 3
        for title, headers, data in extra_sections:
            ws.cell(row=r, column=1, value=title).font = Font(bold=True, size=12)
            r += 1
            for j, h in enumerate(headers, 1):
                c = ws.cell(row=r, column=j, value=h)
                c.font = Font(bold=True)
                c.fill = PatternFill("solid", fgColor="DDDDDD")
            r += 1
            for d in data:
                for j, v in enumerate(d, 1):
                    ws.cell(row=r, column=j, value=v)
                r += 1
            r += 2
    wb.save(path)


def write_sheet(ws, line1, line2, line3, rows, columns=COLUMNS):
    ws.cell(row=1, column=1, value=line1).font = Font(bold=True, size=12)
    ws.cell(row=2, column=1, value=line2).font = Font(italic=True)
    ws.cell(row=3, column=1, value=line3)
    for j, h in enumerate(columns, 1):
        c = ws.cell(row=4, column=j, value=h)
        c.font = Font(bold=True, color="FFFFFF")
        c.fill = PatternFill("solid", fgColor="1F3864")
        c.alignment = Alignment(wrap_text=True, vertical="center")
    for i, r in enumerate(rows, 5):
        for j, h in enumerate(columns, 1):
            v = r.get(h, "")
            if isinstance(v, (list, tuple)):
                v = ", ".join(map(str, v))
            ws.cell(row=i, column=j, value=v)
    widths = {"Name": 34, "Point of Contact": 22, "Contact Role": 18, "Contact Source": 40, "Municipality": 20,
              "State": 6, "Website": 32, "Email": 28, "Business Type": 18, "Services Listed on Website": 60,
              "Number of Locations": 10, "ZIP Code": 9, "Preferred Zone (Y/N)": 10, "Fit Score": 8, "Source URL": 45,
              "Found In": 40, "Best Tier": 10, "Notes": 60}
    for j, h in enumerate(columns, 1):
        ws.column_dimensions[get_column_letter(j)].width = widths.get(h, 16)
    ws.freeze_panes = "B5"
    if rows:
        ws.auto_filter.ref = f"A4:{get_column_letter(len(columns))}{4 + len(rows)}"


def new_doc(title, intro_lines):
    d = Document()
    st = d.styles["Normal"]
    st.font.name = "Calibri"
    st.font.size = Pt(11)
    d.add_heading(title, 0)
    for l in intro_lines:
        d.add_paragraph(l)
    return d


def add_entry(d, heading, fields, level=2):
    d.add_heading(heading, level)
    for k, v in fields:
        p = d.add_paragraph(style="List Bullet")
        r = p.add_run(f"{k}: ")
        r.bold = True
        p.add_run(str(v) if v not in (None, "") else "?")


VENDOR_NAMES = re.compile(r"\b(ADI|Anixter|Wesco|Resideo|Alarm\.com|Napco|Digital Monitoring Products|Bosch|Honeywell|"
                          r"Interlogix|Johnson Controls|Tyco|Altronix|Axis Communications|Hanwha|Genetec|Avigilon|"
                          r"Milestone|Brivo|Telguard|AMAC|Napco|Potter|Notifier|Fire-Lite|Silent Knight|Mircom|"
                          r"Software|Billing|Insurance|Insur|Distribut|Supply|Wholesale|Manufactur|Bank|Financ|"
                          r"Capital|Funding|Lighthouse|SecureNet|Wittenbach|Kirschenbaum|Law|Attorney|P\.A\.)\b", re.I)
MONITOR_NAMES = re.compile(r"monitoring|central station|\bUCC\b|\bCOPS\b|Rapid Response|Affiliated|Security Central|"
                           r"Avantguard|Becklar|Dispatch Center|Monitoring Center", re.I)
GUARD_NAMES = re.compile(r"\bguard(s|ing)?\b|patrol|security officers|protective services", re.I)
CONSULT_NAMES = re.compile(r"consult|broker|engineering|engineers|design group|advisors?|appraisal", re.I)
ELECTRIC_NAMES = re.compile(r"electric(al)?\b|electrician", re.I)
GENERIC_CONTACT = re.compile(r"\badmin\b|\boffice\b|\binfo\b|\bsales\b|\bsupport\b|\bmanager\b$|\bdept\b|\bteam\b|"
                             r"^(n/?a|none|tbd)$", re.I)


def classify(name, en=None, default="Dealer/Integrator"):
    services = (en or {}).get("services", []) if en and en.get("ok") else []
    if MONITOR_NAMES.search(name):
        return "Monitoring Center"
    if GUARD_NAMES.search(name):
        return "Guard Company"
    if CONSULT_NAMES.search(name):
        return "Consultant/Broker"
    if VENDOR_NAMES.search(name):
        return "Software/Vendor"
    if ELECTRIC_NAMES.search(name) and "CCTV/video surveillance" not in services and "access control" not in services:
        return "Subcontractor"
    return default


def clean_contact(n):
    n = (n or "").strip()
    if not n or GENERIC_CONTACT.search(n) or len(n.split()) < 2:
        return ""
    return title_person(n)


DOC_FIELDS = [("Point of Contact", "poc"), ("Contact Role", "role"), ("Contact Source", "contact_source"),
              ("Municipality", "municipality"), ("State", "state"), ("ZIP Code", "zip"), ("Website", "website"),
              ("Email", "email"), ("Business Type", "business_type"), ("What they posted / what was found", "found"),
              ("Why this is interesting for IRIS", "why"), ("Suggested next step", "next_step"), ("Source URL", "source_url")]


def write_doc(path, title, intro_lines, groups, top_picks, outro_lines=()):
    """groups: list of (group_heading, [entry dicts]); entry needs 'heading' plus DOC_FIELDS keys.
    top_picks: list of (heading, one-line reason)."""
    d = new_doc(title, intro_lines)
    for grp in groups:
        gh, entries = grp[0], grp[1]
        note = grp[2] if len(grp) > 2 else ""
        if not entries and not note:
            continue
        d.add_heading(gh, 1)
        if note:
            p = d.add_paragraph()
            p.add_run(note).italic = True
        for e in entries:
            fields = []
            for label, key in DOC_FIELDS:
                v = e.get(key, "")
                if key in ("poc", "role", "contact_source") and not e.get("poc"):
                    v = "" if key != "poc" else "None named"
                if key == "role" and e.get("poc") and not v:
                    v = "Listed contact"
                fields.append((label, v if v not in (None, "") else ("?" if key not in ("role", "contact_source") else "")))
            add_entry(d, e["heading"], [(l, v) for l, v in fields if not (l in ("Contact Role", "Contact Source") and v == "")])
    d.add_heading("Top picks", 1)
    for i, (h, why) in enumerate(top_picks, 1):
        p = d.add_paragraph(style="List Number")
        r = p.add_run(h + ": ")
        r.bold = True
        p.add_run(why)
    for l in outro_lines:
        d.add_paragraph(l)
    d.save(path)
