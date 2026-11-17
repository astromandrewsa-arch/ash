"""Helper: write a list of records (dicts) to leadgen/data/mfr_<slug>.json with all schema keys, rejecting phone numbers."""
import json, re, sys
KEYS = ["name","brand","listing_level","address","city","state","zip","website","email","contact_name","contact_role",
        "contact_source","services_on_listing","service_area","listing_url","query","notes"]
PHONE = re.compile(r'\(?\b\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b')
def save(slug, records):
    out = []
    for r in records:
        rec = {k: str(r.get(k, '') or '') for k in KEYS}
        for k, v in rec.items():
            if PHONE.search(v): raise SystemExit(f'phone-like text in {k}: {v}')
        out.append(rec)
    path = f'/home/user/ash/leadgen/data/mfr_{slug}.json'
    with open(path, 'w') as f: json.dump(out, f, indent=2, ensure_ascii=False)
    print('wrote', len(out), path)
