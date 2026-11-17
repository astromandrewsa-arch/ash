# Manufacturer locators, group C (access control / panels) — notes

Run date: 2026-11-17. Brands: Brivo, Avigilon Alta (formerly Openpath), DMP, Bosch Security (now Keenfinity: Radionix / IQSIGHT / MiCOS), Napco.

General decisions
- Headline finding: none of the five brands publishes a searchable public dealer locator in Nov 2026 (details per brand below). Following the brief, each brand fell back to public alternatives, then to dealers whose OWN website says they are an authorized/certified dealer of the brand and who are based in Miami-Dade ("self-declared on dealer site" in notes). Effort per brand capped at about 20 minutes.
- web.archive.org cannot be reached from this environment (the proxy tunnel closes, and WebFetch refuses the host), so archived copies of old locators could not be checked.
- Self-declared records: listing_url is the dealer page that states the authorization. listing_level holds the dealer's own wording plus "(self-declared)". No phone numbers recorded. Emails only where printed in plain text on that page. Contact names left blank: no locator named anyone, and enrichment is the coordinator's job.
- Strict geography for self-declared records: only firms with a Miami-Dade address. Firms that only say they serve South Florida from elsewhere are listed under "near misses", not in the JSON.

## Brivo
- Locator URL: none exists. Checked https://www.brivo.com/ navigation and footer, https://www.brivo.com/sitemap.xml (page-sitemap: no dealer/locator page), https://www.brivo.com/contact/ (lead form only, which we may not submit), /find-a-dealer/ and /dealer-locator/ (404), and explore.brivo.com partner pages (recruiting reseller partners only). Web search also found only a sales-request form ("a Brivo team member will connect you with the local dealer").
- robots.txt: Crawl-delay 10. Kept 10 s or more between brivo.com requests.
- Method: last-resort self-declared search (web search for Brivo + Miami/Doral/Hialeah/South Florida, then a check of each dealer's own page).
- ZIPs queried: n/a (no locator).
- Count saved: 3 (mfr_brivo.json): Alarm Brokers of Florida (Doral), York Security Solutions (Miami Beach), Security 101 - Miami (Hialeah).
- Near misses, not saved: Grid Squared (gridsquared.com/brivo-south-florida: "Brivo Access Control Dealer ... Southern Florida", but its address is Long Island City, NY). Dzinex Consulting (dzinex.odoo.com/access-control: "Brivo & PDK certified partner and installer"; no address on its site, so location unknown). FlyLock Security Solutions (national franchise; Brivo is "a trusted partner of FlyLock locations"; no Miami-Dade location confirmed). Whitehats LLC is in Dubai. Safe and Sound Security and BTI are national firms with no Miami office.
- NEEDS MANUAL WORK:
  - https://www.brivo.com/contact/ : there is no locator, only a sales/lead form. A human could ask Brivo partner sales for its Miami-Dade dealer list. Tried: site navigation, sitemap, URL probes, web search.
  - web.archive.org for old Brivo dealer pages: unreachable from this environment.

## Avigilon Alta (formerly Openpath)
- Locator URL: https://www.avigilon.com/partner-locator (the Miami page https://www.avigilon.com/access-control-miami links its "Find a Partner" / "Find an Installer" buttons there). It is no longer a searchable locator: the page reads "Get connected with a Certified Partner today. Please fill out the form below, so that one of our representatives can quickly connect you." That is a lead form, which the rules say we may not submit. Its distributor locator lists distributors, not dealers.
- Access: www.avigilon.com returns an Imperva/Incapsula bot challenge (HTTP 403) to both curl and headless Playwright. We did not bypass it. Page text was read through the WebFetch tool only.
- Also checked: openpath.com (301 to avigilon.com, no installer finder). Motorola Solutions Partner Finder (https://mpe.motorolasolutions.com/?loc=US-EN&country=US): its robots.txt disallows all user agents except googlebot, and its technology filter covers only radio and SCADA, not Video Security & Access Control. Not used.
- Method: last-resort self-declared search (web search for Avigilon Alta / Openpath / Avigilon + Miami-area cities, then a check of each dealer's page).
- ZIPs queried: n/a.
- Count saved: 5 (mfr_avigilonalta.json): AT&I Systems (Miami office; Broward HQ), Alarm Brokers of Florida (Doral; Openpath wording), Industrial Communications / Induscom (Miami; Motorola ecosystem partner selling Alta), Support305 (Miami; Avigilon video, not Alta-specific), Security 101 - Miami (Hialeah; Avigilon on its partner list).
- Decision: Avigilon video/Unity self-declarations are included, with listing_level saying "not Alta-specific". Same Motorola/Avigilon channel, and video dealers are relevant to IRIS. The coordinator can filter on listing_level.
- Near misses, not saved: Dicsan Technology (Miami; has an "Avigilon security cameras" page, but its TLS chain fails and WebFetch got 503, so the claim is unverified). BTI and Safe and Sound Security are national firms with no Miami office.
- NEEDS MANUAL WORK:
  - https://www.avigilon.com/partner-locator : lead form, not a list, and the site is behind an Incapsula challenge (403). Tried curl, headless Playwright (403 challenge page) and WebFetch (text only, no form or results). A human could ask Avigilon/Motorola for its Miami-Dade certified Alta partners.
  - https://dicsan.com/security_cameras/security-camera-installation-miami/avigilon_security_cameras/ : TLS verify failure (curl and requests) and 503 through WebFetch. Check Dicsan's Avigilon status by hand.

## DMP (Digital Monitoring Products)
- Locator URL: none for dealers. https://www.dmp.com/sales-directory ("Sales Directory", which DMP's international page cites for finding a U.S. dealer) only maps DMP's own regional sales managers, and its "Find Your Distributor" table covers countries outside the U.S. /buy and /dealer-locator return 404. Sitemap (https://www.dmp.com/sitemaps-1-sitemap.xml and its children) has no dealer-locator page, only become-a-dealer, Dealer Admin logins and dealer roundtable events. Residential and commercial pages have no find-a-dealer link. robots.txt allows these pages.
- Method: last-resort self-declared search (web search for DMP dealer + Miami-area cities, Virtual Keypad, XR-series panels).
- ZIPs queried: n/a.
- Count saved: 2 (mfr_dmp.json), both weak: Miami Security Systems (vague "authorized dealer" wording, no street address) and World Security & Electric (its DMP-dealer page now redirects to Pye-Barker Fire & Safety, Doral; claim seen only in the search-index copy and a MapQuest listing).
- Near misses, not saved (outside Miami-Dade or not a dealer claim): Sentry Security, Inc. (Sunrise, Broward; services DMP, Bosch, Napco and covers Miami-Dade; https://sentrysecurityfl.com/). AFA Protective Systems (Davie, Broward; "Manufacturer Partners" pages; https://afap.com/our-company/locations/south-florida-fire-alarms/). Signature Systems (Casselberry, Central FL; authorized DMP dealer). Safe and Sound Security, Nexlar, BTI and Unio Digital are national or out-of-state.
- NEEDS MANUAL WORK:
  - https://www.dmp.com/sales-directory : no public dealer search. DMP Inside Sales (insidesales@DMP.com, published on dmp.com) or the Florida regional sales manager could supply a Miami-Dade dealer list. Not contacted (rules forbid it).
  - https://wsefs.com/ : now redirects to pyebarkerfs.com. Confirm whether the Pye-Barker Doral branch still sells DMP.

## Bosch Security (Bosch Building Technologies product business, now Keenfinity Group)
- Context: Bosch sold its security and communications product business to Triton (completed July 2025). It now trades as Keenfinity Group, split into IQSIGHT (video), Radionix (intrusion, the former Bosch B/G-series panels) and MiCOS (access control). boschsecurity.com/us/en/* 301-redirects to keenfinity-group.com. Bosch Building Technologies North America (boschbuildingtechnologies.com/na) is Bosch's own integration and services arm, not a dealer network.
- Locator URL: no dealer or partner finder exists for the US.
  - https://www.keenfinity-group.com/us/en/support/customer-service/faq/ says products are sold "through a dealer network of trained installers". The only online locator it offers is for Keenfinity's own sales reps (https://www.keenfinity-group.com/us/en/support/contact-us/#salesrep). /us/en/partners/ returns 404.
  - https://www.radionix.com/us/en/where-to-buy/ (rendered with Playwright) lists distributors only (ADI, AlarMax, Graybar, IML, Scansource, SDS, Silmar, Wesco/Anixter and others), not dealers.
  - IQSIGHT (https://www.iqsight.com/sitemap.xml) has partner-program, technology-partner and partner-login pages only. No integrator finder.
- Method: last-resort self-declared search.
- ZIPs queried: n/a.
- Count saved: 2 (mfr_bosch.json): Convergint - Miami (Bosch on Convergint's company-wide technology-partner page) and Guardian Electronics, Inc. ("We recommend and represent ... Bosch"). Guardian's site gives no street address, but its service lists lead with Miami and Doral, so it is probably Miami-Dade-based; flagged in notes.
- Near misses, not saved (not Miami-Dade-based, or claim not on own site):
  - Empire State Security, Plantation FL (Broward). https://empirestatesecurity.com/brands says "As an authorized integrator for every brand listed above", listing Bosch, Napco Security Technologies and Avigilon, each "integrator serving Miami-Dade County, Broward County, Palm Beach County". Strong lead if Broward is acceptable; email sales@empirestatesecurity.com.
  - Check Mate Electronics, Fort Lauderdale (Broward): "Bosch dealer for over 26 years", but only in a Blue Book directory listing. Own site not found.
  - York Security Solutions (Miami Beach): a SourceSecurity directory lists Bosch among its partners, but its own site does not now mention Bosch. Kept only under Brivo.
  - AFA Protective Systems (Davie, Broward) and Sentry Security (Sunrise, Broward) list Bosch among manufacturers they partner with or service.
  - Westcoast Communication Services: "Authorized Dealer of ... Honeywell, DSC, and Bosch", but based in Tampa (out of range).
- NEEDS MANUAL WORK:
  - https://www.keenfinity-group.com/us/en/support/contact-us/#salesrep : the sales-rep locator could identify the South Florida Keenfinity/IQSIGHT/Radionix rep, who may share a dealer list. Not contacted.
  - web.archive.org copies of the old boschsecurity.com US partner pages: unreachable from this environment.

## Napco Security Technologies (incl. StarLink, Napco Access Pro / Continental Access, Marks USA, Alarm Lock)
- Locator URL: no dealer locator.
  - https://napcosecurity.com/contact-us/ and https://napcosecurity.com/sales/ list Napco's own sales staff and reps by region, plus a distributor map ("Find A Distributor"). Napco's support FAQ also points dealer requests to the regional sales rep.
  - https://napcosecurity.com/sales/distributors lists distributors only, such as Miami branches of distributors. These are not installers.
  - https://napcoaccesspro.com/ (Continental Access) has dealer-program and become-a-dealer pages only.
  - https://alarmlock.com/ and https://marksusa.com/ have "Find A Distributor" (/sales/) only.
  - http://www.connectedhome.net/ (iBridge) has a dealer sign-up only.
- Method: last-resort self-declared search.
- ZIPs queried: n/a.
- Count saved: 1 (mfr_napco.json): Guardian Electronics, Inc. ("represent ... Napco Fire Alarm", Napco/StarLink communicators). Base address not on its site; probably Miami-Dade (see the Bosch note).
- Near misses, not saved (not Miami-Dade-based):
  - Fortress Global Technology, Boca Raton FL 33433 (Palm Beach). https://fortressgt.com/brands/napco/ is titled "Authorized Napco Security Products Dealer & Integrator", and its Locations menu includes Miami-Dade. Its Brand Partners section may also list other group-C brands.
  - Empire State Security, Plantation (Broward): "authorized integrator" for Napco Security Technologies, serving Miami-Dade (see Bosch).
  - Sentry Security, Sunrise (Broward): services Napco.
- NEEDS MANUAL WORK:
  - https://napcosecurity.com/sales/ : no dealer search. Napco's Florida rep firm or regional sales manager (listed on that page) could supply Miami-Dade dealers. Not contacted.

## Cross-brand near misses worth the coordinator's review (Broward/Palm Beach firms that claim the brands and serve Miami-Dade)
- Everon (former ADT Commercial), Miramar office (Broward), with service pages for Dade County and Hialeah (https://everonsolutions.com/about/company-information/locations/fl/miramar/dade-county). Its product-vendors page (https://www.everonsolutions.com/product-vendors) lists DMP, Brivo, Bosch, and Motorola Solutions/Avigilon. Not Miami-Dade-based, so not saved.
- Empire State Security (Plantation): Bosch, Napco, Avigilon. Fortress Global Technology (Boca Raton): Napco. AT&I Systems is saved under Avigilon because it has a Miami office.

## Overall
- Totals saved: Brivo 3, Avigilon Alta 5, DMP 2, Bosch 2, Napco 1. Every record is "self-declared on dealer site", because none of the five manufacturers offers a usable public dealer locator for the US.
- Helper scripts: leadgen/tools/grpc_verify.py, grpc_pw_dump.cjs and mfr_c_save.py (the save helper rejects phone-like strings). Other agents overwrote shared tool names (verify_page.py, pw_dump.cjs) during this run, so group C switched to the grpc_* names.
