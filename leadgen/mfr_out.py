import json, glob, re, sys
from collections import defaultdict, OrderedDict
sys.path.insert(0, ".")
from build import *
from enrich import enrich, norm_url, _domain
from geo import region

SHORT = [("alarm.com", "Alarm.com"), ("resideo", "Resideo/Honeywell"), ("honeywell", "Resideo/Honeywell"),
         ("adt", "ADT"), ("brinks", "Brinks Home"), ("becklar", "Becklar"), ("vivint", "Vivint"), ("qolsys", "Qolsys"),
         ("verkada", "Verkada"), ("avigilon alta", "Avigilon Alta"), ("openpath", "Avigilon Alta"), ("avigilon", "Avigilon"),
         ("hanwha", "Hanwha Vision"), ("axis", "Axis"), ("eagle eye", "Eagle Eye Networks"), ("genetec", "Genetec"),
         ("milestone", "Milestone"), ("rhombus", "Rhombus"), ("brivo", "Brivo"), ("dmp", "DMP"), ("digital monitoring", "DMP"),
         ("bosch", "Bosch"), ("napco", "Napco")]


def short_brand(b):
    l = (b or "").lower()
    for k, v in SHORT:
        if k in l:
            return v
    return b


def norm_key(name):
    n = (name or "").lower()
    n = re.sub(r"\(.*?\)", "", n)
    n = re.sub(r"\b(inc|llc|corp|corporation|co|company|the|of|ltd|l\.l\.c|p\.a|dba)\b\.?", " ", n)
    n = re.sub(r"[^a-z0-9]+", " ", n)
    return re.sub(r"\s+", " ", n).strip()


GENERIC_DOMAINS = {"pages.dev", "google.com", "facebook.com", "linkedin.com", "yelp.com", "mapquest.com", "bbb.org",
                   "instagram.com", "wixsite.com", "business.site"}


def load():
    recs = []
    for f in sorted(glob.glob("data/mfr_*.json")):
        try:
            recs += json.load(open(f))
        except Exception as e:
            print("skip", f, e)
    return recs


def group(recs):
    groups = OrderedDict()
    alias = {}
    for r in recs:
        dom = _domain(norm_url(r.get("website", ""))) if r.get("website") else ""
        k_name = norm_key(r.get("name"))
        k_dom = dom if dom and not any(dom.endswith(g) for g in GENERIC_DOMAINS) else ""
        # national firms with several branches: keep branches separate by ZIP
        key = None
        for k in ([("d", k_dom, r.get("zip", "")[:5])] if k_dom else []) + [("n", k_name, r.get("zip", "")[:5])]:
            if k in alias:
                key = alias[k]
                break
        if key is None:
            key = len(groups)
            groups[key] = []
        if k_dom:
            alias[("d", k_dom, r.get("zip", "")[:5])] = key
        alias[("n", k_name, r.get("zip", "")[:5])] = key
        groups[key].append(r)
    return list(groups.values())


def main():
    recs = load()
    rows, detail = [], []
    for g in group(recs):
        first = max(g, key=lambda r: (bool(r.get("zip")), bool(r.get("website")), len(r.get("address", ""))))
        brands = sorted({short_brand(r.get("brand")) for r in g})
        levels = sorted({f"{short_brand(r.get('brand'))}: {r.get('listing_level')}" for r in g if r.get("listing_level")})
        site = next((norm_url(r["website"]) for r in g if r.get("website")), "")
        en = enrich(site) if site else None
        lc = next((r for r in g if r.get("contact_name")), None)
        contact = pick_contact(clean_contact(lc["contact_name"]) if lc else "", lc.get("contact_source") or lc.get("listing_url") if lc else "", en)
        if lc and lc.get("contact_role") and contact[1] == "Listed contact":
            contact = (contact[0], lc["contact_role"], contact[2])
        email = next((r["email"] for r in g if r.get("email")), "") or ((en or {}).get("emails") or ["?"])[0] if (en and en.get("ok")) or any(r.get("email") for r in g) else "?"
        services = services_string(en, extra_brands=brands)
        listing_services = "; ".join(sorted({r.get("services_on_listing", "") for r in g if r.get("services_on_listing")}))
        if services == "?" or not (en and en.get("ok")):
            # fall back to what the brand/dealer listing itself says
            services = ((listing_services[:200] + "; ") if listing_services else "") + "brands: " + "/".join(brands)
        pz_texts = [" ".join((en or {}).get("pz_mentions", [])) if en and en.get("ok") else ""] + [r.get("service_area", "") for r in g] + [listing_services]
        btype = next((r["business_type"] for r in g if r.get("business_type")), None) or classify(first["name"], en)
        srcs = list(OrderedDict.fromkeys(r.get("listing_url", "") for r in g if r.get("listing_url")))
        row = make_row(first["name"], first.get("city"), first.get("state") or "FL", first.get("zip"), site or "?",
                       email or "?", btype, services, locations_value(en), contact, " ; ".join(srcs[:3]), pz_texts)
        row["_brands"] = brands
        row["_levels"] = levels
        row["_self_declared"] = all("self-declared" in (r.get("listing_level", "") + r.get("notes", "")).lower() for r in g)
        rows.append(row)
        detail.append((row["Name"], ", ".join(brands), "; ".join(levels), "self-declared on dealer site" if row["_self_declared"] else "manufacturer locator",
                       row["Municipality"], " ; ".join(srcs)))
    rows = sort_rows(rows)
    json.dump(rows, open("data/out_mfr.json", "w"), indent=1)
    return rows, detail


