"""how_records.py: hand-curated records for leadgen/data/houses_of_worship.json (Miami-Dade synagogues and Jewish schools).
Every value was read from the cited public page. Person names only from the institution's own website or the
Miami-Dade County public private-school GIS layer (official county listing). No phone numbers anywhere.
"""
FED_S = 'https://jewishmiami.org/resources/community_directory/synagogue_rabbi/'
FED_E = 'https://jewishmiami.org/resources/community_directory/educational_institutions/'
OU = 'https://www.ou.org/synagogue-finder/ (public API schools-api.ouapis.org/public/community-resource, state=FL)'
URJ = 'https://urj.org/urj-congregations-communities'
USCJ = 'https://uscj.org/network/ (public endpoint uscj.org/wp-json/wp/v2/locations)'
MDC = 'https://services.arcgis.com/8Pc9XBTAsYuxx9Ny/arcgis/rest/services/PrivateSchool_gdb/FeatureServer/0 (Miami-Dade County Private Schools layer)'

R = []


def add(name, btype, denom, addr, muni, zip_, web, email='', poc='', role='', pocsrc='', size='', sec='', src='', notes=''):
    R.append({'name': name, 'business_type': btype, 'denomination': denom, 'address_city': addr,
              'municipality_hint': muni, 'zip': zip_, 'website': web, 'email': email, 'poc': poc,
              'poc_role': role if poc else '', 'poc_source': pocsrc if poc else '', 'size_signal': size,
              'security_notes': sec, 'source_url': src, 'notes': notes})


H, S = 'House of Worship', 'School'

# ---------------- Miami Beach: synagogues ----------------
add('Temple Beth Sholom', H, 'Reform', '4144 Chase Avenue, Miami Beach, FL', 'Miami Beach', '33140', 'https://tbsmb.org/',
    'info@tbsmb.org', 'Rabbi Gayle Pomerantz', 'Rabbi (clergy page lists her first; also Jeff Graff, Executive Director, on staff page)',
    'https://tbsmb.org/discover/clergy/', '',
    'Board page says Vice President Larry Hurwitz is co-chair of the Security Committee (https://tbsmb.org/discover/board/).',
    'https://tbsmb.org/ ; ' + URJ + ' ; ' + FED_S + 'temple_beth_sholom',
    'URJ member. Campus also houses the Innovative School of Temple Beth Sholom (separate record). Executive Director Jeff Graff (jeff@tbsmb.org) per https://tbsmb.org/staff/. County polling place.')
add('Temple Emanu-El of Miami Beach', H, 'Conservative', '1701 Washington Avenue, Miami Beach, FL', 'Miami Beach', '33139', 'https://www.tesobe.org/',
    'paula@tesobe.org', 'Rabbi Liora Ramati', 'Rabbi', 'https://www.tesobe.org/clergy-staff-and-leadership.html', 'Historic: history page says membership once surpassed 1,300 families (current size not stated).',
    'Campus school Muss Family Montessori reports two security guards and a Director of Security (https://mussmontessori.org/staff/).',
    'https://www.tesobe.org/contact-us.html ; ' + FED_S + 'temple_emanuel',
    'Executive Director Paula Arias Dorado (paula@tesobe.org) per clergy/staff page; rabbi email rabbiliora@tesobe.org. Large historic sanctuary in South Beach.')
add('Cuban Hebrew Congregation of Miami (Temple Beth Shmuel)', H, 'Conservative', '1700 Michigan Avenue, Miami Beach, FL', 'Miami Beach', '33139', 'https://cubanhebrew.com/',
    '', 'Josephine Casillas', 'CHCM-TBS President', 'https://cubanhebrew.com/leadership', 'Founded 1961; two buildings on site (small synagogue at 1700 Michigan Ave and large synagogue at 1701 Lenox Ave) per history page.',
    '', 'https://cubanhebrew.com/about-us ; ' + FED_S + 'cuban_hebrew_congregation_temple_beth_shmuel',
    'Leadership page also lists Rachelle Nelson (Rabbi Cantor, Kehillah on the Beach) and Marc Lamb (Baal Tefillah). No email published on site (contact form only).')
add('Beth Israel Congregation', H, 'Orthodox', '770 West 40th Street, Miami Beach, FL', 'Miami Beach', '33140', 'https://bethisraelmiami.org/',
    'info@bethisraelmiami.org', 'Rabbi Donald Bixon', 'Rabbi', 'https://bethisraelmiami.org/about', 'Over 230 member families (about and membership pages).', '',
    'https://bethisraelmiami.org/about ; ' + OU + ' ; ' + FED_S + 'beth_israel',
    'Merged with Young Israel of Miami Beach in January 2012 (about page). OU member synagogue.')
add('Shaare Ezra Sephardic Congregation', H, 'Sephardic Orthodox', '945 West 41st Street, Miami Beach, FL', 'Miami Beach', '33140', 'https://www.shaareezra.com/',
    'officeshaareezra@gmail.com', 'Rabbi Yitzchak Shifman', 'Assistant Rabbi (leadership page "Our Staff")', 'https://www.shaareezra.com/leadership', '', '',
    'https://www.shaareezra.com/ ; ' + OU + ' ; ' + FED_S + 'shaare_ezra_sephardic_congregation', '')
add('Ahavas Torah', H, 'Orthodox', '424 West 40th Street, Miami Beach, FL', 'Miami Beach', '33140', 'https://www.ahavastorahmb.com/',
    'info@ahavastorahmb.com', 'Rabbi Tzvi Neuhaus', 'Rabbi (quoted on home page as the shul\'s rabbi)', 'https://www.ahavastorahmb.com/', '', '',
    'https://www.ahavastorahmb.com/contact/ ; ' + OU, 'Torah center and Orthodox synagogue; women\'s mikvah listed on site.')
add('Bais Menachem (Beis Menachem) of Miami Beach', H, 'Chabad', '444 West 40th Street, Miami Beach, FL', 'Miami Beach', '33140', 'https://baismenachem.org/',
    'events@baismenachemmb.com', 'Rabbi Yehuda Leib Schapiro', 'Rav (home page: "Under the leadership of ... Rabbi Yehuda Leib Schapiro")', 'https://baismenachem.org/', '', '',
    'https://baismenachem.org/contact ; ' + FED_S + 'beis_menachem', 'Federation lists domain BM444.org (redirects to baismenachem.org).')

# ---------------- Miami Beach: schools ----------------
add('Rabbi Alexander S. Gross Hebrew Academy (RASG Hebrew Academy)', S, 'Modern Orthodox', '2400 Pine Tree Drive, Miami Beach, FL', 'Miami Beach', '33140', 'https://www.hebrewacademymiami.org/',
    'security@rasg.org', 'Lisa Stroll', 'Head of School', 'https://www.hebrewacademymiami.org/about/', '670 students and growing (home page); PK-12; county layer enrollment 572.',
    'Website staff list names a Chief of Security (Kfir Lebovich) with security@rasg.org (https://www.hebrewacademymiami.org/about/).',
    'https://www.hebrewacademymiami.org/about/ ; ' + MDC + ' ; ' + FED_E + 'hebrew_academy_RASG', 'Founded 1947. Strong IRIS fit: in-house security function.')
add('Lehrman Community Day School', S, 'Community (pluralistic)', '727 Lehrman Drive (77th Street), Miami Beach, FL', 'Miami Beach', '33141', 'https://www.lehrmanschool.org/',
    'info@lehrmanschool.org', 'Jodi Bruce', 'Head of School', 'https://www.lehrmanschool.org/about/', 'K-5 (site); county layer PK-05, enrollment 307; capital campaign for a new 27,000 sq ft building (home page).', '',
    'https://www.lehrmanschool.org/ ; ' + MDC + ' ; ' + FED_E + 'lehrman_community_day_school', '')
add('Yeshiva Elementary School - Girls Campus', S, 'Orthodox', '7902 Carlyle Avenue, Miami Beach, FL', 'Miami Beach', '33141', 'https://yeshivaelementary.com/',
    'yespress@yeshivaelementary.com', 'Rabbi Dovid Nathan', 'Executive Director', 'https://yeshivaelementary.com/about/', 'About page: approximately 800 students (whole school); county layer (Carlyle Ave) PK-05 enrollment 390.', '',
    'https://yeshivaelementary.com/about/ ; ' + MDC, 'Girls Division principal Mrs. Shani Stein; Aderes Girls Middle School principal Mrs. Miriam Deitsch (about page). Boys campus is a separate record.')
add('Talmudic University of Florida (Yeshiva Beit Moshe Chaim)', S, 'Orthodox', '4000 Alton Road, Miami Beach, FL', 'Miami Beach', '33140', 'https://www.talmudicu.edu/',
    'info@talmudicu.edu', 'Rabbi Yochanan Zweig', 'Rosh Yeshiva / founder (named on home page)', 'https://www.talmudicu.edu/', 'Home page: founded 1974, serving over 1,000 students from preschool through college (network).', '',
    'https://www.talmudicu.edu/ ; ' + MDC + ' ; ' + OU, 'Campus also hosts the Mechina of South Florida high school and a synagogue/beis medrash (OU lists it as a synagogue).')
add('Mechina of South Florida (Mesivta of Greater Miami)', S, 'Orthodox', '4000 Alton Road, Miami Beach, FL', 'Miami Beach', '33140', 'https://www.mechinasf.com/',
    'office@mechinasf.com', 'Rabbi Nisson Friedman', 'Rosh Mechina', 'https://www.mechinasf.com/staff', 'High school (grades 9-12); county layer lists Talmudic University Mechina High School enrollment 87.', '',
    'https://www.mechinasf.com/contact ; ' + FED_E + 'mechina_of_south_florida__mesifta_of_greater_miami ; ' + MDC,
    'On the Talmudic University campus. General Studies Principal Rabbi Eleazer Durden (staff page).')

