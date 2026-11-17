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
- Other public routes tried: the Motorola Solutions Partner Finder (https://mpe.motorolasolutions.com/?loc=US-EN&country=US, the Salesforce "MM_PartnerFinderHome"). Its technology filter offers only Business Radio, Professional and Commercial Radio and SCADA, with no video security/Avigilon, so it does not list Avigilon partners. web.archive.org is unreachable from this environment (the connection is reset by the proxy), so archived versions of the old Avigilon locator could not be checked.
- Fallback used (last resort, about 20 min): integrators whose own site states an Avigilon partner/dealer/certified relationship. Found by web search, and each page fetched once to confirm the wording and address.
- Found: 4 self-declared:
  - Support305: Miami 33133, "certified integrator".
  - Security 101 Miami office: Hialeah 33016. Avigilon is listed as a strategic/technology partner, with no "authorized" wording.
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
- Found: 1. Support305 (Miami 33133): its surveillance page lists Hanwha Vision under "Certified Surveillance Partners".
- Not recorded:
  - Fortress Global Technology: "authorized Hanwha Vision dealer and certified integrator", but based in Boca Raton (Palm Beach), not Miami-Dade.
  - IDS CCTV: Hollywood FL (Broward); an authorized Hanwha wholesale dealer, i.e. a distributor.
  - Data Pro Communications: Orlando HQ, no partner wording.
  - Security Alarm Corp (SAC): "Florida's Trusted Hanwha Vision Installer", with no partner wording and no Miami-Dade base shown.
  - iS3 Tech (Atlanta), Mammoth Security, and Safe and Sound (Los Angeles).
- NEEDS MANUAL WORK:
  - Dicsan Technology (Miami; search snippets show offices at 660 NW 119th St, Miami 33168 and 6905 NW 50th St, Miami 33166, and the text "authorized distributor and integrator" for Hanwha Vision). https://dicsan.com/security_cameras/security-camera-installation-miami/hanwha-security-cameras/ fails here: TLS certificate-chain error in curl/requests, 503 via WebFetch, 502 via headless Chromium. Not recorded because the wording could not be verified.
  - Hanwha Vision America could be asked for its Miami-area channel partners; there is no public list.

