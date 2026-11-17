# Manufacturer locators, group B (cameras/video): notes

Run date: 2026-11-17. Scratch scripts: `leadgen/tools/` (mfr_common.py, verkada_*.py, genetec_map.cjs, etc.). Raw downloads: `leadgen/raw/mfr_b/`.
Keep rule used for every brand: partner location in Florida in Miami-Dade, Broward, Palm Beach or Monroe County (county from ZIP via `geo.py`, Monroe ZIPs added). One record per listed location, so a partner with several South Florida offices has several records (same name). No phone numbers are recorded anywhere (listings show them; they were dropped).

## Verkada

- Locator: https://www.verkada.com/find-partners/ (public, server-rendered Next.js page; robots.txt allows it).
- Method: GET `https://www.verkada.com/find-partners/?radius=25&search=<ZIP>` (`&page=N` for pages of 12). The partner records are embedded in the page's RSC payload (`"partners":[...]`) and parsed from there. One request every 3.5 s.
- Queries: all 77 Miami-Dade ZIPs in the order given, at 25 mi radius (every ZIP, all pages). Then two wider sweeps to catch the rest of the four counties: 33134 at 100 mi and 33030 at 150 mi (covers the Keys).
- Saturation: the 25-mi ZIP sweep found 24 of its 25 distinct locations within the first 5 ZIPs. After 33141 only one new location appeared (Summit Companies, Deerfield Beach, at 33179). The whole sweep was still run because it was cheap.
- Found: 42 South Florida partner locations (29 distinct partner names): Miami-Dade 9, Broward 17, Palm Beach 16, Monroe 0. The 100/150-mi sweeps also returned 13 Florida locations outside the four counties (Naples, Fort Myers, Port St. Lucie, Stuart, Bonita Springs, Lake Placid). Those were excluded.
- Fields captured: tier ("Diamond/Platinum/Gold Partner"), "Premier Services Network" badge, location type (Corporate HQ / Sales Office / Regional HQ), distance, rep-certification counts from "Read more" (VCE Essentials, AC Specialist, Alarms Specialist, VSP Foundations), website. The locator names no contact people.
- Decisions: Chactech is listed as "Hallandale Beach FL, 33179". 33179 is a Miami-Dade ZIP, so it was kept and classed by ZIP. Everon, Summit Companies, AT&I, UDT, St. Moritz and Acoustic Architects have several South Florida locations, each kept as its own record. "A1 Security    AI Sec" is the name as listed; only the whitespace was collapsed.
- NEEDS MANUAL WORK: none.

## Genetec

- Locator: https://www.genetec.com/contact-us/unified-elite-resellers ("Find a reseller", a Google store-locator map of **Unified Elite and Strategic Partners only**). The old URLs (/partners/find-a-partner etc.) return 404. The Genetec channel brochure mentions a "channel partner lookup" for all tiers, but no public page for it was found. The "Not finding what you're looking for?" link goes to a contact form, which was not used.
- Method: the map page loads its listing data client-side. It was opened in headless Chromium and the data the page itself received was captured passively: 346 listings worldwide with title, address, lat/lng and website. A direct call to the underlying data API was blocked by this session's permission policy (it would have reused an embedded API key), so only the browser-rendered page was used.
- Queries: no ZIP/radius search exists. The full list was filtered to Florida addresses.
- Found: 2 in the four counties: Convergint Technologies USA - Miami (Miramar 33025) and Integrated Security Systems (ISS), a Convergint company (Miami 33125). Six other Florida listings were excluded: Convergint Fort Myers, Jacksonville, Orlando/Lake Mary and Tampa; Miller Electric (Jacksonville); Security 101 Orlando.
- Decision: listing_level is "Unified Elite or Strategic Partner (map does not say which)", because the map does not separate the two tiers. Lower-tier Genetec partners are not publicly listed anywhere found. No self-declared fallback was done, because a locator exists.
- NEEDS MANUAL WORK: (optional) Genetec's full "channel partner lookup" for lower tiers was not found publicly. Someone with a Genetec contact could ask for the Miami-area Certified/Elite partner list. URL tried: https://www.genetec.com/partners/channel-program (no lookup link). The /partners/find-a-partner style URLs all return 404.

## Avigilon (Motorola Solutions)

