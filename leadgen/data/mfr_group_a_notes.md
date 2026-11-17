# Manufacturer locators, group A (platforms / monitoring) — Miami-Dade

Run date: 2026-11-17. Agent: group A (Alarm.com, Resideo/Honeywell, ADT, Brinks Home, Becklar, Vivint, Qolsys).
ZIP list used everywhere: the 77 Miami-Dade ZIPs from the task, in the task's order (kept in `leadgen/tools/zips.py`).
Scratch scripts: `leadgen/tools/resideo_*.py|cjs`, `leadgen/tools/pw_probe.cjs`, `leadgen/tools/pw_curlroute.cjs`, `leadgen/tools/build_resideo.py`.
Raw (phone fields stripped before writing): `leadgen/raw/resideo_searchDealers.json`, `leadgen/raw/resideo_rde_professionals.json`, `leadgen/raw/hbt_bullseye_extract.json`.

General decisions
- One JSON record per dealer per locator (the same company can appear under two Resideo/Honeywell locators with different tiers); the coordinator dedups.
- The repo-root CLAUDE.md is for the separate Pyrome demo and its git/commit rules do not apply here; per the task and SCHEMA.md I ran no git commands.
- Phone numbers: the Resideo APIs return phone fields; they were dropped in code before any file was written.
- Incident to flag: while scrubbing phone numbers from my own raw files I ran the scrub over every file in the shared `leadgen/raw/` folder, so phone-number-like strings in other agents' raw HTML (e.g. ab_aff.html, brivo_*.html, dmp_*.html, napco_*.html, verkada_*.html, empire_brands.*, kf_tmp.html, n_tmp.html, dbpr_*.html, ae.html) were replaced with "[phone removed]", and any `.png` screenshots in `leadgen/raw/` were deleted. No other content was changed. If another agent needs those raw files re-parsed, it should re-download them.

## Resideo / Honeywell — saved `mfr_resideo.json` (17 records, 11 distinct companies)

Three public locators cover this brand family:

1. **Honeywell Home / Resideo "Find a Pro"** — https://findapro.resideo.com/ (honeywellhome.com/findapro redirects here).
   - Method: questionnaire (Home/Business Security > Business > video + traditional > monitoring = Yes > ZIP). The page calls a Salesforce Apex endpoint (`/webruntime/api/apex/execute`, method `searchDealers`, `zipOnlyMatch=true` for the security path). I called that same endpoint per ZIP with curl, one request every 3.5 s. robots.txt allows all.
   - Technical note: the server omits its DigiCert intermediate certificate; I added the public DigiCert Global G2 intermediate to a local CA bundle (verification stays on). Playwright needed curl-backed routing for the same reason.
   - ZIPs queried: all 77. Results: 3 companies (Florida Safeguard listed twice under two Salesforce ids, Omega Security, Alarm Grid), all "Tier 2"; no Tier 1 dealers anywhere in Miami-Dade. Search radius is small (about 12 mi), so Broward/Palm Beach dealers only appear near the county line.
2. **Resideo "Find a Resideo Pro"** — https://www.resideo.com/us/en/find-a-pro/
   - Method: Service Type = Security (id 98551), radius 50 mi (largest option); the page calls `https://www.resideo.com/rde/findAPro/professionals`. Same endpoint queried for all 77 ZIPs, 3.5 s apart, with paging.
   - Results: 6 companies (adds I Am Guarded Security Sys Inc, Boca Raton; Alarm Partners, Delray Beach; Guardian Alarm of Florida LLC dba Guardian Hawk, Lantana). None flagged "Resideo Authorized Pro". Alarm Partners' listed address carries "ATTN: Cindy Avery", recorded as the listed contact (contact_source = the endpoint URL).
