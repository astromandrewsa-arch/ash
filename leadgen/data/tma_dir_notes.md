# TMA + T3 directories: notes (agent "tma_dir")

Date: 2026-11-17. Outputs: `leadgen/data/tma_members.json` (26 records), `leadgen/data/directories.json` (27 records).
Raw files: `leadgen/raw/tma_dir/` (phone numbers stripped from saved raw text/HTML by `tools/td_redact.py`).
Scripts: `leadgen/tools/td_*` (td_fetch.py, td_render.cjs, td_pw_batch.cjs, td_pw_slow.cjs, td_redact.py,
td_pipl_parse.py, td_si_list_parse.py, td_build_pipl.py, td_build_si_ss.py, td_build_boma.py, td_build_dirs.py,
td_build_tma.py). Rebuild: `python3 tools/td_build_tma.py` and `python3 tools/td_build_pipl.py && python3 tools/td_build_si_ss.py && python3 tools/td_build_boma.py && python3 tools/td_build_dirs.py`.

Rules followed: no phone numbers recorded (search-engine snippets that showed phones were not copied); contact names
only from the listing/tma.us page itself; no emails (none printed on listings); no logins, forms, or challenge solving;
robots.txt checked for every site (tma.us, pipl.systems, securityinformed, sourcesecurity, bomamiamidade.org all allow
the pages used; securityinformed/sourcesecurity ask crawl-delay 5, which was respected); >= 3.5 s between requests per site.

Extra keys used in both JSON files: `flag` (empty = clean Miami-Dade lead; otherwise why it needs care) and, in
tma_members.json, `county`, `tma_evidence`, `evidence_url`, `people`. In directories.json: `directory` (list).
Records are ordered Miami-Dade/unflagged first.

---------------------------------------------------------------------------------------------------------------------
## PART 1: TMA (The Monitoring Association), Florida

### Method and results
(a) Member directory https://my.tma.us/tmamemberdirectory: one plain headless Playwright retry (more than 60 s after the
    coordinator's first attempt) -> HTTP 403 Cloudflare "Performing security verification". Stopped there.
    tma.us's own links for "New Members" (themonitoringassociation.growthzoneapp.com/newtmamembers/...) and
    "Five Diamond Monitoring Centers" (tma.us/programs/fivediamond/five-diamond-designated-companies/ -> redirects to
    my.tma.us/fivediamondmonitoringcenters) are behind the same challenge (403 in curl and Playwright). Not pursued.
(b) Public tma.us pages: read robots.txt (allows all) and the Yoast sitemaps (165 pages, 859 posts). Fetched ~45 key pages
    (Executive Committee & Board, Our Leadership, committees incl. NextGen/AICC/standards, board slate 2026-2028, awards
    pages, past presidents, honorary members, sponsors (2026, OpsTech 2026), IQ program, ASAP, Five Diamond program page,
    AVS-01, operator online graduates, member news, events) and crawled the post archive (keyword-matched posts first;
    see "Coverage" below). Florida items found on tma.us:
    - Board page: Mike Picciola (VP, ADT, Boca Raton FL; re-elected VP 2026-2028), Jay Hauhn (Special Advisor, Hauhn &
      Associates, Hillsboro Beach FL; Bylaws and Ethics co-chair), Don Young (Past President, Everon, Boca Raton FL),
      Ronald D. LaFontaine (Past President, Lighthouse Point FL, no company listed).
    - Committees page: Tiffany Galarza, ADT (AICC co-chair; location not stated).
    - "TMA Welcomes Four New Members" post: M2M Services, Associate Member, Boca Raton FL.
    - Stanley C. Lott Award page: Don Young (ADT, Boca Raton FL, 2022); John Mabry (Ponte Vedra Beach FL, 2004, no company).
    - 2021 Marvel Award post calls ADT "Florida-based" (Leah Page, VP).
    - Operator online graduates list (training, not proof of membership): First Coast Security (Jacksonville),
      NextEra Energy / FPL Corporate Security, Life Safety Monitoring LLC.
    - Sponsors with Florida presence: ADT, Everon, JCI Security Products, Immix, Micro Key, COPS Monitoring.
(c) web.archive.org: one try (CDX query for my.tma.us/fivediamondmonitoringcenters) -> connection reset by the proxy
    after ~10 s. Not retried.
(d) Web search: the search engine has indexed many my.tma.us directory "Details" pages. Their titles/snippets give
    company, city, address and membership type. These were used as evidence (evidence_url = the my.tma.us page;
    tma_evidence says "seen via web-search index only"). The pages themselves were NOT fetched. Snippet-only items
    with no Details page (Guardian Hawk Security, Residence Control EOOD, Alyxx.io, Redwire, Rooney & Associates,
    Life Safety Monitoring) are flagged "weak evidence". One company-site self-claim was added (Prizm Fire & Security:
    "CSAA Five Diamond central station", old wording, flagged). The shared web-search budget ran out (200 calls per turn)
    before more city-by-city searches could be done.

