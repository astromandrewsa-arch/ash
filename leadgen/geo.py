"""Miami-Dade geography helpers: ZIP -> default municipality, region classification, preferred zones."""
import re

PREFERRED = {"Coral Gables", "Miami Beach", "Homestead"}

# Default municipality for each Miami-Dade ZIP, used only when the mailing city is the generic "Miami"
# (or missing). Split ZIPs use the majority municipality.
MD_ZIPS = {
    "33010": "Hialeah", "33011": "Hialeah", "33012": "Hialeah", "33013": "Hialeah", "33014": "Miami Lakes",
    "33015": "Unincorporated Miami-Dade", "33016": "Hialeah", "33017": "Hialeah", "33018": "Hialeah Gardens",
    "33030": "Homestead", "33031": "Homestead", "33032": "Homestead", "33033": "Homestead", "33034": "Florida City",
    "33035": "Homestead", "33039": "Homestead", "33090": "Homestead", "33092": "Homestead",
    "33054": "Opa-locka", "33055": "Miami Gardens", "33056": "Miami Gardens",
    "33101": "City of Miami", "33102": "City of Miami", "33106": "City of Miami", "33109": "Miami Beach",
    "33111": "City of Miami", "33112": "City of Miami", "33114": "Coral Gables", "33116": "Unincorporated Miami-Dade",
    "33119": "Miami Beach", "33122": "Doral", "33124": "Coral Gables", "33125": "City of Miami",
    "33126": "Unincorporated Miami-Dade", "33127": "City of Miami", "33128": "City of Miami", "33129": "City of Miami",
    "33130": "City of Miami", "33131": "City of Miami", "33132": "City of Miami", "33133": "City of Miami",
    "33134": "Coral Gables", "33135": "City of Miami", "33136": "City of Miami", "33137": "City of Miami",
    "33138": "City of Miami", "33139": "Miami Beach", "33140": "Miami Beach", "33141": "Miami Beach",
    "33142": "City of Miami", "33143": "South Miami", "33144": "West Miami", "33145": "City of Miami",
    "33146": "Coral Gables", "33147": "Unincorporated Miami-Dade", "33149": "Key Biscayne", "33150": "City of Miami",
    "33151": "City of Miami", "33152": "City of Miami", "33153": "City of Miami", "33154": "Surfside",
    "33155": "Unincorporated Miami-Dade", "33156": "Pinecrest", "33157": "Palmetto Bay", "33158": "Palmetto Bay",
    "33160": "Sunny Isles Beach", "33161": "North Miami", "33162": "North Miami Beach", "33163": "Aventura",
    "33164": "North Miami", "33165": "Unincorporated Miami-Dade", "33166": "Medley", "33167": "Unincorporated Miami-Dade",
    "33168": "Unincorporated Miami-Dade", "33169": "Miami Gardens", "33170": "Unincorporated Miami-Dade",
    "33172": "Doral", "33173": "Unincorporated Miami-Dade", "33174": "Sweetwater", "33175": "Unincorporated Miami-Dade",
    "33176": "Unincorporated Miami-Dade", "33177": "Unincorporated Miami-Dade", "33178": "Doral",
    "33179": "North Miami Beach", "33180": "Aventura", "33181": "North Miami", "33182": "Unincorporated Miami-Dade",
    "33183": "Unincorporated Miami-Dade", "33184": "Unincorporated Miami-Dade", "33185": "Unincorporated Miami-Dade",
    "33186": "Unincorporated Miami-Dade", "33187": "Unincorporated Miami-Dade", "33189": "Cutler Bay",
    "33190": "Cutler Bay", "33193": "Unincorporated Miami-Dade", "33194": "Unincorporated Miami-Dade",
    "33196": "Unincorporated Miami-Dade", "33197": "Unincorporated Miami-Dade", "33199": "City of Miami",
    "33206": "City of Miami", "33231": "City of Miami", "33233": "City of Miami", "33234": "City of Miami",
    "33238": "City of Miami", "33239": "Miami Beach", "33242": "City of Miami", "33243": "South Miami",
    "33245": "City of Miami", "33247": "City of Miami", "33255": "Unincorporated Miami-Dade", "33256": "Pinecrest",
    "33257": "Unincorporated Miami-Dade", "33261": "North Miami", "33265": "Unincorporated Miami-Dade",
    "33266": "Medley", "33269": "Miami Gardens", "33280": "North Miami Beach", "33283": "Unincorporated Miami-Dade",
    "33296": "Unincorporated Miami-Dade", "33299": "City of Miami",
}

