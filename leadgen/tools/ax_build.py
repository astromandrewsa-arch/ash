"""Build leadgen/data/alarm_exchange.json from the saved Alarm Exchange page and curated entries.

Usage: python3 leadgen/tools/ax_build.py
Inputs : leadgen/raw/alarm_exchange/main.html (the full "View All" page) and leadgen/tools/ax_curated.py
Output : leadgen/data/alarm_exchange.json (phone numbers scrubbed and checked)
"""
import json, re, sys, pathlib
from bs4 import BeautifulSoup

ROOT = pathlib.Path(__file__).resolve().parents[1]
RAW = ROOT / "raw" / "alarm_exchange" / "main.html"
OUT = ROOT / "data" / "alarm_exchange.json"
BASE = "https://www.kirschenbaumesq.com/page/alarm-exchange"

SLUGS = [
    "parts-equipment-for-sale-or-wanted",
    "sub-contractors-available-for-work-looking-for-subcontractors",
    "https-wwwkirschenbaumesqcom-page-alarm-exchange",
    "help-wanted", "position-wanted", "merger-and-acquisitions", "central-stations",
    "business-brokers-consultants", "insurance-brokers-insurance-companies-for-alarm-industry",
    "financial-services", "educational-and-training-programs", "marketing-for-the-alarm-security-industry",
    "technical-support", "technology-and-services-that-increase-or-preserve-your-rmr", "associations",
    "miscellaneous",
]

# Toll-free "vanity" numbers spelled with letters (8xx prefix followed by a letter/digit word).
VANITY = re.compile(r"(?:\b1[\s\-])?\(?\b8[0-9]{2}\)?[\s\-]+(?:\d{3}[\s\-])?(?=[0-9A-Z]*[A-Z])[0-9A-Z]{4,7}\b")
PHONE = re.compile(
    r"(?:\+?1[\s.\-])?"                      # country code
    r"(?:\(?\d{3}\)?[\s.\-]*\d{3}[\s.\-]*\d{3,4}"  # area code + number (also 9-digit typos)
    r"|\b\d{3}[\s.\-]\d{4}\b)"               # 7-digit local with separator
    r"(?:\s*(?:x|ext\.?|ext:|extension)\s*\.?\s*\d{1,5})?"
    r"(?:\s\d{3}(?=\D|$))?",                 # bare extension after K&K main line
    re.I)


def scrub(text):
    text = VANITY.sub("[phone omitted]", text)
    text = PHONE.sub("[phone omitted]", text)
    text = re.sub(r"(\[phone omitted\][\s,;/|]*(?:or|and)?\s*)+\[phone omitted\]", "[phone omitted]", text)
    text = re.sub(r"\(\s*\[phone omitted\]\s*\)", "[phone omitted]", text)
    return re.sub(r"\s+", " ", text).strip()


def load_listings():
    s = BeautifulSoup(RAW.read_text(encoding="utf-8", errors="replace"), "lxml")
    cats = []
    for h in s.find_all("h2", class_="alarm-exchange-category"):
        items = []
        sib = h.find_next_sibling()
        while sib is not None and sib.name != "h2":
            if "alarm-exchange-entry" in (sib.get("class") or []):
                new = bool(sib.find(class_="alarm-exchange-new"))
                for n in sib.find_all(class_="alarm-exchange-new"):
                    n.decompose()
                items.append({"new": new, "text": re.sub(r"\s+", " ", sib.get_text(" ", strip=True))})
            sib = sib.find_next_sibling()
        cats.append({"name": re.sub(r"\s+", " ", h.get_text(" ", strip=True)), "items": items})
    return cats


FIELDS = ["heading", "poc", "role", "contact_source", "municipality", "state", "zip", "website", "email",
          "business_type", "found", "why", "next_step", "source_url", "florida", "miami_dade"]
BTYPES = {"Dealer/Integrator", "Monitoring Center", "Guard Company", "Subcontractor", "Consultant/Broker",
          "Software/Vendor", "Association", "Other"}


