"""Free phone check: parse every number in the sectioned grid (columns C/D) with Google's libphonenumber
(pip install phonenumbers), confirm it is a valid number, label where it is from by area code, and flag
people whose number is the company main line. Writes out/phone_checks.json and out/phone_check_col.json.
It cannot tell whether a valid number has been disconnected; that needs a paid carrier lookup."""
import json, os, re
import phonenumbers
from phonenumbers import geocoder

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
g = json.load(open(os.path.join(HERE, "data", "sectioned_grid.json")))
grid, kinds = g["grid"], g["kinds"]
DADE, BRO, PB = {"305", "786", "645"}, {"954", "754"}, {"561"}
TF = {"800", "833", "844", "855", "866", "877", "888"}
ABBR = {"SC": "South Carolina", "TN": "Tennessee", "PA": "Pennsylvania", "NY": "New York", "MI": "Michigan"}


def where(e164, loc, region):
    ac = e164[2:5]
    if ac in TF: return "Toll-free"
    if ac in DADE: return f"Miami-Dade ({ac})"
    if ac in BRO: return f"Broward ({ac})"
    if ac in PB: return f"Palm Beach ({ac})"
    if loc.endswith(", FL") or loc == "Florida": return f"Florida ({ac})"
    if region == "PR": return f"Puerto Rico ({ac}) - out of state"
    if region == "CA": return f"Canada ({ac}) - out of state"
    st = loc.split(", ")[-1] if ", " in loc else loc
    return f"{ABBR.get(st, st)} ({ac}) - out of state"


res, out, company_nums, bad = {}, ["Phone check"], set(), []
for i, (r, k) in enumerate(zip(grid, kinds), start=1):
    if k == "header": continue
    if k not in ("company", "person"): out.append(""); continue
    parts = []
    nums_here = {}
    for c, lab in (("C", "Phone 1"), ("D", "Phone 2")):
        v = (r[2 if c == "C" else 3] or "").lstrip("'")
        if not v: continue
        m = next(iter(phonenumbers.PhoneNumberMatcher(v, "US")), None)
        if not m: bad.append((f"{c}{i}", v)); continue
        n = m.number
        e164 = phonenumbers.format_number(n, phonenumbers.PhoneNumberFormat.E164)
        if not phonenumbers.is_valid_number(n): bad.append((f"{c}{i}", v))
        loc, region = geocoder.description_for_number(n, "en"), phonenumbers.region_code_for_number(n)
        res[f"{c}{i}"] = [e164, phonenumbers.is_valid_number(n), loc, region]
        nums_here[c] = e164
        s = f"{lab}: " + where(e164, loc, region)
        if k == "person" and e164 in company_nums: s += ", same as company main line"
        parts.append(s)
    if k == "company": company_nums = set(nums_here.values())
    out.append(" | ".join(parts))
json.dump(res, open(os.path.join(HERE, "out", "phone_checks.json"), "w"), indent=0)
json.dump(out, open(os.path.join(HERE, "out", "phone_check_col.json"), "w"))
print(len(res), "numbers;", len(bad), "invalid:", bad)
