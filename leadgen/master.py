import json, re, os, sys
from collections import OrderedDict, Counter
sys.path.insert(0, ".")
from build import *
from enrich import _domain, norm_url
from mfr_out import norm_key
from openpyxl import Workbook

SOURCES = [  # (label, out json, tier)
    ("T1_IAF_Members.xlsx", "data/out_iaf.json", 1),
    ("T1_TMA_Members.xlsx", "data/out_tma.json", 1),
    ("T2_Manufacturer_Dealers.xlsx", "data/out_mfr.json", 2),
    ("T2_Alarm_Exchange.docx", "data/out_ax.json", 2),
    ("T3_Directories.xlsx", "data/out_dir.json", 3),
    ("T3_Licenses.xlsx", "data/out_lic.json", 3),
    ("T3_Permits_and_Bids.docx", "data/out_pb.json", 3),
    ("T3_Hiring.docx", "data/out_hiring.json", 3),
]
MANUAL_NOTES = {
    "aps security": "IAF Past President and South Region (Miami-Dade/Broward) director Diego R. del Pino is with APS Security (iaf-safe.org/directors.php).",
    "at&i": "AT&I says it is one of 11 companies selected for the Broward Sheriff's Office Real-Time Crime Center program (own site) - directly relevant to IRIS; Verkada Platinum partner.",
    "omni data": "Now owned by RapidSOS (911 data company) per its own site - possible competitor channel; approach carefully.",
    "thunder electrical": "Company of IAF Director-Electrical Fernando Munilla (iaf-safe.org/directors.php).",
}
KEEP_TYPES = {"Dealer/Integrator", "Subcontractor", "Monitoring Center", "Guard Company", "Consultant/Broker"}
TIER_NAME = {1: "T1", 2: "T2", 3: "T3"}
SUFFIX = re.compile(r"\s*-\s*(miami|doral|hialeah|fort lauderdale|ft lauderdale|west palm beach|boca raton|plantation|miramar)\b.*$", re.I)


def keys_for(row):
    ks = set()
    site = row.get("Website", "?")
    if site not in ("?", ""):
        d = _domain(norm_url(site))
        if d and not any(d.endswith(g) for g in ("pages.dev", "google.com", "facebook.com", "wixsite.com", "business.site", "convergint.com", "pyebarkerfs.com")):
            ks.add(("d", d, row.get("_region")))
    name = row["Name"]
    parts = re.split(r"\b(?:dba|d/b/a|now)\b", name, flags=re.I)
    for p in parts:
        k = norm_key(SUFFIX.sub("", p))
        if len(k) >= 6:
            ks.add(("n", k, row.get("_region")))
    return ks


def better(a, b):
    return b if a in (None, "", "?") else a


def main():
    groups, idx = [], {}
    loaded = Counter()
    for label, f, tier in SOURCES:
        if not os.path.exists(f):
            continue
        for r in json.load(open(f)):
            if r.get("_region") == "Out of state" or r.get("Business Type") not in KEEP_TYPES:
                continue
            if r.get("State", "FL") not in ("FL", "?"):
                continue
            loaded[label] += 1
            ks = keys_for(r)
            gid = next((idx[k] for k in ks if k in idx), None)
            if gid is None:
                # loose name containment within same region (e.g. "X Inc" vs "X (CTC#470)")
                nk = norm_key(SUFFIX.sub("", r["Name"]))
                if len(nk.split()) >= 3:
                    for key, g in idx.items():
                        t, k = key[0], key[1]
                        if t == "n" and len(k.split()) >= 3 and (k.startswith(nk) or nk.startswith(k)) and key[2] == r.get("_region"):
                            gid = g
                            break
            if gid is None:
                gid = len(groups)
                groups.append([])
            groups[gid].append(dict(r, _label=label, _tier=tier))
            for k in ks:
                idx.setdefault(k, gid)
    rows = []
    for g in groups:
        g.sort(key=lambda r: (REGION_ORDER.get(r.get("_region"), 9), r["_tier"], -r["Fit Score"]))
        m = {c: g[0].get(c, "") for c in COLUMNS}
        for r in g[1:]:
            for c in COLUMNS:
                m[c] = better(m[c], r.get(c))
        # contact: prefer one with a stated role (not 'Listed contact'), else first named
        named = [r for r in g if r.get("Point of Contact")]
        if named:
            pick = next((r for r in named if r.get("Contact Role") not in ("Listed contact", "") and "License holder" not in r.get("Contact Role", "")), named[0])
            m["Point of Contact"], m["Contact Role"], m["Contact Source"] = pick["Point of Contact"], pick["Contact Role"], pick["Contact Source"]
        vo = next((r["_verified_owner"] for r in g if r.get("_verified_owner")), None)
        if vo and (not m["Point of Contact"] or m["Contact Role"] in ("Listed contact", "") or m["Contact Role"].startswith("License holder")):
            if not m["Point of Contact"] or norm_name(m["Point of Contact"]) != norm_name(vo[0]):
                m["Point of Contact"], m["Contact Role"], m["Contact Source"] = vo
        m["_notes"] = next((r["_verified_notes"] for r in g if r.get("_verified_notes")), "")
        for key, note in MANUAL_NOTES.items():
            if key in m["Name"].lower():
                m["_notes"] = (note + " " + m["_notes"]).strip()
        # merge services: longest real one
        svc = [r["Services Listed on Website"] for r in g if r.get("Services Listed on Website") not in ("?", "")]
        if svc:
            m["Services Listed on Website"] = max(svc, key=len)
        if any(r.get("Preferred Zone (Y/N)") == "Y" for r in g):
            m["Preferred Zone (Y/N)"] = "Y"
        m["Fit Score"] = fit_score(m)
        m["Found In"] = ", ".join(OrderedDict.fromkeys(r["_label"] for r in g))
        m["Best Tier"] = TIER_NAME[min(r["_tier"] for r in g)]
        m["Source URL"] = " ; ".join(OrderedDict.fromkeys(r["Source URL"] for r in g if r.get("Source URL")))[:1000]
        m["_region"] = g[0].get("_region")
        m["_n_sources"] = len(set(r["_label"] for r in g))
        m["_brands"] = sorted({b for r in g for b in r.get("_brands", [])})
        rows.append(m)
    rows.sort(key=lambda r: (r["Best Tier"], -r["Fit Score"], REGION_ORDER.get(r["_region"], 9), -r["_n_sources"], r["Name"].lower()))
    return rows, loaded