# Names of Miami-Dade municipalities as they may appear in a mailing address.
MD_CITY_NAMES = {
    "aventura": "Aventura", "bal harbour": "Bal Harbour", "bay harbor islands": "Bay Harbor Islands",
    "biscayne park": "Biscayne Park", "coral gables": "Coral Gables", "cutler bay": "Cutler Bay", "doral": "Doral",
    "el portal": "El Portal", "florida city": "Florida City", "golden beach": "Golden Beach", "hialeah": "Hialeah",
    "hialeah gardens": "Hialeah Gardens", "homestead": "Homestead", "indian creek": "Indian Creek",
    "key biscayne": "Key Biscayne", "medley": "Medley", "miami": None, "miami beach": "Miami Beach",
    "miami gardens": "Miami Gardens", "miami lakes": "Miami Lakes", "miami shores": "Miami Shores",
    "miami springs": "Miami Springs", "north bay village": "North Bay Village", "north miami": "North Miami",
    "north miami beach": "North Miami Beach", "opa-locka": "Opa-locka", "opa locka": "Opa-locka",
    "palmetto bay": "Palmetto Bay", "pinecrest": "Pinecrest", "south miami": "South Miami",
    "sunny isles beach": "Sunny Isles Beach", "sunny isles": "Sunny Isles Beach", "surfside": "Surfside",
    "sweetwater": "Sweetwater", "virginia gardens": "Virginia Gardens", "west miami": "West Miami",
    "kendall": "Unincorporated Miami-Dade", "miami gardens": "Miami Gardens", "hialeah lakes": "Hialeah",
    "princeton": "Unincorporated Miami-Dade", "leisure city": "Unincorporated Miami-Dade",
    "cutler ridge": "Cutler Bay", "westchester": "Unincorporated Miami-Dade", "kendall west": "Unincorporated Miami-Dade",
    "the hammocks": "Unincorporated Miami-Dade", "tamiami": "Unincorporated Miami-Dade", "fontainebleau": "Unincorporated Miami-Dade",
    "olympia heights": "Unincorporated Miami-Dade", "redland": "Unincorporated Miami-Dade",
    "fisher island": "Miami Beach", "naranja": "Unincorporated Miami-Dade", "goulds": "Unincorporated Miami-Dade",
    "richmond heights": "Unincorporated Miami-Dade", "palmetto estates": "Unincorporated Miami-Dade",
    "ojus": "Unincorporated Miami-Dade", "brownsville": "Unincorporated Miami-Dade",
}

BROWARD_RANGES = [(33004, 33004), (33009, 33009), (33019, 33029), (33060, 33077), (33081, 33084), (33093, 33093),
                  (33301, 33394), (33441, 33443)]
PALM_BEACH_RANGES = [(33401, 33440), (33444, 33499)]


def zip5(z):
    m = re.search(r"\b(\d{5})(?:-\d{4})?\b", str(z or ""))
    return m.group(1) if m else ""


BROWARD_CITIES = set("""fort lauderdale|ft lauderdale|ft. lauderdale|hollywood|pembroke pines|miramar|davie|plantation|sunrise|coral springs|pompano beach|deerfield beach|cooper city|oakland park|dania beach|dania|hallandale beach|hallandale|weston|tamarac|margate|lauderhill|lauderdale lakes|coconut creek|parkland|lighthouse point|hillsboro beach|wilton manors|north lauderdale|southwest ranches|lauderdale-by-the-sea""".split("|"))
PB_CITIES = set("""west palm beach|boca raton|delray beach|boynton beach|lake worth|lake worth beach|jupiter|palm beach gardens|wellington|royal palm beach|riviera beach|lantana|juno beach|greenacres|palm beach|north palm beach|tequesta|belle glade|loxahatchee|palm springs""".split("|"))


def region(zipcode, state="FL", city=None):
    """Return 'Miami-Dade', 'Broward', 'Palm Beach', 'Other FL' or 'Out of state'."""
    z = zip5(zipcode)
    if state and state.upper() not in ("FL", "?"):
        return "Out of state"
    if not z:
        c = (city or "").lower().replace(".", "").strip()
        if c in MD_CITY_NAMES or c in ("city of miami", "unincorporated miami-dade"):
            return "Miami-Dade"
        if c in BROWARD_CITIES:
            return "Broward"
        if c in PB_CITIES:
            return "Palm Beach"
        return "Other FL"
    if z in MD_ZIPS:
        return "Miami-Dade"
    n = int(z)
    if any(a <= n <= b for a, b in BROWARD_RANGES):
        return "Broward"
    if any(a <= n <= b for a, b in PALM_BEACH_RANGES):
        return "Palm Beach"
    return "Other FL"


def municipality(city, zipcode, state="FL"):
    """Municipality of the main address. Generic 'Miami' mailing city is refined by ZIP."""
    c = (city or "").strip()
    z = zip5(zipcode)
    key = c.lower().replace(".", "").strip()
    if region(z, state) == "Miami-Dade" or key in MD_CITY_NAMES:
        if key in MD_CITY_NAMES and MD_CITY_NAMES[key]:
            return MD_CITY_NAMES[key]
        if z in MD_ZIPS:
            return MD_ZIPS[z]
        return "City of Miami" if key == "miami" else (c.title() or "?")
    if not c:
        return "?"
    # Title-case shouting addresses, keep normal ones
    return c.title() if c.isupper() or c.islower() else c


PZ_TERMS = re.compile(r"coral gables|miami[- ]beach|homestead|miami[- ]dade|dade county|south florida|so\. florida|south fl\b",
                      re.I)


def preferred_zone(muni, *texts):
    """Y if located in a preferred zone, or the listing/site says it serves a preferred zone,
    Miami-Dade or South Florida (user rule: those count as covering the preferred zones)."""
    if muni in PREFERRED:
        return "Y", f"Located in {muni}"
    for t in texts:
        if t:
            m = PZ_TERMS.search(t)
            if m:
                return "Y", f"Mentions '{m.group(0)}'"
    return "N", ""
