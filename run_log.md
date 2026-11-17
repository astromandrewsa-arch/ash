# IRIS Miami-Dade Dealer Lead Files — run log

## MORNING REPORT
(written at the end of the run — see bottom sections while in progress)

## PROGRESS
| Step | Source | Output | Status |
| --- | --- | --- | --- |
| 1 | Manufacturer dealer locators | leads/T2_Manufacturer_Dealers.xlsx | in progress |
| 2 | IAF members | leads/T1_IAF_Members.xlsx | in progress |
| 3 | TMA members | leads/T1_TMA_Members.xlsx | pending |
| 4 | Alarm Exchange | docs/T2_Alarm_Exchange.docx | pending |
| 5 | Directories | leads/T3_Directories.xlsx | pending |
| 5 | Licenses (DBPR) | leads/T3_Licenses.xlsx | pending |
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
- TMA member directory (https://my.tma.us/tmamemberdirectory): Cloudflare "verify you are human" bot check returns 403 to plain requests and to a headless browser (30 s wait). Not bypassed per the rules. web.archive.org also timed out from this environment. Alternatives are being tried (see TMA section).

## SOURCE NOTES