### Counts
26 Florida companies. Miami-Dade: Arco Security Central Station Corp. (Miami 33165, TMA Listed Monitoring - the only
Miami-Dade monitoring/dealer member found), DataRemote (Miami, associate/vendor), Hightower Risk Associates (Miami Beach,
consultant), Prizm Fire & Security (service area incl. Miami-Dade; self-claim). Broward/Palm Beach: ADT, Everon, JCI,
M2M Services, Residence Control, NextEra, Guardian Hawk Security, Hauhn & Associates. Rest of Florida: Criticom
(Longwood), First Coast Security (Jacksonville), Security Alarm Corp (Port Charlotte), MasterVision (Tampa), Scutum
Digital (Tampa, Five Diamond), COPS Monitoring FL center, Life Safety Monitoring, Immix (Tampa), WorkHorse (Palmetto),
VectorFirm (Orlando), Micro Key (Kissimmee), Alyxx.io (Saint Cloud), Redwire (Tallahassee), Rooney & Associates
(Palm Harbor).
People (in `people` on the company record): Picciola, Galarza, Leah Page (ADT); Don Young (Everon); Jay Hauhn.
People with no company (not in JSON): Ronald D. LaFontaine, TMA Past President, Lighthouse Point FL (board page);
John Mabry, Stanley C. Lott Award 2004, Ponte Vedra Beach FL (award page); Robert Bitton, past president, Naples FL
(deceased, memorial post).

### Decisions
- Arco: TMA listing says founded by the Dominguez family (1985). Trade press (Security Sales, Jul 2025) reports Owen
  Security Solutions acquired The Arco Security Group; noted on the record for the coordinator to verify.
- Vendors, consultants and proprietary GSOCs kept (they are Florida TMA members) but flagged "not a dealer".
- National companies with Boca Raton HQ/offices (ADT, Everon, JCI) kept and flagged "national".
- Directory snippets can be stale (search tool reported page age ~1,350 days for some); flagged in tma_evidence wording.

---------------------------------------------------------------------------------------------------------------------
## PART 2: T3 directories (Miami-Dade integrators/dealers)

Inclusion rule: Miami-Dade companies that install/integrate/deal security systems. Excluded locksmiths, manufacturers,
distributors, IT/cyber-only firms, recruiters, guard-only firms. Kept a Broward/Palm Beach listing only when the listing
itself ties it to Miami (name or service area naming Miami-Dade), and flagged it.

### pipl.systems - 10 records
Method: robots.txt allows; plain requests. https://pipl.systems/security-integrators/florida/ shows 10 integrators; the
site has no city pages (checked sitemap.xml: state pages + /company/ pages only). Fetched all 15 Florida /company/
pages found in the sitemap plus Convergint's. Parsed JSON-LD (city/ZIP/website) and page sections (coverage, services,
partners, About text).
Kept: Alarm Brokers of Florida, Circle Security Solutions, Miami Security Systems, Security 101 Miami (Hialeah),
Sytec USA, UTS Florida, SECURE IT LIMITED (Miami 33172; not on the state page, website is a Trinidad site - flagged),
AT&I Miami (Cooper City, Broward - flagged), Hi-Tech Security Cameras (Oakland Park, Broward; serves Miami-Dade -
flagged), Royce Integrated Solutions (Pompano Beach, Broward; serves Miami-Dade - flagged).
Contacts printed on listings: Steve Carulo and Mary Runno (Alarm Brokers co-founders), Gustavo Cardoso (UTS Florida
founder/president), "Lee" (Circle Security, first name only).
Excluded: BAS-IP, Digital Watchdog, IC Realtime, Paxton, STid (manufacturers); Convergint (national, listing address
La Palma CA, listing does not mention Miami).
Note: all pipl profiles except SECURE IT are "unclaimed, created by Pipl Systems"; About text is pipl-written.