def reason(r):
    bits = []
    bits.append(r["Found In"].replace(".xlsx", "").replace(".docx", ""))
    if r["_brands"]:
        bits.append("brands: " + "/".join(r["_brands"]))
    s = r["Services Listed on Website"].lower()
    feats = [x for x, k in (("commercial", "commercial"), ("cameras", "cctv"), ("access control", "access control")) if k in s]
    if feats:
        bits.append(" + ".join(feats))
    bits.append(r["Municipality"])
    if r["Point of Contact"]:
        bits.append(f"contact: {r['Point of Contact']} ({r['Contact Role']})")
    return "; ".join(bits)


def write_master(rows, loaded, top, failures, counts):
    wb = Workbook()
    ws = wb.active
    ws.title = "Master"
    cols = COLUMNS + ["Found In", "Best Tier", "Notes"]
    for r in rows:
        r["Notes"] = (r.get("_notes") or "")[:400]
    md = sum(1 for r in rows if r["_region"] == "Miami-Dade")
    write_sheet(ws, f"MASTER - de-duplicated dealers/integrators from all IRIS lead files ({len(rows)} companies; {md} in Miami-Dade). Built from leads/*.xlsx and docs/*.docx in this folder.",
                "Tiers: T1 = trade-association members (IAF, TMA; super top priority); T2 = warm (manufacturer dealer locators, Alarm Exchange); T3 = cold (directories, DBPR licenses, permits/bids, hiring). Best Tier = warmest file the company appears in. Sorted by Best Tier, then Fit Score (then Miami-Dade first).",
                f"Date collected: {TODAY}. Florida only; vendors, associations, end users and out-of-state firms are left out (they stay in their source files). Values merged across files: first non-blank value from the warmest source; named person with a stated role preferred.",
                rows, columns=cols)
    s2 = wb.create_sheet("Summary")
    r = 1
    def put(row, vals, bold=False):
        for j, v in enumerate(vals, 1):
            c = s2.cell(row=row, column=j, value=v)
            if bold:
                c.font = Font(bold=True)
    put(r, ["IRIS Miami-Dade dealer leads - summary", "", f"Date: {TODAY}"], True); r += 2
    put(r, ["ENTRY COUNTS PER FILE"], True); r += 1
    put(r, ["File", "Entries in file", "Of which Miami-Dade", "Rows feeding Master"], True); r += 1
    for f, n, nmd in counts:
        put(r, [f, n, nmd, loaded.get(f, "-")]); r += 1
    put(r, ["leads/Master.xlsx", len(rows), md, ""]); r += 2
    put(r, ["TOP 20 MASTER LEADS"], True); r += 1
    put(r, ["#", "Name", "Municipality", "Best Tier", "Fit Score", "Point of Contact", "Why (one line)"], True); r += 1
    for i, (t, why) in enumerate(top, 1):
        put(r, [i, t["Name"], t["Municipality"], t["Best Tier"], t["Fit Score"], (t["Point of Contact"] + (" (" + t["Contact Role"] + ")" if t["Contact Role"] else "")) if t["Point of Contact"] else "", why]); r += 1
    r += 1
    put(r, ["SOURCES THAT FAILED OR NEED MANUAL WORK"], True); r += 1
    put(r, ["Source", "URL", "Problem", "What to do by hand"], True); r += 1
    for x in failures:
        put(r, list(x)); r += 1
    for j, w in enumerate([8, 40, 22, 40, 10, 30, 110], 1):
        s2.column_dimensions[get_column_letter(j)].width = w
    s2.column_dimensions["A"].width = 34
    wb.save("../leads/Master.xlsx")


if __name__ == "__main__":
    rows, loaded = main()
    json.dump(rows, open("data/out_master.json", "w"), indent=1)
    print(len(rows), loaded, Counter(r["Best Tier"] for r in rows), Counter(r["_region"] for r in rows))
    for r in rows[:25]:
        print(r["Best Tier"], r["Fit Score"], r["Name"], "|", r["Municipality"], "|", r["Found In"])
