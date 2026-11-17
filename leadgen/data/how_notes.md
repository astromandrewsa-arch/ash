# Houses of worship segment: Miami-Dade synagogues and Jewish schools (method notes)

Output: `leadgen/data/houses_of_worship.json` (built by `leadgen/tools/how_build.py` from the hand-checked records in
`leadgen/tools/how_records.py`). Research only: no one was contacted, no forms were submitted, and no phone numbers
were recorded (raw saves are phone-redacted; the build step rejects any phone-like string).

## Sources used (all public)

| Source | Route | Result |
| --- | --- | --- |
| Greater Miami Jewish Federation community directory (synagogues: 66; educational institutions: 43) | `jewishmiami.org/resources/community_directory/...` list pages (`results_per_page=100`) plus every detail page, 3.5 s apart | Worked. Names, addresses, denomination, websites. Entries are dated (some submitted 2018) and a few addresses are stale. Federation-listed rabbi names were NOT used as contacts (not the institution's own site). |
| Federation "Find a Rabbi" page | `jewishmiami.org/resources/find_rabbi/` | Worked. Added 12 congregations not in the directory and newer addresses for several. Rabbi names there were not used as contacts. |
| Miami-Dade County Private Schools GIS layer (official county listing) | ArcGIS REST `services.arcgis.com/8Pc9XBTAsYuxx9Ny/.../PrivateSchool_gdb/FeatureServer/0` (phone field never requested) | Worked: 971 schools; about 50 Jewish schools by name. Director name (DIRCTNAME), grades, enrollment used. Data is several years old in places (e.g., Sha'arei Bina and Hochberg have since moved to Broward). |
| CAJE Miami day-school list and Early Childhood (ECE) directory, July 2024 | `caje-miami.org/schools/day/jewish_day_schools/index.html`, `caje-miami.org/schools/early/ECE_Directory.pdf` | Worked. Most current school list; added Pardes, JLA, Lanaar, Tamim, Cheder, JEMS, Miami Jewish Academy, Yotzer Ohr, Bais Yaakov, and ECE programs (Muss Montessori, Moses Montessori, Shalom Montessori, Brumer, Yeladim, Suzy Fischer). |
| OU synagogue finder | public JSON the page itself calls: `schools-api.ouapis.org/public/community-resource?state=FL` (phone fields dropped on save) | Worked: 143 FL entries, 47 in Miami-Dade (synagogues, kollels, schools; mikvahs skipped). OU rabbi names/emails not used as contacts (denominational directory, not the institution's site). |
| URJ congregation finder | all 80 list pages of `urj.org/urj-congregations-communities` (search box returns nothing to GET requests) | Worked: only 4 URJ congregations in Miami-Dade (Temple Beth Sholom, Temple Judea, Temple Sinai of North Dade, Temple Beth Am). |
| USCJ kehilla map | public JSON the page calls: `uscj.org/wp-json/wp/v2/locations` (phones dropped) | Worked: 3 USCJ congregations in Miami-Dade, with size class. |
| Institution websites | `leadgen/tools/how_crawl.py` (requests, home + up to 6 about/staff/contact pages, 3.5 s per host) and `how_pwcrawl.cjs` (headless Chromium for JS sites) | About 95 sites crawled. Contacts, emails, size and security notes come from these pages, with the exact URL in `poc_source`. |
| WebFetch (single page reads) | used for sites that block scripted requests (Fastly 406 on ShulCloud-type sites; Cloudflare challenge on Chabad.org-hosted sites) | Worked for about 20 pages (The Shul, Young Israel of Bal Harbour, Temple Judea, Bet Shira, Temple Menorah, Aventura Chabad staff page, etc.). No CAPTCHA was solved or bypassed. |
| Web search | 6 queries | Used only to find missing institutions and closure news. |

Blocked or not usable:
- chabad.org center directory: Cloudflare challenge (403) to scripts and headless browser; WebFetch gets only the shell (listing is JS-rendered). Chabad centers were taken from the federation directory/Find a Rabbi page instead.
- Prizmah day-school directory (`prizmah.org/school-directory`): 403.
- Florida DOE private-school pages (`fldoe.org`): Akamai "Access Denied" (403). The county GIS layer was used as the official listing instead.
- Young Israel branch list (`youngisrael.org/branches`): empty/JS; OU list covers the Young Israel branches.
- Wayback Machine: connection reset / blocked by egress policy.

## Rules applied
- `poc` only when the person is named on the institution's own website (exact URL in `poc_source`) or in the Miami-Dade County private-school layer (role then says "Director (Miami-Dade County private school listing)").
- `email` only when printed on the institution's own site (Cloudflare-obfuscated addresses on the site were decoded). Department or general addresses preferred; other published addresses are in `notes`.
- `security_notes` only from the institution's own site (staff titles such as Director/Chief of Security, guard counts, security fees, security RFPs).
- `municipality_hint`: from the street address/ZIP; Miami-mailing addresses use the ZIP default from `leadgen/geo.py` with "verify" where a ZIP straddles municipalities (33154 Surfside/Bal Harbour/Bay Harbor Islands; 33160 Sunny Isles/North Miami Beach/Golden Beach; 33180 Aventura/unincorporated Highland Lakes/Ojus).
- Same-campus schools and synagogues are separate records, cross-referenced in `notes` (e.g., Temple Beth Am + Rambam Day School).
- Condominium minyanim from the OU list (Mimosa, Carriage Club, Ocean Pavilion, Yechezkel Shrage, Chevra Shas at Tower 41, Keter Abraham) are included but flagged: building security belongs to the condo association.

## Counts (at last build)
140 records: 92 House of Worship, 48 School. Miami Beach 44, North Miami Beach 28, Aventura 10, Sunny Isles Beach 8, City of Miami 7 (Downtown/Brickell, Midtown, Coconut Grove, Shenandoah), Pinecrest 6, Surfside 5, North Miami 5, unincorporated Highland Lakes 6, Miami Gardens 4, Coral Gables 3, unincorporated Kendall 3, Westchester area 2, and 1 each in Miami Lakes, Cutler Bay, Doral, Key Biscayne, Miami Shores, Palmetto Bay, Homestead, California Club area, Miami Shores area (JLA).
No Jewish congregation or school was found in Hialeah, Bal Harbour (village), Bay Harbor Islands or Golden Beach proper; those communities are served by the Surfside and Sunny Isles Beach institutions.

## Highest-value IRIS targets (published in-house security function or existing cameras)
- The Shul of Bal Harbour (Surfside): Director of Security and Chief of Security named; security@theshul.org.
- RASG Hebrew Academy (Miami Beach): Chief of Security named; security@rasg.org.
- Temple Beth Am + Rambam Day School (Pinecrest): Security Director named.
- Yeshiva Toras Chaim Toras Emes, two campuses (North Miami Beach): fenced, key-card access, "constant video surveillance", 1 and 3 guards.
- Lubavitch Educational Center (5 campuses, Miami Beach + Miami Gardens): Safety & Security Director, security personnel at every building.
- Muss Family Montessori / Temple Emanu-El (Miami Beach): Director of Security, two guards.
- Scheck Hillel Community School: 24/7 campus security guards; 1,100 students.
- Congregation Magen David NMB: published "Physical Security Enhancements" RFP (2023, grant-style).
- Jewish Leadership Academy: Lead Security Officer. Yotzer Ohr Miami: Head of Security listed.
- Temple Sinai of North Dade / Gan Sinai, Pardes Day School: per-family security fees fund on-campus security.
- Temple Beth Sholom: board Security Committee. Miami Beach JCC: Wiesenfeld Family Security Fund. Beit David Highland Lakes: security personnel / fence donation page.

## Excluded (checked, out of scope)
- Temple Israel of Greater Miami (downtown): closed June 2025 (news coverage; site shows only a legacy page). Its ECC and religious school entries in the federation directory are therefore stale.
- Bet Breira Samu-El Or Olom (Kendall): building sold and congregation closed (Community Newspapers); Dor Chadash is now listed at that address.
- Temple Beth Tov (West Miami, SW 8th St): reported closing (news).
- Temple Zion Israelite Center: directory address is a law office; no building found.
- Sha'arei Bina Torah Academy for Girls: now at 2907 Taylor St, Hollywood (Broward).
- Hochberg Preparatory / Posnack East: CAJE lists it at 412 SW 11th St, Hallandale Beach (Broward).
- International Torah Academy (Aventura): online/distance-learning school, no campus.
- Tree of Knowledge Learning Academy: psycho-educational services provider, not a Jewish school.
- Daughters of Israel (2530 Pine Tree Dr): mikvah (county layer mislabels it as a school). Other mikvahs from the OU list skipped.
- Federation education entries that are universities, adult learning, camps, national agencies or Hillels (FIU, UM, Melton, Aish Hollywood, YIVO, Tel Aviv University, etc.).
- KavanahLife singles minyan, B'nai Israel & Greater Miami Youth Synagogue: no address published.
- Possible additions not verified: Greenfield Day School (county layer, 11155 SW 112th Ave on the Alper JCC campus); Jewish Montessori Preschool of Miami (3291 Franklin Ave, website dead); Skylake Hebrew School (supplementary); Beis Menachem of Miami Beach listed at 1015 NE 172nd Terr (may duplicate Bais Menachem NMB).

## NEEDS MANUAL WORK
1. Chabad.org-hosted center sites (Cloudflare challenge to scripts; WebFetch reads only some pages): leadership/email missing for Chabad in South Beach (first names only), Capt. Hyman P. Galbut JLC, Chabad House in Miami Beach (mbjewish.com), Shalom Congregation (mbchabad.com), Bet Ovadia - Chabad of the Grove, Chabad at Midtown, Rok Family Shul - Chabad Downtown, Chabad Key Biscayne, Chabad of Doral, Chabad of Homestead & Cutler Bay, Chabad of Kendall & Pinecrest, Chabad of Palmetto Bay, Chabad of Miami Shores, Chabad Miami Lakes, Chabad of NMB East, Skylake Chabad, California Club Chabad, Chabad Chayil, Chabad of Golden Beach, Chabad Lubavitch of Sunny Isles Beach, Chabad of North Miami. URL pattern for staff pages is `/<site>/templates/articlecco_cdo/aid/<id>/jewish/Our-Staff.htm` (id differs per site); open in a normal browser.
2. Sites returning 403/406/429/503 to scripts and WebFetch: btbrc.org (Beth Torah Benny Rok, a large Conservative campus with early childhood academy), ejsfl.com (Edmond J. Safra Synagogue: TLS error/503), youngisraelaventura.com, kzmnmb.org, tauberacademy.com, wctsynagogue.org (no names on home page), bmnmb.com, chabadsb.com-style redirects.
3. Sites that did not resolve through the proxy (tunnel 502): kasnmb.com (Kehillas Ahavas Shalom), neytz.com, tbsmb.school, hochbergprep.org, jsamiami.org, jmontessori.com, betbreira.org, brickellchabad.com.
4. Address conflicts to confirm: Chabad Miami Lakes (7924 NW 163 Terr vs 16800 NW 83 Pl), Chabad of Kendall (9700 S Dixie Hwy Ste 100 vs 8700 SW 112 St), Chabad of North Miami (2225 NE 121 St vs 12407 Biscayne Blvd), Beit Rambam (200 178th St vs 17700 Collins Ave), Willie & Celia Trump Synagogue (2000 vs 3000 Island Blvd), Lanaar (ATJC campus vs 200 NE 161 St), Pardes/Gan Katan (1211 Marseille Dr vs 7055 Bonita Dr), Dor Chadash (9400 SW 87 Ave vs mailing suite).
5. Municipality checks for ZIPs that straddle lines: 33180 (Aventura vs unincorporated), 33169 (Miami Gardens vs unincorporated: LEC campuses), 33156 (Pinecrest vs unincorporated: Young Israel of Kendall, Chabad of Kendall & Pinecrest), 33161 (Yeshiva Elementary boys campus), 33150 (JLA).
6. Small minyanim listed only by OU or the federation (no website): Biala Center, Torah VeEmunah, Miami Torah Center, Baba Sali, Beth Eliyahu Mani, Zichron Naftali, Kol Eliyahu, Keter Abraham, Lubavitch Congregation, Communaute Francaise, KSpace, Ner Yitzchak, Or Yaacov, Bnei Emunah: confirm they still meet and at what address.