add('Yeshiva Elementary School - Boys Campus (and Yeshiva Middle School)', S, 'Orthodox', '13300 Memorial Highway, Miami, FL', 'North Miami', '33161', 'https://yeshivaelementary.com/',
    'yespress@yeshivaelementary.com', 'Rabbi Elchanan Zweig', 'Principal - Boys Division', 'https://yeshivaelementary.com/about/',
    'About page: approximately 800 students across the school; Yeshiva Middle School (Menahel Rabbi Yosef Zemel) shares this campus.', '',
    'https://yeshivaelementary.com/contact/ ; ' + MDC, 'Executive Director Rabbi Dovid Nathan covers both campuses. Mailing city Miami (33161); municipality inferred from ZIP, verify (North Miami vs. unincorporated).')
add('Lubavitch Educational Center - Yeshiva Gedolah Miami (Lubavitch Headquarters)', S, 'Chabad', '1140 Alton Road, Miami Beach, FL', 'Miami Beach', '33139', 'https://lecfl.com/',
    'administrator@ygmiami.com', 'Rabbi Yehuda Leib Schapiro', 'Rosh Yeshiva, Yeshiva Gedolah Rabbinical College', 'https://lecfl.com/contact/',
    'LEC network: over 2,300 students across several campuses (about page); county layer lists Yeshiva Gedolah enrollment 141.',
    'LEC about page: "Each building is tightly secured by expert safety and security personnel which also includes an on-site EMT"; contact page names Mr. Zalman Myer-Smith as Safety & Security Director (network-wide).',
    'https://lecfl.com/about/ ; ' + MDC + ' ; ' + FED_S + 'beis_hamedrash_levi_yitzchok',
    'Same address hosts Beis Hamedrash Levi Yitzchok synagogue and Friends of Lubavitch of Florida (federation directory). Menahel Rabbi Chaim Stern; Administrator Mrs. Melissa Korf.')
add('Chevra Shas of Tower 41', H, 'Orthodox', '4101 Pine Tree Drive, Miami Beach, FL', 'Miami Beach', '33140', 'https://www.chevrashas.org/',
    '', 'Menashe Teitelbaum', 'President (Chevra Shas Board)', 'https://www.chevrashas.org/', '', '',
    'https://www.chevrashas.org/ ; ' + OU, 'Minyan located inside the Tower 41 condominium building (site: "Chevra Shas @ Tower 41"); building security likely run by the condo association.')
add('Miami Beach Community Kollel', H, 'Orthodox', '3767 Chase Avenue, Miami Beach, FL', 'Miami Beach', '33140', 'https://www.miamikollel.com/',
    'office@miamikollel.com', '', '', '', 'About page: founded 1995; fifteen full-time kollel scholars (Yungeleit) with daily shiurim; open beis medrash.', '',
    'https://www.miamikollel.com/contact ; ' + OU, 'Torah study center/beis medrash next to Beth Israel Congregation (site parking note). Site names Rabbi Yekusiel Stern and Rabbi Yaakov Feuer only as chavrusa-program contacts.')
add('Congregation Ohr Chaim', H, 'Orthodox', '317 West 47th Street, Miami Beach, FL', 'Miami Beach', '33140', 'https://ohrchaim.org/',
    '', '', '', '', '', '', 'https://ohrchaim.org/ ; ' + OU + ' ; ' + FED_S + 'ohr_chaim',
    'Site lists shiurim by Rabbi Friedman and Rabbi Janowski but states no titles; no email published (contact form only).')
add('Temple Moses - Sephardic Congregation of Florida', H, 'Sephardic Orthodox', '1200 Normandy Drive, Miami Beach, FL', 'Miami Beach', '33141', 'https://www.templemoses.com/',
    '', '', '', '', 'Founded 1968 by Cuban Jewish refugees (home page).', '', 'https://www.templemoses.com/ ; ' + OU + ' ; ' + FED_S + 'temple_moses_sephardic_congregation_of_florida',
    'Site has no names or email (phone/contact only).')
add('The Shul of Bal Harbour', H, 'Chabad', '9540 Collins Avenue, Surfside, FL', 'Surfside', '33154', 'https://www.theshul.org/',
    'security@theshul.org', 'Rabbi Zalman Lipskar', 'Senior Rabbi', 'https://www.theshul.org/aboutus',
    'About page: "thousands strong", over 9 daily minyanim and over 78 programs; campus includes preschool, Hebrew school, CYS College, mikvah.',
    'About page lists Ariel Shlezinger (Director of Security), Aaron Hall (Chief of Security) and security@theshul.org.',
    'https://www.theshul.org/aboutus ; ' + FED_S + 'shul_bal_harbour ; ' + OU,
    'Read via WebFetch (site blocks scripted requests). Facility Manager Rabbi Shlomie Katan; CFO/COO Jeff Fried. Serves Bal Harbour, Bay Harbor Islands, Indian Creek and Surfside. Strong IRIS fit.')
add("The Shul's Child Enrichment Center (The Shul Pre-School)", S, 'Chabad', '9540 Collins Avenue, Surfside, FL', 'Surfside', '33154', 'https://www.theshulpreschool.org/',
    'office@theshulpreschool.org', 'Chana Lipskar', 'The Shul Pre-School Director', 'https://www.theshul.org/aboutus', 'County layer: PK-KG.',
    'Same campus as The Shul of Bal Harbour (in-house Director and Chief of Security).', 'https://www.theshulpreschool.org/contact/ ; ' + MDC, 'On The Shul campus; separate record for the school program.')
add('Young Israel Congregation of Bal Harbour (Surfside)', H, 'Orthodox', '9580 Abbott Avenue, Surfside, FL', 'Surfside', '33154', 'https://www.yicbh.org/',
    'rabbi@yicbh.org', 'Rabbi Gidon Moskovitz', 'Rabbi', 'https://www.yicbh.org/contact-us', '', '',
    'https://www.yicbh.org/contact-us ; ' + OU + ' ; ' + FED_S + 'young_israel_of_bal_harbour',
    'Read via WebFetch (site returns 406 to scripts). President Israel Kopel; other published emails yakira@yicbh.org, florence@yicbh.org, gabbai@yicbh.org. OU member.')
add('Hechal Shalom Or Oziel Sephardic Congregation', H, 'Sephardic Orthodox', '310 95th Street (2nd floor), Surfside, FL', 'Surfside', '33154', 'https://hechalshalom.org/',
    'info@hechalshalom.org', '', '', '', '', '', 'https://hechalshalom.org/ ; ' + OU,
    'Second-floor space above a retail store (site). Serves Bal Harbour, Bay Harbor Islands, Indian Creek and Surfside. Also board@hechalshalom.org.')
add('Kesher (KWK Academy) - Jewish special-needs school', S, 'Jewish community (Orthodox-affiliated)', '18900 NE 25th Avenue, North Miami Beach, FL', 'North Miami Beach', '33180', 'https://www.kwkacademy.com/',
    'info@kwkacademy.org', 'Rabbi Ezra Levy, Ed.D.', 'Executive Director / Head of School', 'https://www.kwkacademy.com/administration/',
    'Site: "the largest program of its kind in the US"; county layer grades 01-12, enrollment 36.', '', 'https://www.kwkacademy.com/ ; ' + MDC + ' ; ' + FED_E + 'kesher_ld_inc',
    'Located on the MAR-JCC (Sanford L. Ziff) campus. Mailing address on the MAR-JCC campus; municipality hint from ZIP (Aventura/North Miami Beach area).')
add('Scheck Hillel Community School', S, 'Community (pluralistic)', '19000 NE 25th Avenue, North Miami Beach, FL', 'North Miami Beach', '33180', 'https://www.ehillel.org/',
    'board@ehillel.org', 'Rabbi Ari Leubitz', 'Head of School', 'https://www.ehillel.org/about/leadership', 'Careers page: 1,100 students, 200+ faculty and staff; PK-12.',
    'Careers page lists "24/7 campus security guards".', 'https://www.ehillel.org/about/career-opportunities ; ' + MDC + ' ; ' + FED_E + 'samuel_scheck_hillel', '')
add('Michael-Ann Russell JCC (MAR-JCC) and Early Childhood Academy', S, 'JCC (community)', '18900 NE 25th Avenue, North Miami Beach, FL', 'North Miami Beach', '33180', 'https://marjcc.org/',
    'info@marjcc.org', 'Alan Sataloff', 'Chief Executive Officer', 'https://marjcc.org/staff-directory/', 'Site: 6,000 members and non-member participants; offers preschool, after-school care, fitness, sports, arts.', '',
    'https://marjcc.org/ ; ' + MDC + ' ; ' + FED_E + 'michaelann_russell_jewish_community_center_on_the_sanford_l._ziff_campus',
    'JCC campus (Sanford L. Ziff campus) that also hosts Kesher; typed School for its early-childhood academy.')
add('The Gan Frida (Chabad Russian Center preschool)', S, 'Chabad', '2221 NE 171st Street, North Miami Beach, FL', 'North Miami Beach', '33160', 'https://www.thegan.com/',
    'office@thegan.com', 'Chanie Kaller', 'Head of School', 'https://www.thegan.com/staff/', '', '', 'https://www.thegan.com/about/ ; ' + FED_E + 'the_gan',
    'Second location listed at 488 Sunny Isles Blvd (Chabad Russian Center). Dean: Rabbi Alexander Kaller. Federation lists an older address (18831 NE 25th Ave).')
