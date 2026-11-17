"""Turn agent records (SCHEMA.md shape) or doc entries into output rows with enrichment and scoring."""
import json, re, sys
sys.path.insert(0, ".")
from build import *
from enrich import enrich, norm_url, _domain


def rows_from_records(recs, default_type="Dealer/Integrator", source_key="listing_url", extra_brands=None):
    rows = []
    for r in recs:
        site = norm_url(r.get("website", "")) if r.get("website") not in (None, "", "?") else ""
        en = enrich(site) if site else None
        lc = clean_contact(r.get("contact_name", ""))
        contact = pick_contact(lc, r.get("contact_source") or r.get(source_key, ""), en)
        if lc and r.get("contact_role") and contact[1] == "Listed contact":
            contact = (contact[0], r["contact_role"], contact[2])
        email = r.get("email") or (((en or {}).get("emails") or ["?"])[0] if en and en.get("ok") else "?")
        services = services_string(en, extra_brands=(extra_brands or []))
        if services == "?" and r.get("services_on_listing"):
            services = "(per listing) " + r["services_on_listing"][:200]
        btype = r.get("business_type") or classify(r.get("name", ""), en, default_type)
        pz = [" ".join((en or {}).get("pz_mentions", [])) if en and en.get("ok") else "", r.get("service_area", ""),
              r.get("services_on_listing", "")]
        row = make_row(r.get("name", ""), r.get("city", ""), r.get("state") or "FL", r.get("zip", ""), site or "?",
                       email or "?", btype, services, locations_value(en), contact, r.get(source_key, ""), pz)
        row["_raw"] = r
        rows.append(row)
    return rows


def rows_from_doc_entries(entries, source_label):
    """Doc entries (heading, poc, role, contact_source, municipality, state, zip, website, email, business_type, source_url)."""
    rows = []
    for e in entries:
        site = e.get("website") if e.get("website") not in (None, "", "?") else ""
        site = norm_url(site) if site else ""
        en = enrich(site) if site else None
        poc = clean_contact(e.get("poc", ""))
        contact = (poc, e.get("role") or ("Listed contact" if poc else ""), e.get("contact_source", "") if poc else "")
        if not poc:
            contact = pick_contact("", "", en)
        email = e.get("email") if e.get("email") not in (None, "", "?") else (((en or {}).get("emails") or ["?"])[0] if en and en.get("ok") else "?")
        services = services_string(en)
        pz = [" ".join((en or {}).get("pz_mentions", [])) if en and en.get("ok") else "", e.get("found", "")[:600]]
        city = e.get("municipality") if e.get("municipality") not in (None, "?") else ""
        name = re.sub(r"\s*\((?:company for sale|seeking|for sale)[^)]*\)", "", e.get("heading", "")).strip()
        row = make_row(name, city, e.get("state") if e.get("state") not in (None, "?", "") else "FL", e.get("zip", ""),
                       site or "?", email or "?", e.get("business_type") or classify(name, en), services,
                       locations_value(en), contact, e.get("source_url", ""), pz)
        if not city:
            row["Municipality"] = "?"
        row["_doc"] = source_label
        rows.append(row)
    return rows