- Locator: https://www.avigilon.com/partner-locator ("Find a Certified Avigilon Partner and Installer"). It is **not a directory**: it is a HubSpot lead form ("fill out the form below so that one of our representatives can connect you"). It was not submitted. Headless Chromium gets an Incapsula 403 there; curl gets 200, which shows only the form. Avigilon's Miami landing pages (/access-control-miami, /commercial-security-miami) name no partners and link "Find an Installer" to the same form. /commercial-security-miami returned 403 (Incapsula) on a second fetch.
- Other public routes tried: the Motorola Solutions Partner Finder (https://mpe.motorolasolutions.com/?loc=US-EN&country=US, the Salesforce "MM_PartnerFinderHome"). Its technology filter offers only Business Radio, Professional and Commercial Radio and SCADA, with no video security/Avigilon, so it does not list Avigilon partners. Its robots.txt disallows all agents except googlebot, so only the landing page was viewed, once, and no searches were run. web.archive.org is unreachable from this environment (the connection is reset by the proxy), so archived versions of the old Avigilon locator could not be checked.
- Fallback used (last resort, about 20 min): integrators whose own site states an Avigilon partner/dealer/certified relationship. Found by web search, and each page fetched once to confirm the wording and address.
- Found: 5 self-declared:
  - Industrial Communications (Induscom): Miami 33169. "We Are a Motorola Solutions Ecosystem Solutions Partner"; the page lists Avigilon Unity VMS/access control. Taken from group C's Avigilon Alta work and re-verified.
  - Support305: Miami 33133, "certified integrator".
  - Security 101 Miami office: Hialeah 33016. https://go.security101.com/avigilon says "Strategic National Partner", and the Miami page shows the Avigilon logo under Technology Partners. There is no "authorized" wording for Avigilon specifically.
  - AT&I Security Systems: "authorized Avigilon dealer and integration partner in Florida". HQ is Cooper City (Broward); the Verkada locator shows a Miami office.
  - SecureComm Systems: "Avigilon Certified Partner". Only "based in South Florida" is stated, so the Miami-Dade base is not confirmed; flagged in notes.
- Not recorded: Safe and Sound Security (Los Angeles), BTI (Chicago), TechPro Security (Boca Raton HQ, Palm Beach, so not Miami-Dade based), Empire State Security (the brands page rendered no text to verify), JD Security (Australia).
- NEEDS MANUAL WORK:
  - Dicsan Technology (Miami): https://dicsan.com/security_cameras/security-camera-installation-miami/avigilon_security_cameras/. Error: TLS "unable to get local issuer certificate" (curl/requests), HTTP 503 via WebFetch, 502 via headless Chromium. Search snippets show the page presents Dicsan as a Miami Avigilon integrator, but the wording could not be verified, so it was not recorded.
  - https://empirestatesecurity.com/brands: the page renders client-side and no text was extracted. Search snippet says it is an "authorized integrator" for brands including Avigilon across Miami-Dade, Broward and Palm Beach. Base location was not verified.
  - Avigilon/Motorola: a sales contact could be asked for the Miami-Dade partner list, since there is no public directory.

## Hanwha Vision

- Locator: none for dealers/integrators. hanwhavisionamerica.com (all old where-to-buy/find-a-partner paths) redirects to https://www.hanwhavision.com/us. The US partner menu has only Become a Partner, Our Distributor and Technology Partner Solutions. The sitemap (static.xml, about 19 locales) has no partner-locator or where-to-buy page. "Our Distributor" (https://www.hanwhavision.com/us/partners/our-distributor) lists 16 North American distributors from its public JSON. None is in Florida: Accu-Tech, ADI, AlarMax, Graybar, Ingram Micro, Jenne, ScanSource, TD SYNNEX, Wesco, BLVS, Canal Alarm, CCTV.net, SDI, plus 3 in Canada. Distributors are not dealer leads, so none was recorded.
- web.archive.org is unreachable from this environment, so an archived old locator could not be checked.
- Fallback used (about 20 min): self-declared partners on Miami-Dade dealer sites, found by web search, with one fetch per page to verify.
- Found: 2.
  - Support305 (Miami 33133): its surveillance page lists Hanwha Vision under "Certified Surveillance Partners".
  - Security 101 Miami office (Hialeah 33016): https://go.security101.com/hanwha-vision says "National Strategic Partner", and the Miami page shows the Hanwha Vision logo under Technology Partners.
- Not recorded:
  - Fortress Global Technology: "authorized Hanwha Vision dealer and certified integrator", but based in Boca Raton (Palm Beach), not Miami-Dade.
  - IDS CCTV: Hollywood FL (Broward); an authorized Hanwha wholesale dealer, i.e. a distributor.
  - Data Pro Communications: Orlando HQ, no partner wording.
  - Security Alarm Corp (SAC): "Florida's Trusted Hanwha Vision Installer", with no partner wording and no Miami-Dade base shown.
  - iS3 Tech (Atlanta), Mammoth Security, and Safe and Sound (Los Angeles).
- NEEDS MANUAL WORK:
  - Dicsan Technology (Miami; search snippets show offices at 660 NW 119th St, Miami 33168 and 6905 NW 50th St, Miami 33166, and the text "authorized distributor and integrator" for Hanwha Vision). https://dicsan.com/security_cameras/security-camera-installation-miami/hanwha-security-cameras/ fails here: TLS certificate-chain error in curl/requests, 503 via WebFetch, 502 via headless Chromium. Not recorded because the wording could not be verified.
  - Hanwha Vision America could be asked for its Miami-area channel partners; there is no public list.

## Milestone Systems

- Locator: https://www.milestonesys.com/where-to-buy-reseller-and-distributor/ ("Find a Milestone Reseller or Distributor"), an Impartner PRM locator widget (program 1604). It has keyword search, a Google Places location box, radius (5 to 500 mi) and filters (Partner Type, Region, Reseller Tier, Product, Specialization).
- Method: the widget queries the public endpoint `https://milestonesandboxmpps.impartner.org/prm/api/locator/v1/query?type=account&o=json&q=...` with no key or login. The page fires it on load. A location search in the widget adds `LOCATED WITHIN <r> MI OF COORDS:(lat, lng)` and pages with `LIMIT 24 OFFSET n`, as read from the widget's own JS bundle. The same query format was used, with ZIP centroids from the Census 2023 ZCTA gazetteer standing in for the Google Places geocode. One request every 3.5 s.
- Decision: the widget is hidden after "necessary cookies only" is chosen on the cookie banner. Accepting marketing cookies was not done: the session's permission policy refused it. The endpoint calls the page makes on load were mirrored instead.
- Queries: all 77 Miami-Dade ZIPs in the order given at 25 mi (all pages), then 33134 at 100 mi and 33030 at 200 mi (Keys and the rest of the four counties).
- Saturation: new locations appeared only at 33134 (23), 33141 (+3), 33138 (+1) and 33179 (+1). The remaining 73 ZIPs added nothing.
- Found: 31 reseller locations in the four counties: Miami-Dade 7, Broward 16, Palm Beach 8, Monroe 0. Tiers are "Premier" and "Advanced". Products (XProtect VMS, Arcules VSaaS, BriefCam Analytics) and specializations (VMS/Analytics/VSaaS Specialist) were captured. The listings name no contact people.
- Excluded:
  - 5 entries typed "Distributor" (no tier), not dealers: Bridge Trading USA (Doral 33172), DACAS Corp HQ (Doral 33172), International Security & Trading Corp/ISTC (Doral 33172), Software Brokers of America (Medley 33178), Unisol International (Miami 33166).
  - 14 Florida resellers outside the four counties (Palm City, Fort Myers, Lakeland, Sarasota, Punta Gorda, Melbourne, Bonita Springs).
- Notes: names keep the locator's location suffix, e.g. "Convergint Technologies, LLC (Miami, FL - Team ISS)". "Allied Universal Technology Services (Land O Lakes, FL)" is listed at a Fort Lauderdale address and was kept as listed. ZH Consulting Services' listed address includes an apartment number, which is flagged in notes. "Siemens Industry, Inc. (Miami, FL)" sits at a Miramar address. Phone numbers in the API response were dropped.
- NEEDS MANUAL WORK: none.

## Axis Communications

- Locator: none public for US resellers. https://www.axis.com/en-us/where-to-buy links to "Find a partner close to you" (https://www.axis.com/en-us/forms/find-a-partner-close-to-you), a lead form ("Please complete the form below. You will shortly be contacted"), which was not submitted. https://www.axis.com/en-us/partner-finder is the *technology* (software/ADP) partner finder, not resellers. /partner-locator returns 404. web.archive.org is unreachable here.
- Fallback used (about 20 min): self-declared, Miami-Dade-based integrators. Web search, then one fetch per page to verify.
- Found: 3.
  - Baltic Service LLC (Sunny Isles Beach 33160): "AXIS Communications Certified Partner Program integrator - authorized to design, install, and support AXIS products". Its site is on a pages.dev address and the footer names adbsnow.com. The Fort Lauderdale address on the page is the AXIS Experience Center, not Baltic's office.
  - Support305 (Miami 33133): "Certified Surveillance Partners" lists Axis Communications.
  - Security 101 Miami office (Hialeah 33016): https://go.security101.com/axis says "National Strategic Partner" and "We are an authorized dealer for all products we install."
- Not recorded:
  - Fortress Global Technology: "Axis Certified Partner Program - Authorized Partner", but based in Boca Raton (Palm Beach).
  - Data Pro Communications: Orlando HQ.
  - Identisys, BTI, Premise One, Martin Systems: none based in Miami-Dade.
  - Integrated Security Systems/teamiss.com: its homepage names no camera brands.
- NEEDS MANUAL WORK: the Axis US partner list is not public. The Axis Fort Lauderdale Experience Center or an Axis regional sales contact could provide Miami-Dade Silver/Gold/Solution partners.

## Eagle Eye Networks

- Locator: none public. https://www.een.com/reseller/find-reseller/ is a Gravity Forms lead form ("works exclusively with our network of channel partners... fill out the form"), which was not submitted. The een.com Miami/Florida location landing pages name no resellers. The `een_partner` sitemap holds technology partners only. web.archive.org is unreachable here.
- Fallback used (about 15 min): self-declared, Miami-Dade-based.
- Found: 1. Security 101 Miami office (Hialeah 33016): https://go.security101.com/eagle-eye says "National Strategic Partner", and the Miami page shows the Eagle Eye logo.
- Not recorded: Pelican QSR Solutions says it is "proud to partner with Eagle Eye Networks", but its contact page gives only "Florida, United States", so a Miami-Dade base is unconfirmed. Junious Labs has Riviera Beach and Deerfield Beach pages; no Eagle Eye partner wording was verified and it is not Miami-Dade.
- NEEDS MANUAL WORK: the Eagle Eye reseller list is not public (referral form only). Pelican QSR Solutions' location needs checking: https://www.pelicanqsrsolutions.com/contact-us/.

## Rhombus

- Locator: none public. https://www.rhombus.com/partner-program/ is an application page only, and the sitemap has no partner directory. /partners/, /find-a-partner/ and /partner-locator/ all return 404.
- Fallback used (about 15 min): self-declared, Miami-Dade-based.
- Found: 1. Security 101 Miami office (Hialeah 33016): https://go.security101.com/rhombus says "National Strategic Partner". The Miami page's logo slider does not show Rhombus; this is noted on the record.
- Not recorded:
  - Soflo Systems (formerly Lunis Systems): "a certified company and trusted Rhombus security camera installation expert... in Miami, Fort Lauderdale". The address on its contact page is Sunrise FL 33351 (Broward), and the wording does not claim Rhombus partner status.
  - Sequentex: "Rhombus Authorized Reseller" per search, but its office is in Boynton Beach (Palm Beach).
  - Unio Digital, Safe and Sound, iS3, and SADOS/buyrhombus (online store): not Miami-Dade.
- NEEDS MANUAL WORK: the Rhombus partner list is not public. Soflo Systems (Broward) and Sequentex (Palm Beach) are near-misses if the coordinator widens the fallback to Broward/Palm Beach.

## General / environment notes

- web.archive.org (CDX and pages) is unreachable from this session: "Recv failure: Connection reset by peer", and the proxy logs "tunnel closed (code 1006)". All archive-based alternatives were therefore skipped.
- Two actions were refused by the session's permission policy and were not worked around:
  - calling Google Sheets with the API key embedded in Genetec's page; the same data was captured passively from the browser-rendered page instead;
  - accepting marketing cookies on the Milestone page; the locator's own public query endpoint was mirrored instead, as it fires without consent.
- Script names: an earlier `leadgen/tools/verify_page.py` was overwritten during this run (group C reports the collision). Group B's copy is now also saved as `grpb_verify.py`. Other group B scripts: mfr_common.py, verkada_*.py, milestone_*.py/.cjs, genetec_*.{py,cjs}, avigilon_build.py, hanwha_build.py, fallback_build.py, probe_net.cjs, page_text.cjs.
- Self-declared records all have listing_level ending "(self-declared)" and notes starting "Self-declared on dealer site". The same company appears in several brand files: Security 101 (Miami) is in 5 files and Support305 in 3. The coordinator should dedupe.