add('Yeshiva of Miami', S, 'Orthodox', '1010 NE 173rd Street, Miami, FL', 'North Miami Beach', '33162', 'https://www.yeshivaofmiami.net/',
    'office@yeshivaofmiami.net', 'Rabbi Dovid Wechsler', 'Rosh Mesivta / Head of School', 'https://www.yeshivaofmiami.net/', 'County layer: grades 08-12.', '',
    'https://www.yeshivaofmiami.net/ ; ' + MDC, 'Address from county layer (site shows none). Principal: Rabbi Dr. Chaim Benhamou (home page).')

# ---------------- Miami Beach: batch 3 ----------------
add('Ohev Shalom Congregation', H, 'Orthodox', '7055 Bonita Drive, Miami Beach, FL', 'Miami Beach', '33141', 'https://www.ohevshalom.miami/',
    'ohev@att.net', '', '', '', '', '', 'https://www.ohevshalom.miami/ ; ' + FED_S + 'ohev_shalom',
    'Read via WebFetch (site returns 406 to scripts). No staff names on home page. Pardes Day School middle school uses the same address.')
add('Pardes Day School - Gan Katan and Elementary', S, 'Orthodox', '1211 Marseille Drive, Miami Beach, FL', 'Miami Beach', '33141', 'https://pardesdayschool.org/',
    'office@pardesdayschool.org', 'Rabbi Dr. Levi Druin', 'Listed contact (contact page; role not stated)', 'https://pardesdayschool.org/pages/contact',
    'Grades K-6 plus Gan Katan preschool (CAJE lists); Gan Katan began 2011 with 5 children (gankatanmiami.com); county layer (Gan Katan) KG-03 enrollment 68.',
    'Admissions page charges a $1,000 annual per-family security fee; a parent testimonial on gankatanmiami.com mentions the security guard.',
    'https://pardesdayschool.org/pages/contact ; https://pardesdayschool.org/pages/admissions ; https://caje-miami.org/schools/day/jewish_day_schools/index.html ; ' + MDC,
    'Gan Katan (gankatanmiami.com, gankatanmiami@gmail.com) is the preschool of Pardes; Miami-Dade County layer names Sharon Eichberg as Gan Katan director.')
add('Pardes Day School - Middle School', S, 'Orthodox', '7055 Bonita Drive, Miami Beach, FL', 'Miami Beach', '33141', 'https://pardesdayschool.org/',
    'office@pardesdayschool.org', '', '', '', '', 'Per-family security fee (admissions page).', 'https://pardesdayschool.org/pages/contact',
    'Same address as Ohev Shalom Congregation (separate record).')
add('Temple Menorah', H, 'Traditional (Conservative)', '620 75th Street, Miami Beach, FL', 'Miami Beach', '33141', 'https://www.templemenorahmiami.org/',
    'info@menorahmail.org', 'Rabbi Eliot H. Pearlson', 'Rabbi', 'https://www.templemenorahmiami.org/meet-our-rabbi.html', 'Founded 1949 (rabbi page).', '',
    'https://www.templemenorahmiami.org/ ; ' + FED_S + 'temple_menorah', 'Read via WebFetch (site returns 406 to scripts).')
add('Chabad in South Beach (The Center for Jewish Life in South Beach)', H, 'Chabad', '320 Meridian Avenue, Miami Beach, FL', 'Miami Beach', '33139', 'https://www.chabadinsouthbeach.com/',
    '', '', '', '', 'Founded 2005 (about page).', '', 'https://www.chabadinsouthbeach.com/306913 ; ' + FED_S + 'chabad_in_south_beach',
    'Read via WebFetch (Chabad.org-hosted site blocks scripts). About page names the rabbi and rebbetzin by first name only (Shragi and Devorah Leah). Federation Find a Rabbi page lists services at 311 Washington Ave (Savoy Hotel ballroom).')
add('Capt. Hyman P. Galbut Jewish Learning Center Chabad', H, 'Chabad', '411 West 41st Street, Miami Beach, FL', 'Miami Beach', '33140', 'https://www.jlconline.org/',
    '', '', '', '', '', '', 'https://www.jlconline.org/ ; ' + FED_S + 'capt_hyman_p_galbut_jewish_learning_center_chabad',
    'Read via WebFetch (Chabad.org-hosted site). Email obfuscated on page; no staff names on home page.')
add('Chabad House in Miami Beach', H, 'Chabad', '669 Lincoln Lane, Miami Beach, FL', 'Miami Beach', '33139', 'http://mbjewish.com',
    '', '', '', '', '', '', FED_S + 'chabad_shulchabad_house_on_wheels',
    'From the federation directory only (website hosted on the Chabad.org platform, blocked to scripts). Directory lists the city as North Miami Beach but ZIP 33139 and Lincoln Lane are Miami Beach.')
add('Shalom Congregation (MB Chabad)', H, 'Chabad', '6345 Collins Avenue, Miami Beach, FL', 'Miami Beach', '33140', 'http://mbchabad.com',
    '', '', '', '', '', '', FED_S + 'shalom_congregation', 'From the federation directory only (listed as Orthodox, website MBChabad.com on the Chabad.org platform).')
add('Kol Eliyahu (formerly Adas Dej)', H, 'Orthodox', '225 37th Street, Miami Beach, FL', 'Miami Beach', '33140', '',
    '', '', '', '', '', '', FED_S + 'congregation_Kol_Eliyahu', 'From the federation directory only; no website listed.')
add('Keter Abraham', H, 'Jewish (denomination not stated)', '5401 Collins Avenue, Miami Beach, FL', 'Miami Beach', '33140', '',
    '', '', '', '', '', '', FED_S + 'keter_abraham', 'From the federation directory only; no website. 5401 Collins Ave is an oceanfront condominium address (minyan likely inside the building).')
add('Beis Hamedrash Levi Yitzchok', H, 'Chabad', '1140 Alton Road, Miami Beach, FL', 'Miami Beach', '33139', '',
    '', '', '', '', '', '', FED_S + 'beis_hamedrash_levi_yitzchok', 'Synagogue in the Lubavitch headquarters building shared with LEC Yeshiva Gedolah Miami (separate record).')
add('Shuva Israel South Beach', H, 'Orthodox', '629 Lenox Avenue, Miami Beach, FL', 'Miami Beach', '33139', 'https://shuvaisraelsouthbeach.wordpress.com/about/',
    '', '', '', '', '', '', OU, 'From the OU synagogue finder only; affiliated with Shuva Israel (Aventura/NMB).')
add('Beth Eliyahu Mani Sephardic Shul', H, 'Sephardic Orthodox', '4016 Royal Palm Avenue, Miami Beach, FL', 'Miami Beach', '33140', '',
    '', '', '', '', '', '', OU, 'From the OU synagogue finder only; no website.')
add('Congregation Zichron Naftali', H, 'Orthodox', '3791 Royal Palm Avenue, Miami Beach, FL', 'Miami Beach', '33140', '',
    '', '', '', '', '', '', OU, 'From the OU synagogue finder only; no website.')
add('Mimosa Shul', H, 'Orthodox', '4747 Collins Avenue (Mimosa building), Miami Beach, FL', 'Miami Beach', '33140', '',
    '', '', '', '', '', '', OU, 'Minyan in the basement of the Mimosa apartment building (OU listing). Building security is the condominium\'s.')
add('Synagogue of Carriage Club South', H, 'Orthodox', '5001 Collins Avenue, Miami Beach, FL', 'Miami Beach', '33140', '',
    '', '', '', '', '', '', OU, 'Minyan inside the Carriage Club condominium (OU listing).')
add('Congregation Yechezkel Shrage', H, 'Orthodox', '5005 Collins Avenue, Miami Beach, FL', 'Miami Beach', '33140', '',
    '', '', '', '', '', '', OU, 'Minyan inside an oceanfront condominium (OU listing).')
add('Ocean Pavilion Shul', H, 'Orthodox', '5601 Collins Avenue, Miami Beach, FL', 'Miami Beach', '33140', '',
    '', '', '', '', '', '', OU, 'Minyan inside the Ocean Pavilion condominium (OU listing).')
add('Innovative School of Temple Beth Sholom (TBSIS)', S, 'Reform', '4144 Chase Avenue, Miami Beach, FL', 'Miami Beach', '33140', 'https://www.tbsmb.school/',
    'info@tbsmb.org', 'Stacy Penson', 'Head of School', 'https://tbsmb.org/staff/', 'County layer: KG-03 (preschool through early elementary).',
    'Temple Beth Sholom board has a Security Committee (https://tbsmb.org/discover/board/).', 'https://tbsmb.org/staff/ ; ' + MDC + ' ; ' + FED_E + 'tbsmbschool',
    'School site tbsmb.school did not resolve through the proxy; data from the temple site.')
add('Galbut Family Miami Beach JCC', S, 'JCC (community)', '4221 Pine Tree Drive, Miami Beach, FL', 'Miami Beach', '33140', 'https://mbjcc.org/',
    'jenny@mbjcc.org', '', '', '', '35,000-square-foot facility (mission/history and giving pages); site opened 1980.',
    'Giving page: Wiesenfeld Family Security Fund, established after October 7, "supports ongoing investment in enhanced security measures".',
    'https://mbjcc.org/give ; https://mbjcc.org/contact ; ' + FED_E + 'miami_beach_jewish_community_center',
    'Typed School for youth programs/camps; giving page describes a planned Early Childhood Academy. Department emails: jenny@ (programs/youth), camp@, stacey@, karen@mbjcc.org. No leadership names on crawled pages.')

