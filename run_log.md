# IRIS Miami-Dade Dealer Lead Files — run log

## MORNING REPORT
(written at the end of the run — see bottom sections while in progress)

## PROGRESS
| Step | Source | Output | Status |
| --- | --- | --- | --- |
| 1 | Manufacturer dealer locators | leads/T2_Manufacturer_Dealers.xlsx | done (v1) |
| 2 | IAF members | leads/T1_IAF_Members.xlsx | done (v1) |
| 3 | TMA members | leads/T1_TMA_Members.xlsx | done (partial - directory blocked) |
| 4 | Alarm Exchange | docs/T2_Alarm_Exchange.docx | done |
| 5 | Directories | leads/T3_Directories.xlsx | done (partial - profiles/BOMA blocked) |
| 5 | Licenses (DBPR) | leads/T3_Licenses.xlsx | done (v1; websites being added) |
| 5 | Permits & bids | docs/T3_Permits_and_Bids.docx | pending |
| 5 | Hiring | docs/T3_Hiring.docx | done |
| 6 | Houses of worship | leads/Segment_Houses_of_Worship.xlsx | done |
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
- Hiring: Indeed (login wall), Glassdoor/SimplyHired (bot blocks), LinkedIn and ZipRecruiter (robots.txt) were not read directly; Indeed posts were reached through Tallo mirrors. WISE Building Technologies (Doral) security/fire alarm technician post could not be confirmed (hosting page would not load) — check by hand. SIA/ESA job boards and Employ Florida (robots.txt) not reachable.
- Houses of worship: Chabad.org directory and Chabad-hosted center sites block automated access, so leadership names are missing for ~20 Chabad centers (names/addresses came from the Greater Miami Jewish Federation directory). Unreadable sites: Beth Torah Benny Rok (btbrc.org), Edmond J. Safra Synagogue (ejsfl.com) and a few others. Prizmah and Florida DOE returned 403 (Miami-Dade County private-school listing used). ~8 address conflicts, split-ZIP municipalities (33180, 33169, 33156, 33161, 33150) and ~14 small directory-only minyans need checking (details: leadgen/data/how_notes.md).
- web.archive.org is unreachable from this cloud environment (connection timeouts), so no archived copies could be used anywhere.
- TMA member directory https://my.tma.us/tmamemberdirectory (USA > Florida): Cloudflare "verify you are human" check, 403 to plain requests and headless browser (also after a 60 s retry). Not bypassed. In a normal browser, export the Florida list (especially Miami, Doral, Hialeah, Medley, Miami Lakes, Coral Gables, Miami Beach, Homestead). Same block on the Five Diamond lists (https://my.tma.us/fivediamondmonitoringcenters, https://my.tma.us/20262027tmafivediamondapprovedcompanies) and New Members (https://themonitoringassociation.growthzoneapp.com/newtmamembers/). T1_TMA_Members.xlsx was rebuilt from public tma.us pages and search-engine copies of directory pages and is incomplete.
- TMA: Arco Security Central Station Corp. (Miami 33165, the one clean Miami-Dade monitoring member) — trade press reports Owen Security Solutions bought the Arco Security Group in 2025; check current status.
- BOMA Miami-Dade member directory https://members.bomamiamidade.org/member-directory — Cloudflare 403 and not indexed by search engines; browse the security / life safety / access control categories by hand.
- securityinformed.com / sourcesecurity.com — list pages loaded in a headless browser, but company profile pages (street address, ZIP, website) return Cloudflare 403 after 2-3 loads even at 30-60 s spacing. Profile URLs are in leadgen/data/directories.json notes; open them by hand for ZIPs and websites.

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

### TMA (T1)
- Directory blocked (see NEEDS MANUAL WORK). Rebuilt from ~45 tma.us pages + 271 of 859 tma.us posts (Florida/board/award/new-member posts first) and the search-engine index of individual TMA directory pages (search-result text used as evidence; pages themselves not opened). 26 Florida companies, 3 Miami-Dade. Florida TMA leadership (ADT, Everon, Hauhn & Associates) listed under the table.
- DECISION: Business Type set from the TMA membership class (associate -> Software/Vendor, consultant -> Consultant/Broker, proprietary GSOC -> Other).

### Directories (T3)
- pipl.systems has no city pages; Florida state page + Florida company pages from its sitemap. securityinformed / sourcesecurity Miami and Florida list pages read with a headless browser; profile pages blocked. BOMA directory blocked; Kastle Systems (BOMA committee member named on BOMA's public site) and Allied Universal (BOMA sponsor) added from BOMA's public pages.
- DECISION: pipl's ZIP 33131 appears to be a default for Miami profiles, so it was dropped where the agent flagged it (municipality then defaults to City of Miami).
- Excluded: locksmiths, cyber-only, manufacturers, distributors; Convergint (California address on pipl).

### Hiring (T3 doc)
- 24 companies (22 Miami-Dade). Small local firms first, nationals (Kastle, Pavion, Securitas Technology, Wachter, Titan, ADT, Brinks Home, Johnson Controls, Parsons, KBR) in short entries. Note: Omni Data / Paradyme Secure (Miami-Dade IAF member) says it is now part of the RapidSOS family of companies — possible competitor channel; flagged in the hiring notes.
- The shared web-search allowance ran out near the end of this agent's run, so a few names were not searched.

### Website finding (for license holders / IAF members without a listed site)
- Web search allowance was exhausted by the research agents, so websites were found by testing candidate domains built from the company name (e.g. name.com / name.net) and accepting one ONLY if its homepage names the company and carries a Florida/Miami marker. 36 found for 210 targets; 4 rejected on manual review (different companies). Results: leadgen/data/websites_found.json.

### Houses of worship (segment)
- 140 institutions (92 houses of worship, 48 schools); 44 in Miami Beach. Sources: Greater Miami Jewish Federation directory and "Find a Rabbi", Miami-Dade County private-school map data, CAJE Miami lists, OU/URJ/USCJ listings (same public data their pages load), ~95 institution websites. 65 named contacts (own site or county listing), 69 published emails, 29 with published security notes (e.g. named security directors, video surveillance, guards, a 2023 security RFP).
- DECISION: "Services Listed on Website" holds denomination, size and published security notes for this segment. Closed/moved institutions (Temple Israel of Greater Miami, Bet Breira Samu-El Or Olom, Temple Beth Tov, Sha'arei Bina, Hochberg Prep) left out. DO NOT CONTACT - segment list for dealers.
