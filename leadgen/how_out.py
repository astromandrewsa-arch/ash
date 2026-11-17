import json, re, sys
sys.path.insert(0, ".")
from build import *
from enrich import norm_url
h = json.load(open("data/houses_of_worship.json"))
rows = []
for x in h:
    svc = "; ".join(v for v in [x.get("denomination") and f"{x['denomination']} " + ("synagogue/center" if x.get("business_type") == "House of Worship" else "school"),
                                x.get("size_signal") and f"size: {x['size_signal']}",
                                x.get("security_notes") and f"security: {x['security_notes']}"] if v) or "?"
    poc = clean_contact(re.sub(r"^(Rabbi|Rebbetzin|Cantor|Dr\.?|Mrs?\.?|Ms\.?)\s+", "", x.get("poc", "") or "")) and (x.get("poc") or "")
    role = re.split(r"\s*\(", x.get("poc_role", "") or "")[0] if poc else ""
    city = x.get("municipality_hint") or ""
    row = make_row(x["name"], city, "FL", x.get("zip", ""), norm_url(x.get("website", "")) if x.get("website") not in (None, "", "?") else "?",
                   x.get("email") if x.get("email") not in (None, "", "?") else "?", x.get("business_type") or "House of Worship",
                   svc, "?", (poc, role or ("Listed contact" if poc else ""), x.get("poc_source", "") if poc else ""),
                   x.get("source_url", ""), [])
    row["Municipality"] = city or row["Municipality"]
    rows.append(row)
mb = lambda r: 0 if r["Municipality"] == "Miami Beach" else 1
rows = sorted(rows, key=lambda r: (mb(r), r["Municipality"], r["Business Type"], r["Name"].lower()))
n_mb = sum(1 for r in rows if r["Municipality"] == "Miami Beach")
write_xlsx("../leads/Segment_Houses_of_Worship.xlsx",
           f"SEGMENT - synagogues and Jewish day schools in Miami-Dade ({len(rows)} institutions; {n_mb} in Miami Beach). Sources: each institution's own website plus public directories (Greater Miami Jewish Federation, Chabad.org, URJ, USCJ, OU, Florida DOE private-school data) - per-row Source URL.",
           "Warmth: SEGMENT LIST FOR DEALERS - DO NOT CONTACT. End-customer buildings for dealers to target later with IRIS (high-security sites with existing cameras). 'Services Listed on Website' holds denomination, size and any published security notes instead of dealer services. Fit Score uses the dealer rubric, so it mostly reflects the preferred zone.",
           f"Date collected: {TODAY}. Miami Beach first, then by municipality.", rows, sheet_title="Houses of Worship")
json.dump(rows, open("data/out_how.json", "w"), indent=1)
print("how", len(rows), n_mb)