# ---------------- North Dade (NMB, Aventura, North Miami), batch 4 ----------------
add('Temple Sinai of North Dade', H, 'Reform', '18801 NE 22nd Avenue, Miami, FL', 'North Miami Beach', '33180', 'https://www.tsnd.org/',
    'templesinai@tsnd.org', 'Rabbi Alan E. Litwak', 'Senior Rabbi', 'https://www.tsnd.org/clergy-staff/', '',
    'Its Gan Sinai preschool charges each family a $650 security fee per child "so that we may provide on-campus security" (https://www.iamsinai.org/admissions).',
    'https://www.tsnd.org/contacts/ ; ' + URJ + ' ; ' + FED_S + 'temple_sinai_of_north_dade', 'URJ member. Rabbi email rabbi.litwak@tsnd.org. Federation lists city as North Miami Beach (mailing city Miami).')
add('Gan Sinai Preschool (Temple Sinai of North Dade; formerly Jacobson Sinai Academy ECC)', S, 'Reform', '18801 NE 22nd Avenue, Miami, FL', 'North Miami Beach', '33180', 'https://www.iamsinai.org/gan-sinai-preschool',
    'rabbi.david@tsnd.org', 'Rabbi David Paskin', 'Rabbi (Temple Sinai clergy page); Gan Sinai admissions/tour contact "Rabbi David" per iamsinai.org; county listing also names him director', 'https://www.tsnd.org/clergy-staff/',
    'County layer lists Jacobson Sinai Academy ECC PK-08 enrollment 227 (older figure); class sizes 8-16 per two teachers (site).',
    'Families pay a $650 per-child security fee for on-campus security (admissions page).',
    'https://www.iamsinai.org/admissions ; ' + MDC + ' ; ' + FED_E + 'temple_sinai_early_childhood_education_center', 'Same campus as Temple Sinai of North Dade.')
add('Aventura Turnberry Jewish Center (ATJC)', H, 'Conservative', '20400 NE 30th Avenue, Aventura, FL', 'Aventura', '33180', 'https://www.atjchome.org/',
    'info@atjc.org', 'Rabbi Jonathan Berkun', 'Rabbi (listed first on Meet The Team)', 'https://www.atjchome.org/ourteam',
    'USCJ directory size class: Medium (400-749).', '', 'https://www.atjchome.org/aboutus ; ' + USCJ + ' ; ' + FED_S + 'aventura_turnberry_jewish_center',
    'USCJ member. Also Rabbi Guido Cohen and Cantor Roger Rosenthal. Campus houses Tauber Academy preschool (separate record) and religious school.')
add('Tauber Academy (ATJC early childhood)', S, 'Conservative', '20400 NE 30th Avenue, Aventura, FL', 'Aventura', '33180', 'https://www.atjchome.org/',
    'tauber@atjc.org', 'Cindy Behar', 'Director (Miami-Dade County private school listing)', MDC, 'County layer: PK-KG, enrollment 191.', '',
    'https://www.atjchome.org/aboutus ; ' + MDC + ' ; ' + FED_E + 'tauber_academy', 'Site tauberacademy.com returns 406 to scripts; email from ATJC site.')
add('Beth Moshe Congregation', H, 'Conservative', '2225 NE 121st Street, North Miami, FL', 'North Miami', '33181', 'https://bethmoshe.com/',
    'info@bethmoshe.com', 'Allison Ludicke', 'President', 'https://bethmoshe.com/board-members/', '', '',
    'https://bethmoshe.com/contact ; ' + FED_S + 'beth_moshe_congregation', 'Runs Beth Moshe Early Childhood Center (separate record). Federation also lists "The Jewish Center - Chabad of North Miami" at this same address.')
add('Beth Moshe Early Childhood Center', S, 'Conservative', '2225 NE 121st Street, North Miami, FL', 'North Miami', '33181', 'https://bethmoshe.com/preschool/',
    'info@bethmoshe.com', 'Andrea Lang', 'Director (Miami-Dade County private school listing)', MDC, 'County layer: PK-01, enrollment 93.', '',
    'https://bethmoshe.com/contact ; ' + MDC, 'County layer has a second entry for Beth Moshe Congregation (PK) naming Shani Biton.')
add('Skylake Synagogue', H, 'Orthodox', '1850 NE 183rd Street, North Miami Beach, FL', 'North Miami Beach', '33179', 'https://skylakesynagogue.com/',
    'skylakes613@gmail.com', 'Rabbi Ariel Yeshurun', 'Rabbi (since 2011)', 'https://skylakesynagogue.com/our-rabbi/', '', '',
    'https://skylakesynagogue.com/about-us/ ; ' + OU + ' ; ' + FED_S + 'skylake_synagogue', 'Hebrew school program for pre-bar/bat mitzvah children (site).')
add('Young Israel of Greater Miami', H, 'Orthodox', '990 NE 171st Street, North Miami Beach, FL', 'North Miami Beach', '33162', 'https://www.youngisraelnmb.org/',
    'youngisraelnmb@gmail.com', '', '', '', '', '', 'https://www.youngisraelnmb.org/about-our-rabbi.html ; ' + OU + ' ; ' + FED_S + 'young_israel_of_greater_miami',
    'Rabbi page carries no readable name in text. Has a Simcha Hall (site menu).')
add('Congregation Magen David - Sephardic Jewish Center of North Miami Beach', H, 'Sephardic Orthodox', '17100 NE 6th Avenue, North Miami Beach, FL', 'North Miami Beach', '33162', 'https://magendavidnmb.com/',
    'magendavid17100@gmail.com', 'Levi Biton', 'Grant Manager and Proposal Administrator (named on the security RFP page)', 'https://magendavidnmb.com/pages/physical-security-enhancements',
    '', 'Site posted RFP 202117100 "Physical Security Enhancements" (impact-resistant windows, external lighting, barriers/fencing, impact-resistant doors and gates), published Aug 15 2023, closing Nov 15 2023 - typical of a nonprofit security grant project.',
    'https://magendavidnmb.com/pages/physical-security-enhancements ; ' + OU + ' ; ' + FED_S + 'congregation_magen_david_sephardic_jewish_center_of_north_miami_beach',
    'Daily classes by Rabbi Levy Biton (site). Strong IRIS fit: active security-improvement program.')
add('Netive Ezra', H, 'Sephardic Orthodox', '2655 NE 207th Street, Aventura, FL', 'Aventura', '33180', 'https://netiveezra.org/',
    'netiveezra@gmail.com', '', '', '', 'Runs a preschool/gan on site (netiveezraschool@gmail.com).', '',
    'https://netiveezra.org/contact-us/ ; ' + OU + ' ; ' + FED_S + 'netive_ezra', '')
add('Yeshiva Toras Chaim Toras Emes (YTCTE) - Klurman Campus', S, 'Orthodox', '1025 NE Miami Gardens Drive, North Miami Beach, FL', 'North Miami Beach', '33179', 'https://www.ytcte.org/',
    'office@ytcte.org', 'Rabbi Yermiyahu Ornstein', 'Head of School (EECC/BBYKES/BBYMS/BBYHS/YTCTE KES/RMS)', 'https://www.ytcte.org/our-leadership/',
    'Over 1,300 students in six divisions (FAQ); this campus houses Rohr Middle School, Mesivta Avraham Zev (DACHS) and Bais Medrash Zichron Ezra; county layer 09-12 enrollment 115.',
    'FAQ: both campuses fenced (6-ft gated fences), all access points locked 24/7 and under constant video surveillance, key cards/car transponders; Klurman campus has 1 full-time security guard; working with law enforcement on expansion plans.',
    'https://www.ytcte.org/about/faq/ ; ' + MDC + ' ; https://caje-miami.org/schools/day/jewish_day_schools/index.html', 'Existing camera coverage makes this a strong IRIS fit. Old domain ytcteam.org returns 403; current site is ytcte.org.')
add('Yeshiva Toras Chaim Toras Emes (YTCTE) - South Campus (Toras Emes Academy)', S, 'Orthodox', '1051 North Miami Beach Boulevard, North Miami Beach, FL', 'North Miami Beach', '33162', 'https://www.ytcte.org/',
    'office@ytcte.org', 'Rabbi Ephraim Palgon', 'Head of South Campus', 'https://www.ytcte.org/our-leadership/',
    'Over 1,300 students in six divisions (FAQ); South Campus holds early childhood, boys and girls elementary and Bnos Toras Emes; county layer PK-08 enrollment 523.',
    'FAQ: fenced campus, access points locked 24/7 under constant video surveillance, key-card/transponder access; security on South Campus increased to three guards with frequent patrols.',
    'https://www.ytcte.org/about/faq/ ; ' + MDC + ' ; https://caje-miami.org/schools/early/ECE_Directory.pdf', 'Director of South Campus Operations: Rabbi Zev Weiner (our-leadership page). Strong IRIS fit.')
add('Bais Yaakov Miami (Beth Jacob High School, Inc.)', S, 'Orthodox', '1110 NE 163rd Street, North Miami Beach, FL', 'North Miami Beach', '33162', 'https://www.bymiami.org/',
    'office@bymiami.org', 'Rabbi Ephraim Leizerson', 'Menahel', 'https://www.bymiami.org/',
    'Site: over 500 students across elementary (nursery-3rd grade) and middle/high school (grades 6-12) divisions; girls school.', '',
    'https://www.bymiami.org/ ; ' + MDC + ' ; ' + FED_E + 'beth_jacob_high_school ; https://caje-miami.org/schools/day/jewish_day_schools/index.html', 'County layer lists it as Beth Jacob High School Inc (06-12, enrollment 283).')
add('Neytz Hachochma School', S, 'Orthodox', '901 NE 167th Street, North Miami Beach, FL', 'North Miami Beach', '33162', 'http://neytz.com/',
    '', 'Dolly Aizenman', 'Director (Miami-Dade County private school listing)', MDC, 'County layer: KG-12, enrollment 20.', '', MDC + ' ; ' + FED_E + 'neytz_hachochma',
    'Federation directory shows an older address (152 NW 165 St). Website did not resolve through the proxy.')

