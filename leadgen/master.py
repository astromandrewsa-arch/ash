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
KEEP_TYPES = {"Dealer/Integrator", "Subcontractor", "Monitoring Center", "Guard Company", "Consultant/Broker"}
TIER_NAME = {1: "T1", 2: "T2", 3: "T3"}
SUFFIX = re.compile(r"\s*-\s*(miami|doral|hialeah|fort lauderdale|ft lauderdale|west palm beach|boca raton|plantation|miramar)\b.*$", re.I)


def keys_for(row):
    ks = set()
    site = row.get("Website", "?")
    if site not in ("?", ""):
        d = _domain(norm_url(site))
        if d and not any(d.endswith(g) for g in ("pages.dev", "google.com", "facebook.com", "wixsite.com", "business.site", "convergint.com", "pyebarkerfs.com")):
            ks.add(("d", d))
    name = row["Name"]
    parts = re.split(r"\b(?:dba|d/b/a|now)\b", name, flags=re.I)
    for p in parts:
        k = norm_key(SUFFIX.sub("", p))
        if len(k) >= 6:
            ks.add(("n", k))
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
                    for (t, k), g in idx.items():
                        if t == "n" and len(k.split()) >= 3 and (k.startswith(nk) or nk.startswith(k)) and groups[g][0].get("_region") == r.get("_region"):
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
        g.sort(key=lambda r: (r["_tier"], REGION_ORDER.get(r.get("_region"), 9), -r["Fit Score"]))
        m = {c: g[0].get(c, "") for c in COLUMNS}
        for r in g[1:]:
            for c in COLUMNS:
                m[c] = better(m[c], r.get(c))
        # contact: prefer one with a stated role (not 'Listed contact'), else first named
        named = [r for r in g if r.get("Point of Contact")]
        if named:
            pick = next((r for r in named if r.get("Contact Role") not in ("Listed contact", "") and "License holder" not in r.get("Contact Role", "")), named[0])
            m["Point of Contact"], m["Contact Role"], m["Contact Source"] = pick["Point of Contact"], pick["Contact Role"], pick["Contact Source"]
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


if __name__ == "__main__":
    rows, loaded = main()
    json.dump(rows, open("data/out_master.json", "w"), indent=1)
    print(len(rows), loaded, Counter(r["Best Tier"] for r in rows), Counter(r["_region"] for r in rows))
    for r in rows[:25]:
        print(r["Best Tier"], r["Fit Score"], r["Name"], "|", r["Municipality"], "|", r["Found In"])