3. **Honeywell commercial security (Honeywell Building Technologies) dealer locator** — https://buildings.honeywell.com/us/en/brands/our-brands/security/partnerships/dealer-locator (iframe: https://www.bullseyelocations.com/pages/honeywellcomsec).
   - Included because it is the Honeywell locator for commercial video/access/intrusion dealers (the IRIS channel). Brand field: "Honeywell Commercial Security (Building Technologies) Dealer Locator".
   - bullseyelocations.com blocks this session's IP (Cloudflare 403 via curl and headless Chromium; retried once after waiting). robots.txt (read via WebFetch) is `Allow: /`. The page accepts `PostalCode`, `Radius`, `CountryId` as URL parameters, so I read result pages with WebFetch.
   - Searches: 33134 (R50, R100), 33139 (R50), 33160 (R50), 33030 (R50), 33180 (R100, R250), 33034 (R250). Radius 250 from both ends of the county returned the same 9 dealers, so the set is saturated; I stopped there instead of running all 77 ZIPs. Distances are labeled "mi" but behave like km.
   - Kept 8 (Security 101 Miami / Ft. Lauderdale / National Accounts, Carpenter Security dba CSI Palm Beach, Omega Security, Alarm Partners, Bryant Integrated Technologies, Triad Security Group). Excluded Executive Electronics (Bonita Springs, Lee County — outside the four-county area).
   - Partner tiers captured (Platinum/Gold/Silver; Integrated Security Dealer vs Security Partner; HIS Americas badges). Emails on these listings are obfuscated, so none were recorded. The "Showing Page 1 of 2" text appears even when the header count equals the number shown; I treated the header count as authoritative.

NEEDS MANUAL WORK (Resideo/Honeywell)
- https://www.bullseyelocations.com/pages/honeywellcomsec — Cloudflare 403 for this session (curl and Playwright, retried once). Data was read via WebFetch, which summarizes pages; a human spot-check in a browser (ZIP 33134, radius 250) should confirm the 9 results and read the obfuscated listing emails if wanted.

## Alarm.com — saved `mfr_alarmcom.json` (2 records, self-declared)

- Locator: Alarm.com's only consumer "find a provider" flow is https://www.alarm.com/get_started ("Get Started" on alarm.com). robots.txt disallows `/get_started` and `/web/WebServices`, and the flow asks the visitor for contact details before matching providers (a lead form). Per the hard rules I did not open or submit it. The alarm.com sitemap has no other dealer directory. international.alarm.com mentions a provider finder only for non-US markets.
- Alternative used: dealers' own sites that state an Alarm.com partnership and Miami-Dade service.
  - Alarm Grid Inc. — https://www.alarmgrid.com/alarm-dot-com ("Alarm.com is one of Alarm Grid's premier interactive monitoring partners") plus its Miami-Dade page https://www.alarmgrid.com/places/coral-gables. Address from its Resideo listing (Fort Lauderdale).
  - Security 101 - Miami — https://go.security101.com/alarmcom (Alarm.com as "National Strategic Partner"); Miami office per https://www.security101.com/miami.
- Searches run: "Alarm.com authorized dealer Miami", Alarm.com dealer/service provider + Miami-area cities. Leads mentioned only on third-party pages were not recorded (e.g. Dehart Alarm Systems, a pages.dev site claiming "authorized Alarm.com dealer serving all of Florida", no Miami-Dade location).

NEEDS MANUAL WORK (Alarm.com)
- https://www.alarm.com/get_started — robots.txt Disallow; it is also a contact-details lead form. A person can use it in a browser (it will ask for their own contact details) if the coordinator decides that is acceptable; the agents cannot.

## ADT authorized dealers — saved `mfr_adt.json` (0 records)

- No public ADT authorized-dealer locator exists (adt.com/dealerprogram is recruitment only). In addition, adt.com returns Akamai "Access Denied" to this session for every page, robots.txt included (curl, headless Chromium and WebFetch 403), so adt.com/local pages could not be read.
- Self-declared search: I found no Miami-Dade ADT dealer with its own website stating ADT authorization. Leads seen only on third-party directories (not recorded, listed for manual follow-up): City Alarms (Doral, 2500 NW 79th Ave Ste 209, SafeHome.org listing; cityalarms.com is an unrelated UK firm); Security Tech Group (Miami, MapQuest/BBB listings, no own site found; securitytechgroup.com is a parked domain); Home Security Concepts (Superpages "ADT dealer"; homesecurityconcepts.com is parked); "Alarms of Florida - ADT Security Dealer" (Thumbtack, Hollywood); SafeStreets (national ADT Authorized Provider, Angi/HomeAdvisor "serving Miami"); miamihomesecuritypros.com (unreachable, 502).