# ---------------- South Dade, Coral Gables, Downtown: batch 5 ----------------
add('Temple Judea', H, 'Reform', '5500 Granada Boulevard, Coral Gables, FL', 'Coral Gables', '33146', 'https://www.judeagables.org/',
    'info@judeagables.org', 'Rabbi Judith Lazarus Siegal', 'Senior Rabbi', 'https://www.judeagables.org/clergy.html', '', '',
    'https://www.judeagables.org/ ; https://www.judeagables.org/professional-staff1.html ; ' + URJ + ' ; ' + FED_S + 'temple_judea',
    'Read via WebFetch (site returns 406 to scripts). URJ member. Executive Director Sharon Israel Moskovitz (s.israel@judeagables.org); Director of Operations Janice Garcia. Campus includes Margaux Early Childhood School (separate record).')
add('Margaux Early Childhood School at Temple Judea', S, 'Reform', '5500 Granada Boulevard, Coral Gables, FL', 'Coral Gables', '33146', 'https://www.judeagables.org/margaux',
    'margauxschool@judeagables.org', 'Jackie Vera', 'Early Childhood Director', 'https://www.judeagables.org/professional-staff1.html', '', '',
    'https://www.judeagables.org/professional-staff1.html', 'Read via WebFetch. Same campus as Temple Judea.')
add('Bet Shira Congregation', H, 'Conservative', '7500 SW 120th Street, Miami, FL', 'Pinecrest', '33156', 'https://www.betshira.org/',
    'info@betshira.org', 'Rabbi Jesse Charyn', 'Rabbi', 'https://www.betshira.org/', 'USCJ directory size class: Small (200-399).', '',
    'https://www.betshira.org/staff.html ; ' + USCJ + ' ; ' + FED_S + 'bet_shira_congregation',
    'Read via WebFetch (site returns 406 to scripts). USCJ member. Executive Director Elyse Hyman (ehyman@betshira.org). County polling place.')
add('Bet Shira Early Childhood Center', S, 'Conservative', '7500 SW 120th Street, Miami, FL', 'Pinecrest', '33156', 'https://www.betshirapreschool.org/',
    'preschool@betshira.org', 'Dorit Kadouri', 'Early Childhood Education Director', 'https://www.betshira.org/staff.html', 'County layer: PK-KG, enrollment 58.', '',
    'https://www.betshira.org/staff.html ; ' + MDC, 'Same campus as Bet Shira Congregation.')
add('Temple Beth Am', H, 'Reform', '5950 North Kendall Drive, Pinecrest, FL', 'Pinecrest', '33156', 'https://www.tbam.org/',
    'info@tbam.org', 'Rabbi Jeremy Barras', 'Senior Rabbi', 'https://www.tbam.org/temple/staff-directory/', 'Janet and Richard Yulman Campus (site).',
    'Staff directory lists Lior Edry, Security Director; a site post describes clergy meeting with City of Miami Police and Homeland Security officials about rising threats.',
    'https://www.tbam.org/temple/staff-directory/ ; ' + URJ + ' ; ' + FED_S + 'temple_beth_am', 'URJ member. Executive Director Sharon Levi. Campus includes Temple Beth Am Day School (separate record). Strong IRIS fit.')
add('Rambam Day School at Temple Beth Am (formerly Temple Beth Am Day School)', S, 'Reform', '5950 North Kendall Drive, Pinecrest, FL', 'Pinecrest', '33156', 'https://www.tbam.org/',
    'info@tbam.org', 'Nora Anderson', 'Head of Day School', 'https://www.tbam.org/temple/staff-directory/', 'County layer: PK-05, enrollment 324.',
    'Temple has an in-house Security Director (Lior Edry).', 'https://www.tbam.org/temple/staff-directory/ ; ' + MDC + ' ; ' + FED_E + 'temple_beth_am_day_school', 'Same campus as Temple Beth Am.')
add('Center for Jewish Life at Beth David (Beth David Congregation)', H, 'Conservative', '2625 SW 3rd Avenue, Miami, FL', 'City of Miami', '33129', 'https://www.centerbd.org/',
    'info@centerbd.org', 'Rabbi Julie Jacobs', 'Senior Rabbi', 'https://www.centerbd.org/about', 'Congregation traces to 1912 (B\'nai Zion) per site history.', '',
    'https://www.centerbd.org/about ; ' + FED_S + 'beth_david_congregation', 'Executive Vice President Rodrigo Wolf Yadlin (site). Campus houses the Gordon School (separate record). Federation lists denomination as "Jewish+".')
add('Gordon School of Beth David', S, 'Conservative', '2625 SW 3rd Avenue, Miami, FL', 'City of Miami', '33129', 'https://www.gordonschoolmiami.org/',
    'office@gordonschoolmiami.org', 'Veronica Alter', 'Day School Director', 'https://www.gordonschoolmiami.org/about', 'County layer: PK-05, enrollment 158; early childhood center began 1986.', '',
    'https://www.gordonschoolmiami.org/about ; ' + MDC + ' ; ' + FED_E + 'gordon_school_of_beth_david_congregation',
    'CEO: Rabbi Julie Jacobs; Principal of Early Childhood Center: Sara Zamikoff (about page).')
add('Young Israel of Kendall', H, 'Orthodox', '7880 SW 112th Street, Miami, FL', 'Pinecrest', '33156', 'https://yikendall.com/',
    'admin@yikendall.com', 'Rabbi Hershel D. Becker', 'Rabbi', 'https://yikendall.com/about/', '', '', 'https://yikendall.com/contact-us/ ; ' + OU + ' ; ' + FED_S + 'young_israel_of_kendall',
    'OU member. Municipality inferred from ZIP 33156 (mailing city Miami); verify Pinecrest vs. unincorporated Kendall.')
add('Congregation Dor Chadash', H, 'Reform & Conservative', '9400 SW 87th Avenue, Miami, FL', 'Unincorporated Miami-Dade (Kendall)', '33176', 'https://www.dorchadashmiami.org/',
    '', '', '', '', '', '', 'https://www.dorchadashmiami.org/ ; ' + FED_S + 'congregation_dor_chadash_miami',
    'Address from the federation Find a Rabbi page (the former Bet Breira Samu-El Or Olom building); the site gives a mailing suite (9560 SW 107th Ave, Ste 202) and the older directory entry lists 8770 SW 131st St - verify.')
add('Dave and Mary Alper JCC (Early Childhood Development Center)', S, 'JCC (community)', '11155 SW 112th Avenue, Miami, FL', 'Unincorporated Miami-Dade (Kendall)', '33176', 'https://www.alperjcc.org/',
    '', 'Irene Tzanani', 'Chief Executive Officer', 'https://www.alperjcc.org/about-us/leadership', 'Site: impacts more than 140,000 residents annually; Early Childhood Development Center serves more than 150 students a year.', '',
    'https://www.alperjcc.org/about-us/leadership ; ' + OU + ' ; ' + FED_E + 'dave_and_mary_alper_jewish_community_center_jcc', 'JCC campus; typed School for its preschool. County layer also lists Greenfield Day School at this address.')
add('El Centro de Estudios Judios - Torat Emet (CEJTE)', H, 'Sephardic Orthodox', '1221 SW 104th Avenue, Miami, FL', 'Unincorporated Miami-Dade (Westchester area)', '33174', 'https://cejte.org/',
    'info@cejte.org', '', '', '', '', '', 'https://cejte.org/contact/ ; ' + FED_S + 'el_centro_de_estudios_judios___torat_emet',
    'Spanish-language Sephardic congregation/study center. Site names Rabbi Rigoberto Emmanuel Vinas as author of a Haggadah commentary but states no title.')

# ---------------- LEC campuses (Miami Gardens / North Dade) ----------------
LEC_SEC = 'LEC about page: every building "tightly secured by expert safety and security personnel" with an on-site EMT; Safety & Security Director Mr. Zalman Myer-Smith (https://lecfl.com/contact/).'
add('Lubavitch Educational Center - Campus Menachem Mendel (flagship)', S, 'Chabad', '17330 NW 7th Avenue, Miami, FL', 'Miami Gardens', '33169', 'https://lecfl.com/',
    'administration@lecfl.com', 'Rabbi Benzion Korf', 'Head of School', 'https://lecfl.com/contact/',
    'LEC network: over 2,300 students (about page); county layer PK-12 enrollment 311 for this campus. Houses Early Stages, Young Division, boys schools and administration.',
    LEC_SEC, 'https://lecfl.com/about/ ; https://lecfl.com/contact/ ; ' + MDC, 'Founder: Rabbi Avraham Korf (Chabad-Lubavitch Regional Director). Associate Head of School Rabbi Yossi Zavdi (yzavdi@lecfl.com). Strong IRIS fit: multi-campus with in-house security.')
add('Lubavitch Educational Center - Campus Chaya Mushka (preschool, Beis Chana High School)', S, 'Chabad', '1515 NW 167th Street, Miami, FL', 'Miami Gardens', '33169', 'https://lecfl.com/',
    'preschool@lecfl.com', 'Mrs. Musha Krasnjanski', 'Principal, Beis Chana High School', 'https://lecfl.com/contact/', 'Part of LEC network (over 2,300 students).', LEC_SEC,
    'https://lecfl.com/about/ ; https://lecfl.com/contact/', 'Preschool Director Mrs. Bina Rosenblum (preschool@lecfl.com).')
add('Lubavitch Educational Center - Beit Apel (Girls Elementary and Middle Schools)', S, 'Chabad', '1525 NW 167th Street, Miami, FL', 'Miami Gardens', '33169', 'https://lecfl.com/',
    'elmgirls@lecfl.com', 'Mrs. Chaya Sara Dalfin', 'Principal, Girls Elementary School', 'https://lecfl.com/contact/', 'County layer lists Beit Apel - Campus Chaya Mushka, grades 02-12.', LEC_SEC,
    'https://lecfl.com/about/ ; https://lecfl.com/contact/ ; ' + MDC, 'Girls Middle School principal Mrs. Shevi Sossonko (middleschoolgirls@lecfl.com).')
