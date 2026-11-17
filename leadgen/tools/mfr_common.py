"""Shared helpers for manufacturer-locator scrapers (group B). No phone numbers are ever stored."""
import json, os, re, sys, time
sys.path.insert(0, '/home/user/ash/leadgen')
from geo import region as _region, zip5  # noqa

MONROE = {"33001", "33036", "33037", "33040", "33041", "33042", "33043", "33044", "33045", "33050", "33051",
          "33052", "33070"}
KEEP_REGIONS = {"Miami-Dade", "Broward", "Palm Beach", "Monroe"}

PRIORITY_ZIPS = "33134 33146 33139 33140 33141 33030 33033".split()
REST_ZIPS = ("33122 33125 33126 33127 33128 33129 33130 33131 33132 33133 33135 33136 33137 33138 33142 33143 "
             "33144 33145 33147 33149 33150 33154 33155 33156 33157 33158 33160 33161 33162 33165 33166 33167 "
             "33168 33169 33170 33172 33173 33174 33175 33176 33177 33178 33179 33180 33181 33182 33183 33184 "
             "33185 33186 33187 33189 33190 33193 33194 33196 33010 33012 33013 33014 33015 33016 33018 33031 "
             "33032 33034 33035 33054 33055 33056").split()
ALL_ZIPS = PRIORITY_ZIPS + REST_ZIPS
UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36'
PHONE_RE = re.compile(r'(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}')


def region(zipcode, state="FL"):
    z = zip5(zipcode)
    if (state or "FL").upper() in ("FL", "FLORIDA") and z in MONROE:
        return "Monroe"
    return _region(z, "FL" if (state or "").upper() in ("FL", "FLORIDA") else state)


def keep(zipcode, state):
    return region(zipcode, state) in KEEP_REGIONS


def strip_phones(s):
    return PHONE_RE.sub('', s or '').strip()


def rec(**kw):
    base = {"name": "", "brand": "", "listing_level": "", "address": "", "city": "", "state": "FL", "zip": "",
            "website": "", "email": "", "contact_name": "", "contact_role": "", "contact_source": "",
            "services_on_listing": "", "service_area": "", "listing_url": "", "query": "", "notes": ""}
    base.update({k: (v if v is not None else "") for k, v in kw.items()})
    for k in ("services_on_listing", "notes", "service_area", "address"):
        base[k] = strip_phones(base[k])
    if base["contact_name"] and not base["contact_role"]:
        base["contact_role"] = "Listed contact"
    return base


def save(path, records):
    with open(path, 'w') as f:
        json.dump(records, f, indent=2, ensure_ascii=False)
    # safety check: no phone-number-like strings in output
    txt = json.dumps(records)
    bad = [m.group(0) for m in PHONE_RE.finditer(txt)]
    if bad:
        print("WARNING phone-like strings found:", bad[:10])
    print("saved", len(records), "->", path)


_ZC = None


def zip_coords(z):
    """Census 2023 ZCTA internal point for a ZIP (lat, lng)."""
    global _ZC
    if _ZC is None:
        _ZC = {}
        with open('/home/user/ash/leadgen/raw/mfr_b/gaz/2023_Gaz_zcta_national.txt') as f:
            next(f)
            for line in f:
                p = line.split('\t')
                _ZC[p[0]] = (float(p[5]), float(p[6]))
    return _ZC.get(z)