def make_entry(ci, cats, spec):
    idx = spec.pop("i")
    idxs = idx if isinstance(idx, list) else [idx]
    url = f"{BASE}?keywords=&category={SLUGS[ci]}"
    if "found" not in spec:
        parts = []
        for k, j in enumerate(idxs):
            it = cats[ci]["items"][j]
            lab = "Listing" if len(idxs) == 1 else f"Listing {k + 1} of {len(idxs)} (duplicate/related post)"
            tag = " (marked NEW on the page)" if it["new"] else ""
            parts.append(f"{lab}{tag}, no posting date shown: {scrub(it['text'])}")
        spec["found"] = " ".join(parts) + " [Phone numbers removed by policy.]"
    else:
        spec["found"] = scrub(spec["found"])
    e = {
        "heading": spec.get("heading", ""), "poc": spec.get("poc", ""),
        "role": spec.get("role", "Listed contact" if spec.get("poc") else ""),
        "contact_source": spec.get("contact_source", url if spec.get("poc") else ""),
        "municipality": spec.get("municipality", "?"), "state": spec.get("state", "?"), "zip": spec.get("zip", "?"),
        "website": spec.get("website", "?"), "email": spec.get("email", "?"),
        "business_type": spec["business_type"], "found": spec["found"], "why": scrub(spec["why"]),
        "next_step": spec["next_step"], "source_url": spec.get("source_url", url),
        "florida": bool(spec.get("florida", False)), "miami_dade": bool(spec.get("miami_dade", False)),
    }
    assert e["business_type"] in BTYPES, e["business_type"]
    return e, idxs


def main():
    sys.path.insert(0, str(pathlib.Path(__file__).parent))
    import ax_curated as C
    cats = load_listings()
    assert len(cats) == 16
    out = {"source_url": BASE, "date_collected": "2026-11-17", "categories": [], "top_picks": C.TOP_PICKS,
           "notes": C.NOTES}
    tot = inc = fl = md = 0
    for ci, cat in enumerate(cats):
        cur = C.CUR.get(ci)
        if cur is None:
            continue
        entries, covered = [], set()
        for spec in cur["entries"]:
            e, idxs = make_entry(ci, cats, dict(spec))
            entries.append(e)
            covered.update(idxs)
        entries.sort(key=lambda e: (not e["miami_dade"], not e["florida"]))
        note = re.sub(r"^\d+ skipped[:.]?\s*", "", cur["skipped_note"])
        note = f"{len(cat['items']) - len(covered)} skipped: {note}"
        out["categories"].append({"category": cat["name"], "total_listings": len(cat["items"]),
                                  "included": len(covered), "skipped_note": scrub(note),
                                  "entries": entries})
        tot += len(cat["items"]); inc += len(covered)
        fl += sum(e["florida"] for e in entries); md += sum(e["miami_dade"] for e in entries)
    blob = json.dumps(out, ensure_ascii=False, indent=1)
    # Hard check: no phone numbers anywhere in the output.
    bad = []
    for m in re.finditer(r"\d{3}[\s.\-()]{0,3}\d{3}[\s.\-]{0,2}\d{4}|\d{7,}", blob):
        ctx = blob[max(0, m.start() - 6):m.end()]
        if re.search(r"(EF-?|ECLB|Y|EF2|license )\d*$", blob[max(0, m.start() - 6):m.start() + 1]):
            continue  # Florida/Texas license numbers, not phones
        bad.append(ctx)
    bad += re.findall(r"8\d\d\)?[\s\-]+(?:\d{3}[\s\-])?[0-9A-Z]*[A-Z]{3,}[0-9A-Z]*", blob)
    if bad:
        print("POSSIBLE PHONES:", bad[:20]); sys.exit(1)
    OUT.write_text(blob, encoding="utf-8")
    print(f"categories={len(out['categories'])} listings_read={tot} included={inc} "
          f"entries={sum(len(c['entries']) for c in out['categories'])} florida_entries={fl} miami_dade_entries={md}")


if __name__ == "__main__":
    main()