add('Lubavitch Educational Center - Zimerman Campus (Klurman Lubavitch Yeshiva High School)', S, 'Chabad', '20 NW 181st Street, Miami, FL', 'Miami Gardens', '33169', 'https://lecfl.com/',
    'highschool@lecfl.com', 'Rabbi Nochum Schapiro', 'Principal, Klurman Lubavitch Yeshiva High School', 'https://lecfl.com/contact/', 'Part of LEC network (over 2,300 students).', LEC_SEC,
    'https://lecfl.com/about/ ; https://lecfl.com/contact/', 'Municipality from ZIP 33169 default; verify (Miami Gardens vs. unincorporated). Mesivta Lubavitch Miami (mesivta@lecfl.com) also listed under boys schools.')

# ---------------- Directory-sourced synagogues (federation / OU), batch 6 ----------------
CH_NOTE = 'Website is on the Chabad.org platform, which blocks scripted access; leadership not captured (NEEDS MANUAL WORK).'
add('Aventura Chabad (Chabad House of North Dade)', H, 'Chabad', '2801 NE 210th Street, Aventura, FL', 'Aventura', '33180', 'https://www.chabadfl.org/',
    'info@chabadfl.org', 'Rabbi Laivi Forta', 'Director', 'https://www.chabadfl.org/templates/articlecco_cdo/aid/1469703/jewish/Our-Staff.htm', '', '',
    'https://www.chabadfl.org/templates/articlecco_cdo/aid/1469703/jewish/Our-Staff.htm ; ' + FED_S + 'aventura_chabad',
    'Read via WebFetch. Founder Rabbi Casriel Brusowankin; Administrator Mariana Furmanski (mariana@chabadfl.org); runs Karol Galan Hebrew School and a mikvah.')
add('Congregation Shaaray Tefilah', H, 'Orthodox', '971 NE 172nd Street, North Miami Beach, FL', 'North Miami Beach', '33162', 'https://www.cstnmb.com/',
    '', 'HaRav Ephraim Eliyahu Shapiro', "Mara D'Asra (rav)", 'https://www.cstnmb.com/', '', '', 'https://www.cstnmb.com/ ; ' + OU + ' ; ' + FED_S + 'congregation_shaaray_tefilah',
    'Read via WebFetch (site returns 406 to scripts). No email on home page.')
add('Bais Menachem of North Miami Beach', H, 'Chabad', '17299 NE 10th Avenue, North Miami Beach, FL', 'North Miami Beach', '33162', 'https://bmnmb.com/',
    '', '', '', '', '', '', FED_S + 'bais_menachem_nmb', 'Website returns 403 to scripts; data from federation directory.')
add('Beit David Highland Lakes Shul', H, 'Orthodox', '2600 NE 209th Street, Miami, FL', 'Unincorporated Miami-Dade (Highland Lakes)', '33180', 'https://www.bdhls.org/',
    '', '', '', '', 'Runs Yeladim Miami Preschool (CAJE early-childhood directory, July 2024).',
    'Site has a security donation page ("donating towards our enhanced security") funding security personnel for Shabbat and preschool months and a "Security fence, equipment & upgrades" line (https://www.bdhls.org/form/securitydonation).',
    'https://www.bdhls.org/form/securitydonation ; ' + FED_S + 'beit_david_highland_lakes_shul ; ' + OU + ' ; https://caje-miami.org/schools/early/ECE_Directory.pdf',
    'Read via WebFetch (site returns 406 to scripts). Site mentions "Rabbi Wolf" (surname only). Federation lists city as Aventura; Highland Lakes is unincorporated.')
add('Beit Rambam Congregation', H, 'Sephardic Orthodox', '200 178th Street, Sunny Isles Beach, FL', 'Sunny Isles Beach', '33160', '',
    '', '', '', '', '', '', FED_S + 'beit_rambam_congregation ; ' + OU,
    'OU lists "Beit Rambam Community Center" at 17700 Collins Ave, Sunny Isles Beach; federation lists 200 178th St. Former website domain (beitrambam.com) is parked/for sale.')
add('Bet Ovadia - Chabad of Miami (Chabad of the Grove)', H, 'Chabad', '3713 Main Highway, Miami (Coconut Grove), FL', 'City of Miami', '33133', 'http://chabadmiami.com',
    '', '', '', '', '', '', FED_S + 'bet_ovadia_chabad_of_the_grove', CH_NOTE + ' Same address as Miami Jewish Montessori (separate record).')
add('Beth Torah Benny Rok Campus', H, 'Conservative', '20350 NE 26th Avenue, Miami, FL', 'North Miami Beach', '33180', 'https://btbrc.org/',
    '', '', '', '', 'USCJ directory size class: Medium (400-749).', '', USCJ + ' ; ' + FED_S + 'beth_torah_benny_rok',
    'USCJ member. Website returns 403 to scripts and WebFetch (NEEDS MANUAL WORK). Campus has the Suzy Fischer early childhood program (separate record). Municipality hint per federation listing; ZIP 33180 straddles Aventura/unincorporated.')
add('California Club Chabad', H, 'Chabad', '825 NE 205th Terrace, Miami, FL', 'Unincorporated Miami-Dade (California Club area)', '33179', 'http://californiaclubchabad.com',
    '', '', '', '', '', '', FED_S + 'california_club_chabad', CH_NOTE + ' Federation lists city as North Miami Beach.')
add('Chabad at Midtown', H, 'Chabad', '221 NE 29th Street, Miami, FL', 'City of Miami', '33137', 'http://midtownjewish.org',
    '', '', '', '', '', '', FED_S + 'chabad_at_midtown', CH_NOTE)
add('Chabad Center for Jewish Life - NW Dade & Miami Lakes', H, 'Chabad', '7924 NW 163rd Terrace, Miami Lakes, FL', 'Miami Lakes', '33016', 'http://chabadmiamilakes.com',
    '', '', '', '', '', '', FED_S + 'chabad_center_for_jewish_life___nw_dademiami_lakes ; https://jewishmiami.org/resources/find_rabbi/', CH_NOTE + ' Federation Find a Rabbi page lists "Chabad of Miami Lakes Northwest Dade County Synagogue" and "Congregation Tehilat Hashem" at 16800 NW 83rd Place, Miami Lakes 33016 - possibly the current location; verify.')
add('Chabad of Kendall & Pinecrest', H, 'Chabad', '9700 South Dixie Highway, Suite 100, Miami, FL', 'Pinecrest', '33156', 'http://chabadofkendall.org',
    '', '', '', '', '', '', FED_S + 'chabad_center_of_kendall_pinecrest ; https://jewishmiami.org/resources/find_rabbi/', CH_NOTE + ' Federation Find a Rabbi page lists Chabad of Kendall at 8700 SW 112th Street, Miami 33176 - verify which is current.')
add('Chabad Chayil - The Family Shul (Jewish Center of Highland Lakes)', H, 'Chabad', '2601 NE 211th Terrace, Miami, FL', 'Unincorporated Miami-Dade (Highland Lakes)', '33180', 'http://chabadchayil.org',
    '', '', '', '', '', '', FED_S + 'chabad_chayil_the_family_shul_highland', CH_NOTE + ' Runs Chabad Chayil school (separate record).')
add('Chabad Chayil School (Highland Lakes)', S, 'Chabad', '2601 NE 211th Terrace, Miami, FL', 'Unincorporated Miami-Dade (Highland Lakes)', '33180', 'http://chabadchayil.org',
    '', 'Rabbi Moishe Kievman', 'Director (Miami-Dade County private school listing)', MDC, 'County layer: PK-08, enrollment 131.', '', MDC, 'Same campus as Chabad Chayil - The Family Shul.')
add('Chabad of Homestead & Cutler Bay', H, 'Chabad', '20557 Old Cutler Road, Cutler Bay, FL', 'Cutler Bay', '33189', 'http://chabadhomebay.com',
    '', '', '', '', '', '', FED_S + 'chabad_homestead_cutler_bay', CH_NOTE + ' Serves Homestead; building is in Cutler Bay.')
add('Chabad Jewish Center of Doral', H, 'Chabad', '10181 NW 58th Street, Suite 16, Doral, FL', 'Doral', '33178', 'http://chabaddoral.com',
    '', '', '', '', '', '', FED_S + 'chabad_jewish_center_of_doral', CH_NOTE + ' Suite in a commercial center.')
add('Chabad Lubavitch of Sunny Isles Beach', H, 'Chabad', '17555 Atlantic Boulevard (King David, ground floor), Sunny Isles Beach, FL', 'Sunny Isles Beach', '33160', 'http://sunnychabad.org',
    '', '', '', '', '', '', FED_S + 'chabad_lubavitch_of_sunny_isles_beach', CH_NOTE + ' Located on the ground floor of a residential building.')
add('Chabad of Golden Beach', H, 'Chabad', '19201 Collins Avenue, Sunny Isles Beach, FL', 'Sunny Isles Beach', '33160', 'http://chabadofgoldenbeach.org',
    '', '', '', '', '', '', FED_S + 'chabad_of_golden_beach', CH_NOTE + ' Serves Golden Beach; address is in Sunny Isles Beach per federation listing.')
add('Chabad Key Biscayne Jewish Center', H, 'Chabad', '101 Harbor Drive, Key Biscayne, FL', 'Key Biscayne', '33149', 'https://www.chabadkeyb.com/',
    '', '', '', '', '', '', 'https://www.chabadkeyb.com/ ; ' + FED_S + 'chabad_of_key_biscayne', 'Read via WebFetch: name and address confirmed; no staff names or email on home page (NEEDS MANUAL WORK).')