### securityinformed.com - 14 records (8 also on sourcesecurity)
Method: curl gets a Cloudflare block page (even robots.txt); headless Playwright loaded robots.txt and the Miami list
(https://www.securityinformed.com/companies/miami-security-companies/directory.html, "45 Found", pages 1-2). Parsed all 45
cards (name, description, city, type, product area). Profile pages: only Intellitech Systems and Beyond Technology loaded
(address + ZIP; no website shown on profiles) before the WAF returned 403 "Attention Required" (blocked after ~3 page
loads, again after a 30-60 s pause).
Kept: Beyond Technology (IT-focused, flagged in notes), E.G. Telecommunications & Technologies, Eyeson, Integrated Security
Systems, Intellitech Systems, iWatchSystems LLC, Kent Security Services, Lunis Systems (AV - flagged), Munway Technology,
Paradyme, Plasco (ID-card reseller - flagged), Saltex Group, XSPONSE (platform? - flagged), Vision Security (listed as
consultant - flagged).
Excluded: AAA Miami Locksmith, Miami Doors & Locks (locksmiths); ACCESSGARD, Amtel, Cias Security, Control Electronic
Security, Cozaint, FortSense, FutureSentry, ILDVR, Netkrom, Phoenix IVS, ProxiGuard, ProxiGuard USA, Smartech, WINK
Streaming, Xtec, Omnitronics (radio dispatch manufacturer), Contronics Technologies (manufacturer per its description),
Blue Eye Video (analytics developer) (manufacturers); Ambar Distributors, ASL Interamerica, Fast Access Security Corp,
Safe Home Security Enterprise, Silmar Electronics (distributors/exporters); ConsorcioTec (buyers' group); Kaseya,
Ransomware Help US (IT/cyber); Cento (recruitment); Center Group Ltd. (UK firm); Millennium Aviation Consulting.

### sourcesecurity.com - 9 records (1 SS-only + 8 shared with securityinformed)
Method: same as above. Playwright loaded robots.txt and https://www.sourcesecurity.com/companies/systems-integrators-florida/directory.html
pages 1-3 (70 Florida integrators; page 3 loaded on the second, slower attempt). Profile pages blocked (403).
Miami-Dade kept: IP Access Video LLC (Doral) plus the 8 shared ones (Beyond Technology, Integrated Security Systems, Kent,
Munway, Paradyme, Plasco, Saltex, XSPONSE; Omnitronics excluded).
Broward/Palm Beach on the Florida page, NOT listed under Miami, so left out of JSON (for reference):
APS 2000 Inc. (Boynton Beach), Champion Solutions Group (Boca Raton), Claro Enterprise Solutions (Miramar), Electrone
Americas (Boca Raton), Gatehouse Solutions (Sunrise), GNM Hough Inc. (Davie), Orbit Communication Systems (Deerfield
Beach), Owl Video Security Systems (Sunrise), SISCO (West Palm Beach), SOS Technologies (Deerfield Beach), The
Millennium Group (West Palm Beach). Their profile URLs are https://www.sourcesecurity.com/companies/<slug>.html.

### BOMA Miami-Dade - 2 records (from the public WordPress site, not the member directory)
Method: members.bomamiamidade.org/member-directory -> Cloudflare challenge (403) in curl and Playwright; web search found
no indexed directory pages. Used www.bomamiamidade.org (robots allows; sitemap): committees page, board page, TOBY
sponsorship page (2025 sponsor list). Kept Kastle Systems (committee member Claudia Grene listed as "Kastle"; 2025 TOBY
sponsor) and Allied Universal (2025 sponsor; guard firm with an integration arm), both flagged.
Other security-named 2025 sponsors left out as guard services / not dealers: Marksman Titan Security Group, Regions
Security Services, Inc., Choice One Protection LLC, Red Coats Inc. (sponsor logos on the 2025-2026 TOBY page are images
only and were not OCR'd).

---------------------------------------------------------------------------------------------------------------------
## NEEDS MANUAL WORK
1. TMA member directory - https://my.tma.us/tmamemberdirectory (filter USA > Florida).
   Error: HTTP 403 Cloudflare "Performing security verification" (curl and headless Chromium).
   Tried: one Playwright retry; tma.us public pages + sitemap; web.archive.org (connection reset); web search of the
   indexed Details pages (partial coverage only). A person in a normal browser should export the Florida list,
   especially Miami-Dade cities (Miami, Doral, Hialeah, Medley, Miami Lakes, Coral Gables, Miami Beach, Homestead).
2. TMA Five Diamond list - https://my.tma.us/fivediamondmonitoringcenters and
   https://my.tma.us/20262027tmafivediamondapprovedcompanies (linked from tma.us/programs/fivediamond/). Same 403 challenge.
3. TMA New Members - https://themonitoringassociation.growthzoneapp.com/newtmamembers/FindStartsWith?term=%23%21 . Same 403.
4. BOMA Miami-Dade member directory - https://members.bomamiamidade.org/member-directory (security / life safety /
   access control categories). Cloudflare challenge 403 (curl + Playwright); not indexed by web search.
5. securityinformed.com / sourcesecurity.com company profile pages (street address, ZIP, website when shown) for the
   Miami records without ZIP, and other Miami list views (systems-integrators-miami, installers-miami,
   resellers-dealers-reps-miami, and Miami-Dade city pages such as Doral/Hialeah if they exist).
   Error: Cloudflare WAF 403 "Attention Required" after ~2-3 page loads per site, also at 30-60 s spacing.
   Tried: Playwright with crawl-delay pacing; one retry after a pause; stopped per rules. Profile URLs are in each
   record's notes.
6. Not finished for budget reasons: more web searches for Florida TMA members on company sites (search budget exhausted).

## Coverage
- tma.us post archive crawl: 271 of 859 posts fetched. All post slugs matching Florida/Miami/Tampa/Boca/Lauderdale,
  award, board, elect, winner, finalist, welcomes, joins, new-member and five-diamond were fetched first; the rest were
  generic news. Crawl stopped for time after the last ~100 generic posts added no new Florida company. Remaining post
  URLs: `leadgen/raw/tma_dir/post_urls_ordered.txt` (resume with `python3 tools/td_fetch.py raw/tma_dir/posts @raw/tma_dir/post_urls_ordered.txt`; it skips files already saved).
- tma.us pages: ~45 of 165 sitemap pages fetched (leadership, committees, awards, sponsors, programs, standards, events);
  the rest are forms, training, and policy pages.
