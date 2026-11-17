# IRIS Miami-Dade Dealer Lead Files — run log

## MORNING REPORT
(written at the end of the run — see bottom sections while in progress)

## PROGRESS
| Step | Source | Output | Status |
| --- | --- | --- | --- |
| 1 | Manufacturer dealer locators | leads/T2_Manufacturer_Dealers.xlsx | done (v1) |
| 2 | IAF members | leads/T1_IAF_Members.xlsx | done (v1) |
| 3 | TMA members | leads/T1_TMA_Members.xlsx | pending |
| 4 | Alarm Exchange | docs/T2_Alarm_Exchange.docx | done |
| 5 | Directories | leads/T3_Directories.xlsx | pending |
| 5 | Licenses (DBPR) | leads/T3_Licenses.xlsx | done (v1; websites being added) |
| 5 | Permits & bids | docs/T3_Permits_and_Bids.docx | pending |
| 5 | Hiring | docs/T3_Hiring.docx | pending |
| 6 | Houses of worship | leads/Segment_Houses_of_Worship.xlsx | pending |
| 7 | Master | leads/Master.xlsx | pending |

## DECISIONS
- 2026-11-17: Repository/branch. The session could not push to astromandrewsa-arch/DATALEADSMIAMI (the git proxy refused: repo not in this session's authorized set, and attaching it had been declined earlier). All work is committed and pushed to branch `claude/dataleadsmiami-repo-xlvinv` of astromandrewsa-arch/ash (the branch this session was given). Outputs live at the repo root in `leads/`, `docs/` and `run_log.md`; supporting scripts and collected JSON in `leadgen/`. Copy `leads/`, `docs/`, `run_log.md` (and optionally `leadgen/`) into DATALEADSMIAMI when convenient.
- Order: the three manufacturer-locator research agents (most valuable source) were launched first and run in parallel; IAF was processed in the main thread at the same time because its directory loads in one request. Commits follow whichever finishes first.
- Municipality: taken from the main address city. When the mailing city is the generic "Miami", the municipality is refined from the ZIP code using a ZIP -> majority-municipality table (leadgen/geo.py); split ZIPs use the majority municipality, so a few may need checking against the exact street address.
- Preferred Zone = Y when the main address is in Coral Gables, Miami Beach or Homestead, OR the listing / company website mentions Coral Gables, Miami Beach, Homestead, Miami-Dade, Dade County or South Florida (per your rule that "Miami-Dade"/"South Florida" covers the preferred zones). Otherwise N.
- Services Listed on Website, Email, Number of Locations and website-named contacts come from an automated read of each company's own public site (home + about/team/contact/services pages, robots.txt respected, phone numbers stripped before anything is stored). Services are matched against a fixed vocabulary (commercial, residential, CCTV/video surveillance, access control, ...), plus verticals served and brand names found on the site. "?" = site unreachable or nothing found.
- Number of Locations: an explicit "N locations/offices" claim on the site if present, otherwise the count of distinct street addresses printed on the site; "?" if none found.
- Point of Contact: the person named on the source listing (role "Listed contact" unless a role is stated there). If the company's own site names the same person with a role, that role is used and both URLs are given in Contact Source. If the listing names nobody, a person named with a role on the company's own About/Team/Contact page is used. Generic names ("Admin", "Office") are dropped.
- Business Type: inferred from the company name and its own site (monitoring/central station -> Monitoring Center; guard/patrol -> Guard Company; consulting/engineering/broker -> Consultant/Broker; manufacturers, distributors, software, insurance, finance, law -> Software/Vendor; electrical contractors with no camera/access-control services on their site -> Subcontractor; otherwise Dealer/Integrator).
- Fit Score follows your rubric exactly; residential-only (site mentions residential and not commercial) is capped at 1.
- Geography in statewide sources (IAF, TMA, DBPR): all Florida entries are kept, sorted Miami-Dade first, then Broward, Palm Beach, rest of Florida, then out of state.
- No phone numbers are recorded anywhere. Raw HTML downloads (which can contain phone numbers) are kept out of git (leadgen/raw, leadgen/cache are git-ignored).

## NEEDS MANUAL WORK
- Qolsys dealer locator https://www.iqsecurityproducts.com/find-a-dealer — its data host (code.metalocator.com) disallows robots. Search ZIPs 33134, 33139, 33141, 33030, 33160 by hand in a browser. Likely high value (Qolsys panels are the standard Alarm.com hardware).
- Alarm.com https://www.alarm.com/get_started — robots-disallowed and asks for your contact details; only a person can use it.
- ADT — adt.com returns 403 (Akamai) to this environment and has no dealer locator. Third-party directory leads to check by hand: City Alarms (Doral), Security Tech Group (Miami), Home Security Concepts, SafeStreets (national ADT Authorized Provider).
- Honeywell commercial security locator https://www.bullseyelocations.com/pages/honeywellcomsec — Cloudflare 403; results were read via a summarizing fetch. Spot-check ZIP 33134, radius 250 in a browser.
- Avigilon / Avigilon Alta https://www.avigilon.com/partner-locator — lead form behind an Incapsula challenge; ask Motorola/Avigilon for the Miami-Dade partner list.
- Brivo, DMP, Bosch (Keenfinity), Napco, Axis, Hanwha, Eagle Eye, Rhombus, Genetec (lower tiers) — no public dealer lists; a regional sales manager could supply Miami-Dade dealers (not contacted, per rules).
- Dicsan Technology (Miami; appears to claim Avigilon and Hanwha) — site fails TLS/502; verify by hand. Empire State Security (Plantation) brands page renders client-side; verify.
- Alarm Exchange: Protective Security Solutions Inc. (Miami 33186, top pick) website failed (TLS/503) — check services by hand; Scorpion Fire and Safety city unknown; Sunbiz (Florida company registry) is behind a Cloudflare check from this environment.
- web.archive.org is unreachable from this cloud environment (connection timeouts), so no archived copies could be used anywhere.
- TMA member directory (https://my.tma.us/tmamemberdirectory): Cloudflare "verify you are human" bot check returns 403 to plain requests and to a headless browser (30 s wait). Not bypassed per the rules. web.archive.org also timed out from this environment. Alternatives are being tried (see TMA section).

## SOURCE NOTES

### Manufacturer dealers (T2)
- 20 brands checked by three research agents (notes: leadgen/data/mfr_group_a/b/c_notes.md). Only Verkada, Milestone, Resideo/Honeywell (incl. Honeywell commercial security locator) and Genetec (top-tier map) have usable public locators; these were queried ZIP-by-ZIP for all 77 Miami-Dade ZIPs (or swept by radius until results stopped changing).
- For the other brands (no public locator, a lead form, robots-disallowed or bot-blocked), dealers whose OWN website states the brand partnership were recorded and marked "self-declared" in the brand table.
- Locator results include Broward/Palm Beach dealers returned by Miami-Dade ZIP searches (kept, sorted after Miami-Dade). Three Broward firms that claim brands and serve Miami-Dade (Sentry Security, AFA Protective Systems, Everon) were added from the agents' near-miss lists.
- DECISION: the Honeywell commercial security locator (not on the brand list) was included under Resideo/Honeywell because it lists commercial video/access dealers.

### IAF (T1)
- Directory loaded via the page's own blank search (one request; site robots.txt crawl-delay 30 s respected). 322 listings; 23 in Miami-Dade. Board (directors.php) and committees (committees.php) added in two sections below the main table; committee members' companies are only those IAF states or a match to the person named on an IAF directory listing.

### Alarm Exchange (T2 doc)
- All 16 categories, 335 listings read (main page and each category filter view; the robots-disallowed /article/the-alarm-exchange* path was not fetched). 84 entries kept (98 listings merged), 42 Florida-related, 5 Miami-Dade. Skipped listings are counted and named per category in the document.
- DECISION: people seeking work or offering their license are identified by first name only, as posted; no personal emails recorded.
- Rebuild: `python3 leadgen/tools/ax_build.py` (curated entries in leadgen/tools/ax_curated.py), then `python3 leadgen/ax_out.py`.

### DBPR licenses (T3)
- Florida DBPR does not need the interactive license search: it publishes the full Electrical Contractors' Licensing Board licensee file as a public download (https://www2.myfloridalicense.com/sto/file_download/extracts/lic08el.csv, no phone numbers in it). Filtered to Certified Alarm System Contractor I (EF) and II (EG) with county code 23 (Dade): 223 licenses, 215 businesses/individuals.
- DECISION: Point of Contact = the license holder named on the DBPR record, role "License holder (DBPR EF/EG)". Name = the DBA on the license, or the licensee if none. Full license number, class, status and dates are on the "License details" tab (the main tab keeps your column order).
- The interactive search https://www.myfloridalicense.com/wl11.asp resets the connection from this environment; not needed because of the download.