add('Chabad of Miami Shores', H, 'Chabad', '10626 NE 11th Court, Miami Shores, FL', 'Miami Shores', '33138', 'http://chabadmiamishores.com',
    '', '', '', '', '', '', FED_S + 'chabad_of_miami_shores', CH_NOTE)
add('Chabad of North Miami Beach East', H, 'Chabad', '1999 NE 178th Street, North Miami Beach, FL', 'North Miami Beach', '33162', 'http://jewishnmb.com',
    '', '', '', '', '', '', FED_S + 'chabad_of_north_miami_beach_east', CH_NOTE)
add('Chabad of Palmetto Bay & Deering Bay', H, 'Chabad', '16721 SW 78th Court, Palmetto Bay, FL', 'Palmetto Bay', '33157', 'https://jewishpalmettobay.org',
    '', '', '', '', '', '', FED_S + 'chabad_palmetto_bay', CH_NOTE)
add('Chabad Russian Center of South Florida', H, 'Chabad', '488 Sunny Isles Boulevard, Sunny Isles Beach, FL', 'Sunny Isles Beach', '33160', 'http://chabadrc.com',
    'office@thegan.com', 'Rabbi Alexander Kaller', 'Founder and leader (named on its school site)', 'https://www.thegan.com/staff/', '', '',
    FED_S + 'chabad_russian_center ; https://www.thegan.com/about/', 'CAJE ECE directory (July 2024) lists the center at 252 Sunny Isles Blvd, Suite 3. Parent of The Gan Frida preschool. Email is the preschool office address.')
add('Magen David Congregation of Surfside (Syrian Sephardic)', H, 'Sephardic Orthodox', '9348 Harding Avenue, Surfside, FL', 'Surfside', '33154', '',
    '', '', '', '', '', '', FED_S + 'congregation_magen_david_sephardic_jewish_center ; ' + OU,
    'Listed domain magendavid.com now redirects to an unrelated site (shul.com); no working website found.')
add('Edmond J. Safra Synagogue (Beit Edmond J. Safra)', H, 'Sephardic Orthodox', '19275 Mystic Pointe Drive, Aventura, FL', 'Aventura', '33180', 'http://www.ejsfl.com',
    '', '', '', '', '', '', FED_S + 'edmond_j_safra_synagogue ; ' + OU, 'OU member. Website failed TLS/returned 503 (NEEDS MANUAL WORK).')
add('Skylake Chabad House', H, 'Chabad', '18445 NE 19th Avenue, North Miami Beach, FL', 'North Miami Beach', '33179', 'http://skylakechabad.org',
    '', '', '', '', '', '', FED_S + 'skylake_chabad_house ; https://jewishmiami.org/resources/find_rabbi/', CH_NOTE + ' Address per federation Find a Rabbi page is 18445 NE 19th Ave, North Miami Beach 33179; the directory detail page shows 18801 NE 22nd Ave (Temple Sinai\'s address) - verify.')
add('Temple Beth Or', H, 'Post-denominational', '11715 SW 87th Avenue, Miami, FL', 'Unincorporated Miami-Dade (Kendall)', '33176', 'https://bethormiami.com',
    '', '', '', '', '', '', FED_S + 'temple_beth_or', 'Website redirect loop on fetch (NEEDS MANUAL WORK).')
add('The Rok Family Shul - Chabad Downtown Jewish Center', H, 'Chabad', '35 SE 9th Street, Miami, FL', 'City of Miami', '33131', 'https://www.jewishdowntown.net/',
    '', '', '', '', '', '', 'https://www.jewishdowntown.net/ ; ' + FED_S + 'the_rok_family_shul___chabad_downtown_jewish_center',
    'Read via WebFetch: no staff names or email on home/about pages. Brickell/Downtown. Hosts Brumer Preschool of the Arts (separate record).')
add('Willie & Celia Trump Synagogue (Williams Island Synagogue)', H, 'Orthodox', '2000 West Island Boulevard (Williams Island), Aventura, FL', 'Aventura', '33160', 'https://www.wctsynagogue.org/',
    '', '', '', '', '', '', OU + ' ; ' + FED_S + 'willie_and_celia_trump_synagogue',
    'OU member. Inside the gated Williams Island community. Federation lists 3000 Island Blvd. Site home page shows no names (WebFetch).')
add('Young Israel of Aventura', H, 'Orthodox', '3575 NE 207th Street (Shoppes at the Waterways), Aventura, FL', 'Aventura', '33180', 'https://www.youngisraelaventura.com/',
    '', '', '', '', '', '', OU + ' ; ' + FED_S + 'young_israel_of_aventura', 'Storefront space in a shopping center. Website returns 406 to scripts.')
add('Biala Center of Florida', H, 'Orthodox (Chassidic)', '18131 NE 10th Avenue, Miami, FL', 'North Miami Beach', '33162', '', '', '', '', '', '', '', OU, 'From OU synagogue finder only.')
add('Kehillas Ahavas Shalom', H, 'Orthodox', '951 NE 172nd Street, North Miami Beach, FL', 'North Miami Beach', '33162', 'https://www.kasnmb.com/',
    '', '', '', '', '', '', OU, 'From OU synagogue finder; website did not resolve through the proxy.')
add('Torah VeEmunah', H, 'Orthodox', '1000 NE 175th Street, North Miami Beach, FL', 'North Miami Beach', '33162', '', '', '', '', '', '', '', OU, 'From OU synagogue finder only.')
add('Kollel Zichron Michel of North Miami Beach', H, 'Orthodox', '990 NE 175th Street, North Miami Beach, FL', 'North Miami Beach', '33162', 'https://www.kzmnmb.org/',
    '', '', '', '', '', '', OU, 'Kollel/beis medrash; website returns 406 to scripts.')
add('Miami Torah Center', H, 'Orthodox', '19000 North Bay Road, Sunny Isles Beach, FL', 'Sunny Isles Beach', '33160', '', '', '', '', '', '', '', OU, 'From OU synagogue finder only.')
add('Breslev Learning Center', H, 'Orthodox (Breslov)', '19088 NE 29th Avenue, Aventura, FL', 'Aventura', '33180', '', '', '', '', '', '', '', OU,
    'Listed website redirects to a myshul.com page (403).')
add('Shuva Israel Aventura', H, 'Sephardic Orthodox', '18461 West Dixie Highway, North Miami Beach, FL', 'North Miami Beach', '33160', 'https://www.shuvaisrael.com/',
    '', '', '', '', '', '', OU + ' ; https://www.shuvaisrael.com/', 'Site is Hebrew-language; no English contact details captured.')
add('Baba Sali Synagogue', H, 'Sephardic Orthodox', '2380 NE 199th Street, Miami, FL', 'Unincorporated Miami-Dade (Highland Lakes area)', '33180', '', '', '', '', '', '', '', OU, 'From OU synagogue finder only.')
add('Young Israel of Sunny Isles Beach', H, 'Orthodox', '17395 North Bay Road, Suite 107, Sunny Isles Beach, FL', 'Sunny Isles Beach', '33160', 'https://www.youngisraelsib.com/',
    'youngisraelofsib@bellsouth.net', '', '', '', 'Site: more than 120 families.', '', 'https://www.youngisraelsib.com/ ; ' + OU + ' ; ' + FED_S + 'young_israel_of_sunny_isles',
    'Read via WebFetch (site rate-limits scripts, 429). Site mentions "Rabbi Haber" (surname only). Suite in a residential/commercial building.')

# ---------------- Schools from CAJE day-school list and ECE directory, batch 7 ----------------
CAJE_D = 'https://caje-miami.org/schools/day/jewish_day_schools/index.html'
CAJE_E = 'https://caje-miami.org/schools/early/ECE_Directory.pdf'
add('Cheder Neimus Hatorah (Cheder Miami)', S, 'Orthodox', '424 West 40th Street, Miami Beach, FL', 'Miami Beach', '33140', 'https://www.chedermiami.com/',
    'office@chedermiami.com', 'Rabbi Yaakov Burstyn', 'Menahel', 'https://www.chedermiami.com/about/our-staff/', 'CAJE list: ages 2 through 1st grade (boys).', '',
    'https://www.chedermiami.com/about/our-staff/ ; ' + CAJE_D, 'Same address as Ahavas Torah synagogue. Executive Administrator Mrs. Rachel Wasserlauf.')
add('JEMS Academy', S, 'Jewish (denomination not stated)', '1117 NE 163rd Street, Suite C, North Miami Beach, FL', 'North Miami Beach', '33162', 'https://jemsacademy.org/',
    '', '', '', '', 'CAJE list: grades K-5.', '', CAJE_D, 'School website shows only a donation page; data from CAJE list.')
add('Jewish Leadership Academy (JLA)', S, 'Jewish community', '975 NW 95th Street, Miami, FL', 'Unincorporated Miami-Dade (Miami Shores area)', '33150', 'https://jlamiami.org/',
    'admissions@jlamiami.org', 'Rabbi Dr. Gil S. Perl', 'Head of School', 'https://jlamiami.org/our-team/',
    'Grades 6-12; middle school capped at 45 per grade, upper school at 50 per grade (admissions page).', 'Our-team page lists a Lead Security Officer (Nate Baker).',
    'https://jlamiami.org/our-team/ ; ' + CAJE_D, 'Associate Head of School (Middle School) Dr. Zak Cohen. ZIP 33150 default is City of Miami; site describes staff living minutes away in Miami Shores - verify municipality.')
