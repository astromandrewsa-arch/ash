"""Upsert hiring entries into leadgen/data/hiring.json.
Usage: python3 hr_add.py entries.json   (file holds a JSON list of entry dicts, or {"top_picks":..,"notes":..})
Entries are keyed by heading+source_url. Miami-Dade entries sorted first."""
import json, sys, os, re
OUT = '/home/user/ash/leadgen/data/hiring.json'
FIELDS = ["heading","poc","role","contact_source","municipality","state","zip","website","email",
          "business_type","found","why","next_step","source_url","florida","miami_dade","roles","date_posted"]
PHONE = re.compile(r'\(?\b\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b')

def load():
    if os.path.exists(OUT):
        return json.load(open(OUT))
    return {"entries": [], "top_picks": [], "notes": ""}

def main(path):
    db = load()
    new = json.load(open(path))
    if isinstance(new, dict):
        for k in ("top_picks", "notes"):
            if k in new: db[k] = new[k]
        new = new.get("entries", [])
    idx = {(e["heading"], e["source_url"]): i for i, e in enumerate(db["entries"])}
    for e in new:
        rec = {f: e.get(f, "" if f not in ("florida","miami_dade","roles") else None) for f in FIELDS}
        rec["state"] = rec["state"] or "FL"
        if rec["roles"] is None: rec["roles"] = []
        if rec["florida"] is None: rec["florida"] = True
        if rec["miami_dade"] is None: rec["miami_dade"] = False
        blob = json.dumps(rec)
        if PHONE.search(blob):
            sys.exit(f"PHONE NUMBER PATTERN in entry {rec['heading']}: refusing")
        k = (rec["heading"], rec["source_url"])
        if k in idx: db["entries"][idx[k]] = rec
        else:
            idx[k] = len(db["entries"]); db["entries"].append(rec)
    db["entries"].sort(key=lambda r: (not r["miami_dade"], not r["florida"]))
    json.dump(db, open(OUT, "w"), indent=2, ensure_ascii=False)
    print(len(db["entries"]), "entries;", sum(r["miami_dade"] for r in db["entries"]), "Miami-Dade")

if __name__ == "__main__":
    main(sys.argv[1])