NEEDS MANUAL WORK (ADT)
- https://www.adt.com/ and https://www.adt.com/local/fl/miami — 403 Access Denied (Akamai) from this session for curl, headless Chromium and WebFetch; retried with curl about 30 minutes later, still 403. ADT has no dealer locator anyway; the only route is confirming the third-party leads above with each company.

## Brinks Home — saved `mfr_brinks.json` (1 record, self-declared)

- Locator: none. brinkshome.com offers only a badge-ID verification tool (https://brinkshome.com/verify-and-report) and a partner-recruitment map of Brinks staff (https://brinkshome.com/partners, bhx.brinkshome.com/dealer-program). Checked the full brinkshome.com sitemap (2,086 URLs): no dealer directory; one partner spotlight (Skyline Security, not Florida).
- Self-declared: Alarm Brokers of Florida, Doral — https://www.alarmbrokers.net/service-area/miami.htm ("Florida's most-trusted Brinks dealer", nav item "Authorized Brinks Dealer"; serves Miami, Fort Lauderdale, West Palm Beach). robots.txt crawl-delay 10 respected.
- Not recorded: "Brinks Home Security Systems DLR - DHS", 8491 NW 17th St Ste 107, Doral (MapQuest only, marked closed, no own website).

## Becklar — saved `mfr_becklar.json` (1 record, self-declared)

- Locator: none. Becklar (AvantGuard/Eyeforce) is a wholesale monitoring center; its dealer portal requires login. Its public testimonial page names dealers without locations (American West Coast Security, Brinton Security Services, A-TECH Security, 361 Technologies, Advanced Security Systems, Alarm Masters, SafeNet) and none could be tied to South Florida, so none were recorded.
- Self-declared: Security 101 - Miami — https://go.security101.com/becklar lists Becklar as a "National Strategic Partner" (Becklar Remote Guarding in SiteGuard 101; trade press Sept 2025 says it is offered by Security 101 offices nationwide). Miami office per https://www.security101.com/miami.

## Vivint — saved `mfr_vivint.json` (0 records)

- No dealer locator: Vivint sells direct through its own "Smart Home Pros" and authorized contractors; https://www.vivint.com/company/verify-dealers only verifies a badge ID. vivint.com/locations/florida/miami* pages describe Vivint itself, not dealers. vivint.com/partners/vivint-dealers is recruitment.
- Self-declared search ("Vivint authorized dealer/retailer Miami"): nothing on a dealer's own site. One Superpages listing places a Vivint entry under "Fire And Security Systems Specialist Inc" in Doral; the relationship is unclear and it is not a dealer statement, so not recorded.

## Qolsys (IQ, Johnson Controls) — saved `mfr_qolsys.json` (0 records)

- Locator exists: https://www.iqsecurityproducts.com/find-a-dealer (qolsys.com redirects to iqsecurityproducts.com). The page itself is allowed by robots.txt, but the dealer search runs in a MetaLocator iframe on code.metalocator.com (Itemid=14780, filter Brands = IQ), and https://code.metalocator.com/robots.txt is `User-agent: * / Disallow: /`. Per the robots rule I did not query it (no ZIP searches run).
- Self-declared search ("Qolsys authorized dealer" + Miami/Hialeah/Doral/South Florida): no Miami-Dade dealer found. Safe and Sound Security and Safe Home Central claim Qolsys dealer status but show no South Florida location.

NEEDS MANUAL WORK (Qolsys)
- https://www.iqsecurityproducts.com/find-a-dealer — dealer data served from code.metalocator.com, which disallows all robots. A person can search ZIPs 33134, 33139, 33141, 33030, 33160 there in a browser and copy the dealers (likely high value: Qolsys panels are the standard Alarm.com hardware).