if __name__ == "__main__":
    rows, detail = main()
    from collections import Counter
    print(len(rows), Counter(r["_region"] for r in rows), Counter(r["Fit Score"] for r in rows))
    for r in rows[:15]:
        print(r["Fit Score"], r["Preferred Zone (Y/N)"], r["Name"], "|", r["Municipality"], "|", r["_brands"], "|", r["Point of Contact"])


COVERAGE = [
    ("Alarm.com", "No usable locator (alarm.com/get_started is robots-disallowed and asks for the visitor's contact details)", "Dealers' own sites stating the partnership", "https://www.alarm.com/get_started"),
    ("Becklar", "No public locator (dealer portal requires login)", "Dealers' own sites", "-"),
    ("Brinks Home", "No public locator (badge-ID check only)", "Dealers' own sites", "-"),
    ("ADT authorized dealers", "No public dealer locator; adt.com returns 403 (Akamai) to this session", "Dealers' own sites (none found that state ADT authorization)", "https://www.adt.com/local/fl/miami"),
    ("Vivint", "Sells direct; no dealers", "-", "-"),
    ("Resideo/Honeywell", "Yes: findapro.resideo.com, resideo.com find-a-pro, Honeywell commercial security locator (Platinum/Gold/Silver)", "All Miami-Dade ZIPs (JSON endpoint used by the page) + radius sweeps", "https://findapro.resideo.com ; https://www.bullseyelocations.com/pages/honeywellcomsec"),
    ("Qolsys", "Yes, but its data host (code.metalocator.com) disallows robots", "Searched by hand in a browser (Miami-Dade ZIPs; first 20 of 63 results by distance)", "https://www.iqsecurityproducts.com/find-a-dealer"),
    ("Verkada", "Yes: verkada.com/find-partners", "All 77 Miami-Dade ZIPs at 25 mi + 100/150 mi sweeps", "https://www.verkada.com/find-partners/"),
    ("Milestone", "Yes: partner locator (JSON endpoint the page calls)", "All 77 ZIPs at 25 mi + 100/200 mi sweeps", "https://www.milestonesys.com/"),
    ("Genetec", "Partial: public map covers Unified Elite / Strategic partners only", "Full map list filtered to Florida", "https://www.genetec.com/contact-us/unified-elite-resellers"),
    ("Avigilon (Motorola)", "No: partner locator is a lead form behind an Incapsula challenge", "Dealers' own sites", "https://www.avigilon.com/partner-locator"),
    ("Hanwha Vision", "No: US site lists distributors only", "Dealers' own sites", "-"),
    ("Axis", "No: 'find a partner' is a lead form", "Dealers' own sites", "-"),
    ("Eagle Eye Networks", "No: 'find a reseller' is a lead form", "Dealers' own sites", "-"),
    ("Rhombus", "No: partner application page only", "Dealers' own sites", "-"),
    ("Brivo", "No: sales/lead form only", "Dealers' own sites", "https://www.brivo.com/contact/"),
    ("Avigilon Alta (Openpath)", "No: lead form behind Incapsula challenge", "Dealers' own sites", "https://www.avigilon.com/partner-locator"),
    ("DMP", "No: sales directory shows DMP's own regional managers only", "Dealers' own sites", "https://www.dmp.com/sales-directory"),
    ("Bosch (now Keenfinity)", "No: sales-rep locator and distributor list only", "Dealers' own sites", "https://www.keenfinity-group.com/us/en/support/contact-us/"),
    ("Napco", "No: reps and distributors only", "Dealers' own sites", "https://napcosecurity.com/sales/"),
]


def write(rows):
    from collections import Counter
    bc = Counter(b for r in rows for b in r["_brands"])
    cov = [(b, loc, meth, bc.get({"ADT authorized dealers": "ADT", "Avigilon (Motorola)": "Avigilon", "Avigilon Alta (Openpath)": "Avigilon Alta",
                                   "Bosch (now Keenfinity)": "Bosch"}.get(b, b), 0), url) for b, loc, meth, url in COVERAGE]
    n_loc = sum(1 for r in rows if not r["_self_declared"])
    md = sum(1 for r in rows if r["_region"] == "Miami-Dade")
    brand_rows = [(r["Name"], ", ".join(r["_brands"]), "; ".join(r["_levels"]), "Self-declared on dealer's own site" if r["_self_declared"] else "Manufacturer locator", r["Municipality"]) for r in rows]
    write_xlsx("../leads/T2_Manufacturer_Dealers.xlsx",
               f"Manufacturer dealer / partner locators for Miami-Dade (20 brands) - {len(rows)} dealers ({md} in Miami-Dade, rest Broward/Palm Beach returned by Miami-Dade ZIP searches). Sources: each brand's locator (see coverage table below) - e.g. https://www.verkada.com/find-partners/ , https://findapro.resideo.com",
               f"Warmth: TIER 2 - WARM. These brands sell only through dealers, so every row is an active installer with a manufacturer relationship. {n_loc} rows come from a manufacturer locator; the rest are dealers whose OWN website states the brand partnership (most brands publish no locator). Brands carried are listed in 'Services Listed on Website' (brands: ...) and in the brand table below.",
               f"Date collected: {TODAY}. Miami-Dade first, then Broward, Palm Beach; then Fit Score.",
               rows,
               extra_sections=[("BRANDS PER DEALER (as listed by the locator or the dealer's own site)", ["Dealer", "Brands", "Partner level / listing text", "Evidence type", "Municipality"], brand_rows),
                               ("LOCATOR COVERAGE BY BRAND", ["Brand", "Public locator?", "Method", "Dealers found", "Locator URL"], cov)],
               sheet_title="Manufacturer Dealers")


if __name__ == "__main__" and "--write" in sys.argv:
    write(json.load(open("data/out_mfr.json")))
    print("written")
