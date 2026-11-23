"""Map a Clearout bulk-verification result file (CSV/XLSX) back onto the sectioned sheet.
Usage: python3 tools/clearout_apply.py <result file>
Writes out/email_checks.json: {row_number: {"E": status, "F": status, "summary": text}}"""
import sys, json, csv, os, re
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = sys.argv[1]
rows = []
if src.endswith(".xlsx"):
    from openpyxl import load_workbook
    ws = load_workbook(src, read_only=True).active
    it = ws.iter_rows(values_only=True)
    head = [str(h or "").strip() for h in next(it)]
    rows = [dict(zip(head, r)) for r in it]
else:
    with open(src, newline="", encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))
print("columns:", list(rows[0].keys()) if rows else None)
def pick(r, *names):
    for n in names:
        for k in r:
            if k and k.strip().lower() == n: return r[k]
    return None
res = {}
for r in rows:
    e = (pick(r, "email", "email address") or "").strip().lower()
    st = (pick(r, "clearout email status", "status", "email status") or "").strip()
    sub = (pick(r, "clearout email sub status", "sub status", "sub_status") or "").strip()
    safe = (pick(r, "clearout safe to send", "safe to send", "safe_to_send") or "")
    if e: res[e] = {"status": st, "sub": sub, "safe": str(safe)}
cells = json.load(open(os.path.join(HERE, "out", "email_cells.json")))
missing = [e for e in cells if e not in res]
print("results", len(res), "missing", missing)
json.dump(res, open(os.path.join(HERE, "out", "clearout_results.json"), "w"), indent=1)
from collections import Counter
print(Counter(v["status"] for v in res.values()))
print(Counter((v["status"], v["sub"]) for v in res.values()).most_common(20))
