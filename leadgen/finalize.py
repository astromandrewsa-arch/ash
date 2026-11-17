"""Rebuild every output from leadgen/data and write leads/Master.xlsx (Master + Summary)."""
import json, os, re, subprocess, sys
sys.path.insert(0, ".")
STEPS = ["iaf_out.py", "mfr_out.py --write", "tma_dir_out.py", "ax_out.py", "lic_out.py", "hiring_out.py", "pb_out.py", "how_out.py"]
if "--skip-rebuild" not in sys.argv:
    for s in STEPS:
        f = s.split()[0]
        need = {"pb_out.py": "data/permits_bids.json", "how_out.py": "data/houses_of_worship.json"}.get(f)
        if need and not os.path.exists(need):
            print("skip", s); continue
        r = subprocess.run([sys.executable] + s.split(), capture_output=True, text=True)
        print(s, "->", (r.stdout.strip().splitlines() or [""])[-1], r.stderr[-300:] if r.returncode else "")
import master
from build import *

FILES = [("leads/T1_IAF_Members.xlsx", "data/out_iaf.json"), ("leads/T1_TMA_Members.xlsx", "data/out_tma.json"),
         ("leads/T2_Manufacturer_Dealers.xlsx", "data/out_mfr.json"), ("docs/T2_Alarm_Exchange.docx", None),
         ("leads/T3_Directories.xlsx", "data/out_dir.json"), ("leads/T3_Licenses.xlsx", "data/out_lic.json"),
         ("docs/T3_Permits_and_Bids.docx", None), ("docs/T3_Hiring.docx", "data/out_hiring.json"),
         ("leads/Segment_Houses_of_Worship.xlsx", "data/out_how.json")]


def counts():
    out = []
    for f, j in FILES:
        if f.endswith("Alarm_Exchange.docx"):
            d = json.load(open("data/alarm_exchange.json"))
            es = [e for c in d["categories"] for e in c["entries"]]
            out.append((f, len(es), sum(1 for e in es if e.get("miami_dade"))))
        elif f.endswith("Permits_and_Bids.docx"):
            if os.path.exists("data/permits_bids.json"):
                d = json.load(open("data/permits_bids.json"))
                rows = json.load(open("data/out_pb.json"))
                out.append((f, f"{len(d['contractor_summaries'])} contractors + {len(d['bids'])} bid awards", sum(1 for r in rows if r['_region'] == 'Miami-Dade')))
        elif f.endswith("Hiring.docx"):
            d = json.load(open("data/hiring.json"))
            out.append((f, len(d["entries"]), sum(1 for e in d["entries"] if e.get("miami_dade"))))
        elif j and os.path.exists(j):
            rows = json.load(open(j))
            out.append((f, len(rows), sum(1 for r in rows if r.get("_region") == "Miami-Dade" or r.get("Municipality") in ("Miami Beach",))))
    return out


FAILURES = json.load(open("data/failures.json"))

rows, loaded = master.main()
loaded = {k.replace("T", "leads/T", 1) if k.endswith(".xlsx") else "docs/" + k: v for k, v in loaded.items()}
BAD = ("parent company", "rapidsos", "fire-only", "fire only", "fire-alarm only", "not a security", "different business",
       "not a local dealer", "residential only", "not miami-dade", "hq is in broward", "not a miami company", "new jersey company", "not owner-run", "not a camera dealer", "not a dealer")
cands = [r for r in rows if r["Business Type"] == "Dealer/Integrator" and r["_region"] == "Miami-Dade"
         and ("cctv" in r["Services Listed on Website"].lower() or "camera" in r["Services Listed on Website"].lower())
         and not any(b in (r.get("_notes") or "").lower() for b in BAD)
         and not re.search(r"everon|securitas|convergint|johnson controls|\badt\b|pye-barker|kastle|pavion|allied universal|brinks|vivint|wachter|titan security|siemens|honeywell", r["Name"], re.I)]
tnum = {"T1": 1, "T2": 2, "T3": 3}
cands.sort(key=lambda r: (-(r["Fit Score"] + 3 - tnum[r["Best Tier"]]), 0 if r["Point of Contact"] else 1, -r["_n_sources"], r["Best Tier"]))
top = [(r, master.reason(r) + ((" | note: " + r["_notes"][:160]) if r.get("_notes") else "")) for r in cands[:20]]
json.dump(rows, open("data/out_master.json", "w"), indent=1)
master.write_master(rows, loaded, top, FAILURES, counts())
print("master", len(rows), "top", len(top))
for r, why in top[:20]:
    print(r["Best Tier"], r["Fit Score"], r["Name"], "|", r["Municipality"], "|", r["Point of Contact"], "|", why[:120])