add('Lanaar School', S, 'Orthodox', '20400 NE 30th Avenue, Aventura, FL', 'Aventura', '33180', 'https://lanaarschool.org/',
    'office@lanaarschool.org', 'Rabbi Chaim Mayzlesh', 'Executive Director', 'https://lanaarschool.org/team/', 'Site: 261 enrolled students across 9 grades in 2026/2027 (15 in 2018/2019).', '',
    'https://lanaarschool.org/team/ ; ' + CAJE_D + ' ; ' + MDC, 'Address per CAJE list is the ATJC campus; county layer shows an older address (200 NE 161st St, North Miami Beach). Elementary principal Mrs. Aurit Katan.')
add('Miami Jewish Academy', S, 'Jewish (denomination not stated)', '2180 NE 122nd Street, North Miami, FL', 'North Miami', '33181', 'https://miamijewishacademy.org/',
    '', '', '', '', 'CAJE list: grades K-3.', '', CAJE_D, 'Website is an under-construction placeholder; data from CAJE list.')
add('Tamim Academy of Miami', S, 'Chabad', '488 Sunny Isles Boulevard, 3rd Floor, Sunny Isles Beach, FL', 'Sunny Isles Beach', '33160', 'https://www.tamimmiami.org/',
    'office@tamimmiami.org', 'Chanie Kaller', 'Head of School', 'https://www.tamimmiami.org/staff/', 'CAJE list: grades K-3.', '',
    'https://www.tamimmiami.org/staff/ ; ' + CAJE_D, 'Dean Rabbi Kaller; principal Vera Yarosh. Same building as the Chabad Russian Center.')
add('Yotzer Ohr Miami', S, 'Orthodox', '18900 NE 25th Avenue, Miami, FL', 'North Miami Beach', '33180', 'https://www.yomiami.org/',
    'office@yomiami.org', 'Nietzah Benbenisti', 'Director (Miami-Dade County private school listing; the school site signs its admissions letter "Mrs. Benbenishti, Head of School")', MDC,
    'CAJE list: girls grades 9-12; county layer enrollment 16.', 'Faculty page lists a Head of Security.', 'https://www.yomiami.org/faculty ; ' + CAJE_D + ' ; ' + MDC,
    'On the MAR-JCC campus address.')
add('Brumer Preschool of the Arts at the Shul of Downtown', S, 'Chabad', '35 SE 9th Street, Miami, FL', 'City of Miami', '33131', 'https://brickellpreschool.com/',
    '', '', '', '', '', '', 'https://brickellpreschool.com/ ; ' + CAJE_E, 'Preschool of The Rok Family Shul - Chabad Downtown (Brickell). No email or names captured from site text.')
add('Moses Montessori', S, 'Sephardic (community)', '1200 Normandy Drive, Miami Beach, FL', 'Miami Beach', '33141', 'https://mosesmontessori.com/',
    '26hadar@gmail.com', '', '', '', '', '', 'https://mosesmontessori.com/ ; ' + CAJE_E, 'Early childhood program at the Temple Moses address.')
add('Shalom Montessori', S, 'Jewish community', '3790 Prairie Avenue, Miami Beach, FL', 'Miami Beach', '33140', 'https://shalommontessori.org/',
    'info@shalommontessori.org', '', '', '', '', 'Home page quote: "Our highest priority is the children ... Their safety, security ... are our most important focus."',
    'https://shalommontessori.org/ ; ' + CAJE_E, 'Early childhood program (CAJE ECE directory, July 2024).')
add('Muss Family Montessori at Temple Emanu-El', S, 'Conservative', '1701 Washington Avenue, Miami Beach, FL', 'Miami Beach', '33139', 'https://mussmontessori.org/',
    'info@mussmontessori.org', 'Debbie Serbin', 'Head of School', 'https://mussmontessori.org/staff/', '',
    'Site: single entrance so student safety is monitored, and "two security guards on campus"; staff page lists Franz Fernandez, Director of Security.',
    'https://mussmontessori.org/staff/ ; ' + CAJE_E, 'Same campus as Temple Emanu-El of Miami Beach. Strong IRIS fit.')
add('Suzy Fischer Early Childhood Academy (Beth Torah Benny Rok Campus)', S, 'Conservative', '20350 NE 26th Avenue, Miami, FL', 'North Miami Beach', '33180', 'https://btbrc.org/',
    '', '', '', '', '', '', CAJE_E + ' ; ' + FED_E + 'suzy_ficher_early_childhood_academy_at_beth_torah_benny_rok_campus', 'Website blocked (403). Same campus as Beth Torah Benny Rok.')
add('Yeladim Miami Preschool (Beit David Highland Lakes Shul)', S, 'Orthodox', '2600 NE 209th Street, Miami, FL', 'Unincorporated Miami-Dade (Highland Lakes)', '33180', 'https://www.bdhls.org/',
    '', '', '', '', '', 'Synagogue security donation page funds security personnel including "1 Preschool Month" (https://www.bdhls.org/form/securitydonation).', CAJE_E + ' ; https://www.bdhls.org/form/securitydonation', 'From CAJE ECE directory (July 2024).')
add('Miami Jewish Montessori', S, 'Chabad', '3713 Main Highway, Miami (Coconut Grove), FL', 'City of Miami', '33133', 'https://www.mjm.miami/',
    'office@jewishmontessori.miami', 'Daniel Presberg', 'Director (Miami-Dade County private school listing)', MDC, 'County layer: PK-06; CAJE: early childhood and elementary.', '',
    'https://www.mjm.miami/about-us ; ' + MDC + ' ; ' + CAJE_E, 'Same address as Bet Ovadia - Chabad of Miami (Coconut Grove). County also lists "Chabad of The Grove" preschool at this address (director Chana Fellig).')

# ---------------- From federation "Find a Rabbi" page and other checks, batch 8 ----------------
FR = 'https://jewishmiami.org/resources/find_rabbi/'
add('Temple Hatikvah - Homestead Jewish Center', H, 'Reform', '183 NE 8th Street, Homestead, FL', 'Homestead', '33030', 'https://www.thhjc.org/',
    'rabbi@temple-hatikvah.org', 'Dr. Jack L. Sparks', 'Rabbi', 'https://www.thhjc.org/Aboutus.html', 'Formed as a Jewish Community Center in 1952 (site); serves Homestead, Perrine, the Redland, Cutler Ridge, Upper Keys, Kendall.',
    'Membership page states the congregation has no security fund (voluntary dues).', 'https://www.thhjc.org/ ; ' + FR,
    'Site says weekly Erev Shabbat services take place via Zoom - verify how much the building is used. Only Jewish congregation found in Homestead.')
add('Chabad of Downtown Coral Gables', H, 'Chabad', '1827 Ponce de Leon Boulevard, Coral Gables, FL', 'Coral Gables', '33134', 'https://chabadgables.com/',
    '', 'Rabbi Avraham Stolik', 'Rabbi (home page: "Rabbi Avraham & Chany Stolik")', 'https://chabadgables.com/', '', '', 'https://chabadgables.com/',
    'Read via WebFetch (Chabad.org-hosted site). Runs Chabad Hebrew School. Found through web search; not in federation directory.')
add('The Jewish Center - Chabad of North Miami', H, 'Chabad', '12407 Biscayne Boulevard, North Miami, FL', 'North Miami', '33181', 'http://thejewishcenterflorida.com',
    '', '', '', '', '', '', FR + ' ; ' + FED_S + 'the_jewish_center___chabad_of_north_miami',
    'Address per Find a Rabbi page; the directory detail page lists 2225 NE 121st St (Beth Moshe\'s address).')
add('Lubavitch Congregation (South Beach)', H, 'Chabad', '1423 Lenox Avenue, Miami Beach, FL', 'Miami Beach', '33139', '', '', '', '', '', '', '', FR, 'Listed only on the federation Find a Rabbi page.')
add('Beth El Congregation (at Hebrew Academy)', H, 'Orthodox', '2400 Pine Tree Drive, Miami Beach, FL', 'Miami Beach', '33140', '', '', '', '', '', '', '', FR,
    'Listed on the federation Find a Rabbi page at the RASG Hebrew Academy address (synagogue on the school campus; see the Hebrew Academy record for security contacts).')
add('Communaute Francaise de Miami', H, 'Orthodox (French-speaking)', '3401 Prairie Avenue, Miami Beach, FL', 'Miami Beach', '33140', '', '', '', '', '', '', '', FR, 'Listed only on the federation Find a Rabbi page.')
add('KSpace Miami', H, 'Jewish (denomination not stated)', '3575 NE 207th Street, #B20, Aventura, FL', 'Aventura', '33180', '', '', '', '', '', '', '', FR,
    'Listed on the federation Find a Rabbi page; storefront unit in the same shopping center as Young Israel of Aventura.')
add('Ner Yitzchak of Highland Lakes Synagogue', H, 'Sephardic Orthodox', '20701 NE 26th Avenue, Miami, FL', 'Unincorporated Miami-Dade (Highland Lakes)', '33180', '', '', '', '', '', '', '', FR, 'Listed only on the federation Find a Rabbi page.')
add('Or Yaacov Orthodox Sephardic Congregation', H, 'Sephardic Orthodox', '3479 NE 163rd Street, North Miami Beach, FL', 'North Miami Beach', '33160', '', '', '', '', '', '', '', FR, 'Listed only on the federation Find a Rabbi page.')
add('Bnei Emunah Congregation', H, 'Orthodox', '100 Bayview Drive, Sunny Isles Beach, FL', 'Sunny Isles Beach', '33160', '', '', '', '', '', '', '', FR, 'Listed only on the federation Find a Rabbi page.')
add('Chabad Jewish Student Center at FIU', H, 'Chabad', '10031 SW 15th Terrace, Miami, FL', 'Unincorporated Miami-Dade (Westchester area)', '33174', '', '', '', '', '', '', '', FR,
    'Student Chabad house near Florida International University (Find a Rabbi page).')
