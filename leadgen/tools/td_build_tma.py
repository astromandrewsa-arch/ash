"""td_build_tma.py: Florida TMA (The Monitoring Association) members -> leadgen/data/tma_members.json.
Evidence sources: public tma.us pages (fetched) and my.tma.us directory pages seen ONLY through a web-search index
(the directory itself is behind a Cloudflare challenge and was not fetched). No phone numbers recorded."""
import json
BOARD = 'https://tma.us/about/our-leadership/executive-committee-board/'
COMM = 'https://tma.us/about/our-committees/'
LOTT = 'https://tma.us/events/awards/stanley-c-lott-award/'
SLATE = 'https://tma.us/proposed-tma-board-of-directors-slate-for-2026-2028/'
ELECT = 'https://tma.us/the-monitoring-association-elects-board-of-directors-for-2026-2028-term/'
NEWMEM = 'https://tma.us/tma-welcomes-four-new-members/'
SPONS = 'https://tma.us/opstech-2026-sponsors/'
GRADS = 'https://tma.us/operatoronlinegraduates/'
MARVEL21 = 'https://tma.us/adt-wins-2021-tma-ssi-monitoring-technology-marvel-award/'
D = 'https://my.tma.us/tmamemberdirectory/Details/'
FD = 'https://my.tma.us/fivediamondmonitoringcenters/Details/'
IDX = ' (my.tma.us directory page seen via web-search index only; page itself is behind a Cloudflare challenge)'

def rec(name, county, address='', city='', zip_='', website='', evidence='', url='', services='', notes='', people=None,
        contact=None, flag=''):
    c = contact or {}
    return {'name': name, 'brand': '', 'listing_level': '', 'address': address, 'city': city, 'state': 'FL', 'zip': zip_,
            'website': website, 'email': '', 'contact_name': c.get('name', ''), 'contact_role': c.get('role', ''),
            'contact_source': c.get('source', ''), 'services_on_listing': services, 'service_area': '',
            'listing_url': url, 'query': 'TMA Florida members (tma.us public pages + web search of TMA directory index)',
            'notes': notes, 'tma_evidence': evidence, 'evidence_url': url, 'county': county, 'flag': flag,
            'people': people or []}

R = []
# ---------------- Miami-Dade ----------------
R.append(rec('Arco Security Central Station Corp.', 'Miami-Dade', '3905 SW 110th Avenue', 'Miami', '33165', 'arcoweb.com',
    'TMA member directory listing, membership type "TMA Listed Monitoring"; also appears in TMA "New Members" directory' + IDX,
    D + 'arco-security-central-station-corp-3966856 | https://my.tma.us/newtmamembers/Details/arco-security-central-station-corp-4700978',
    'Central station monitoring (intrusion, fire, medical, elevator, environmental, access control) per directory snippet',
    'Directory text (via search snippet): founded by the Dominguez family in 1985; bilingual staff; UL-listed call center, FirstNet Certified. '
    'Trade press (Security Sales, Jul 2025) reports Owen Security Solutions acquired The Arco Security Group (Miami branch) - verify current status.'))
R.append(rec('DataRemote, Inc.', 'Miami-Dade', '18001 Old Cutler Road, Suite 600', 'Miami', '33157', '',
    'TMA member directory listing, membership type "TMA Associate"' + IDX, D + 'dataremote-inc-4834109',
    'Cellular routers / IP communication appliances (vendor)', 'Associate member (supplier), not an installing dealer.',
    flag='vendor/associate member, not a dealer'))
R.append(rec('Hightower Risk Associates Inc.', 'Miami-Dade', '', 'Miami Beach', '', '',
    'TMA member directory listing, consultant member' + IDX, D + 'hightower-risk-associates-inc-3690459',
    'Insurance consultant (embedded IoT insurance) per directory snippet', 'Consultant member; not a dealer.',
    flag='consultant member, not a dealer'))
R.append(rec('Prizm Fire & Security', 'Miami-Dade / Broward / Palm Beach (service area)', '', '', '', 'https://www.prizmalarms.com/',
    'Company\'s own site: "Our UL Listed, FM Approved, and CSAA Five Diamond central station facility..." and operators "CSAA (Central Station Alarm Association) certified" (CSAA = TMA\'s former name). Not confirmed on tma.us.',
    'https://www.prizmalarms.com/commercial-fire-alarm/', 'Commercial fire alarm, central station monitoring',
    'Page lists service areas Palm Beach, Broward and Miami-Dade counties; no street address or city on that page. Wording predates the 2017 CSAA->TMA rename, so the claim may be old.',
    flag='self-claim on company site (old CSAA wording); verify current TMA status; HQ city not shown'))
# ---------------- Broward / Palm Beach ----------------
R.append(rec('ADT, LLC', 'Palm Beach', '1501 Yamato Road', 'Boca Raton', '33431', 'https://www.adt.com/',
    'TMA member directory: "TMA Listed Monitoring", ASAP Member, AICC Member' + IDX + '; tma.us board page lists ADT VP on the Executive Committee; 2026 TMA sponsor',
    D + 'adt-llc-4921512 | ' + BOARD, 'Monitoring; national dealer/integrator',
    'tma.us (2021 Marvel Award post) calls ADT "Florida-based". Older directory URL also indexed: ' + D + 'adt-llc-4180608',
    people=[{'name': 'Mike (Michael) Picciola', 'role': 'TMA Vice President, Executive Committee (term expires 2026; re-elected VP for 2026-2028)', 'company': 'ADT, LLC (Boca Raton, FL)', 'source_url': BOARD + ' | ' + ELECT},
            {'name': 'Tiffany Galarza', 'role': 'Co-Chairperson, Alarm Industry Communications Committee (AICC)', 'company': 'ADT (tma.us does not state her location)', 'source_url': COMM},
            {'name': 'Leah Page', 'role': 'Vice President, Mobile Security & Strategic Projects (accepted 2021 TMA/SSI Marvel Award)', 'company': 'ADT, LLC ("Florida-based")', 'source_url': MARVEL21}],
    contact={'name': 'Mike Picciola', 'role': 'TMA Vice President (Executive Committee), ADT, LLC, Boca Raton, FL', 'source': BOARD},
    flag='national company (HQ Boca Raton)'))
R.append(rec('Everon', 'Palm Beach', '1501 Yamato Road', 'Boca Raton', '33431', 'https://www.everonsolutions.com/',
    'TMA Five Diamond Monitoring Center (designated since 1/1/2014) and member directory "TMA Listed Monitoring"' + IDX + '; TMA OpsTech 2026 sponsor',
    FD + 'everon-3670462 | ' + D + 'everon-3584030', 'Commercial monitoring and integration (formerly ADT Commercial)',
    'Directory lists Boca Raton corporate office; operations HQ Irving/Dallas, TX.',
    people=[{'name': 'Don Young', 'role': 'TMA Past President (ex officio board member); 2022 Stanley C. Lott Award (listed as ADT, Boca Raton, FL)', 'company': 'Everon (Boca Raton, FL)', 'source_url': BOARD + ' | ' + LOTT}],
    contact={'name': 'Don Young', 'role': 'TMA Past President (ex officio board), Everon, Boca Raton, FL', 'source': BOARD},
    flag='national company (Boca Raton office)'))
R.append(rec('Johnson Controls Security (JCI)', 'Palm Beach', '6600 Congress Avenue', 'Boca Raton', '33487', 'https://securityproducts.jci.com/',
    'TMA member directory: "TMA Listed Monitoring", AICC Member' + IDX + '; JCI Security Products is a 2026 TMA sponsor',
    D + 'johnson-controls-security-jci-4775722', 'Monitoring / security',
    'National company; TMA board member Mark Miller (JCI) is listed in Aurora, CO, not Florida.', flag='national company (Boca Raton office)'))
R.append(rec('M2M Services', 'Palm Beach', '', 'Boca Raton', '', 'www.m2mservices.com',
    'tma.us "TMA Welcomes Four New Members" post: M2M Services, Associate Member, Boca Raton, FL; directory listing "M2M Services ltd."' + IDX,
    NEWMEM + ' | ' + D + 'm2m-services-ltd-2740136', 'Alarm communications (vendor)', 'Associate member (supplier), not a dealer.',
    flag='vendor/associate member, not a dealer'))
R.append(rec('Residence Control EOOD', 'Palm Beach', '', 'Boca Raton', '', '',
    'TMA member directory search page lists it as associate, Boca Raton, FL' + IDX, 'https://my.tma.us/tmamemberdirectory/FindStartsWith?term=%23%21',
    '', 'Associate member (vendor); only city seen.', flag='vendor/associate member, not a dealer; weak evidence (search snippet only)'))
R.append(rec('NextEra Energy, Inc.', 'Palm Beach', '700 Universe Blvd', 'Juno Beach', '33408', '',
    'TMA Five Diamond Monitoring Center (GSOC/proprietary, designated since 12/1/2022) and member directory listing' + IDX + '; operators listed on TMA online-operator graduates list as "NextEra Energy / FPL Corporate Security"',
    FD + 'nextera-energy-inc-2959726 | ' + D + 'nextera-energy-inc-2740119 | ' + GRADS, 'Proprietary GSOC', 'Utility corporate security center; end user, not a dealer.',
    flag='proprietary GSOC (end user), not a dealer'))
R.append(rec('Guardian Hawk Security', 'Palm Beach', '', 'Lantana', '', '',
    'TMA member directory search page: Lantana, FL, "TMA Listed Monitoring"' + IDX, 'https://my.tma.us/tmamemberdirectory/FindStartsWith?term=%23%21',
    'Alarm installation and monitoring', 'Registered as Guardian Alarm of Florida, LLC per third-party listings; TMA evidence is a search snippet only.',
    flag='weak evidence (search snippet only)'))
R.append(rec('Hauhn & Associates', 'Broward', '', 'Hillsboro Beach', '', '',
    'tma.us Executive Committee & Board page: Jay Hauhn, Hauhn & Associates, Hillsboro Beach, FL, Special Advisor to the President; Bylaws and Ethics committee co-chair',
    BOARD + ' | ' + COMM, 'Industry consultant', 'Consultant (former industry executive); useful as an influencer, not a dealer.',
    people=[{'name': 'Jay Hauhn', 'role': 'Special Advisor to the TMA President (term at will); Co-Chair, Bylaws Committee; Co-Chair, Ethics Committee', 'company': 'Hauhn & Associates (Hillsboro Beach, FL)', 'source_url': BOARD + ' | ' + COMM}],
    contact={'name': 'Jay Hauhn', 'role': 'Special Advisor to the TMA President', 'source': BOARD}, flag='consultant, not a dealer'))
# ---------------- Rest of Florida ----------------
R.append(rec('Criticom Monitoring Services (CMS)', 'Seminole', '', 'Longwood', '', '',
    'TMA member directory: "TMA Listed Monitoring"' + IDX, D + 'criticom-monitoring-services-cms-2740213',
    'Wholesale/contract monitoring for alarm dealers', 'Directory text (via search snippet): supports 3,000+ alarm dealers nationwide.', flag='outside Miami-Dade'))
R.append(rec('First Coast Security (FCS)', 'Duval', '4887 Belfort Road, Suite 400', 'Jacksonville', '32256', 'https://fcssecurity.us/',
    'TMA member directory: "TMA Non-Listed Monitoring"' + IDX + '; also in TMA New Members directory; operators on TMA online-operator graduates list',
    D + 'first-coast-security-fcs-4858730 | https://my.tma.us/newtmamembers/Details/first-coast-security-fcs-4858732 | ' + GRADS,
    'Security services (guard) with monitoring', 'FCS Security Services; large guard company HQ Jacksonville.', flag='outside Miami-Dade; guard-services company'))
R.append(rec('Security Alarm Corporation', 'Charlotte', '17776 Toledo Blade Blvd', 'Port Charlotte', '33948', '',
    'TMA member directory: listed monitoring ("Installation & Monitoring Company"); also named among Florida entries of the Five Diamond Monitoring Centers directory' + IDX,
    D + 'security-alarm-corporation-2740088', 'Installation and monitoring', '', flag='outside Miami-Dade'))
R.append(rec('MasterVision Technologies, LLC', 'Hillsborough', '5112 Le Tourneau Cir', 'Tampa', '33610', '',
    'TMA member directory: "TMA Listed Monitoring"' + IDX, D + 'mastervision-technologies-llc-3277940', 'Monitoring', '', flag='outside Miami-Dade'))
R.append(rec('Scutum Digital', 'Hillsborough', '', 'Tampa', '', '',
    'TMA Five Diamond Monitoring Center directory: "Scutum Digital (Tampa, FL)", designated since 1/1/2016; programs listed: The ASAP Service, FirstNet' + IDX,
    FD + 'scutum-digital-tampa-fl-3103396', 'Monitoring center', '', flag='outside Miami-Dade'))
R.append(rec('COPS Monitoring (Florida center)', '', '', '', '', 'https://copsmonitoring.com/',
    'TMA 2026-2027 Five Diamond approved companies directory entry "COPS Monitoring (FL)"; Five Diamond since 5/1/2014 (company entry); TMA OpsTech 2026 sponsor' + IDX,
    'https://my.tma.us/20262027tmafivediamondapprovedcompanies/Details/cops-monitoring-fl-4755486 | ' + FD + 'cops-monitoring-3103238',
    'Wholesale/contract monitoring', 'HQ Williamstown, NJ; directory says central stations in NJ, FL and TX. Florida city not seen.',
    flag='out-of-state HQ with Florida central station; city unknown'))
R.append(rec('Life Safety Monitoring, LLC', '', '', '', '', '',
    'Named among Florida entries of the TMA Five Diamond Monitoring Centers directory (search summary only; city not seen); operator on TMA online-operator graduates list' + IDX,
    'https://my.tma.us/fivediamondmonitoringcenters/FindStartsWith?term= | ' + GRADS, 'Monitoring center (Automated Security Alert per snippet)',
    'Florida location not confirmed.', flag='weak evidence; Florida location unconfirmed'))
R.append(rec('Immix', 'Hillsborough', '', 'Tampa', '', 'https://www.immixprotect.com/',
    'TMA member directory: associate member, Tampa, FL' + IDX + '; 2026 TMA sponsor; 2023 Mel Mahler Award to Mark McCall (Immix Protect) on tma.us',
    D + 'immix-3634141', 'Monitoring/video software (vendor)', 'Associate member (supplier), not a dealer.', flag='vendor/associate member, not a dealer'))
R.append(rec('WorkHorse', 'Manatee', '', 'Palmetto', '', '',
    'TMA member directory listing, Palmetto, FL' + IDX, D + 'workhorse-4216075', 'Software for alarm companies (vendor)', '',
    flag='vendor, not a dealer'))
R.append(rec('VectorFirm', 'Orange', '', 'Orlando', '', 'www.vectorfirm.com',
    'TMA member directory listing, Orlando, FL' + IDX, D + 'vectorfirm-4719499', '', 'Membership type not seen.', flag='outside Miami-Dade'))
R.append(rec('Micro Key Solutions', 'Osceola', '', 'Kissimmee', '', 'https://microkey.com/',
    'TMA member directory search page: Kissimmee, FL' + IDX + '; TMA OpsTech 2026 sponsor', 'https://my.tma.us/tmamemberdirectory/FindStartsWith | ' + SPONS,
    'Central-station automation software (vendor)', '', flag='vendor, not a dealer'))
R.append(rec('Alyxx.io Networks', 'Osceola', '', 'Saint Cloud', '34771', '',
    'TMA member directory search page: Saint Cloud, FL 34771' + IDX, 'https://my.tma.us/tmamemberdirectory/FindStartsWith', '', 'Membership type not seen.',
    flag='weak evidence (search snippet only)'))
R.append(rec('Redwire', 'Leon', '1136 Thomasville Rd', 'Tallahassee', '', '',
    'TMA member directory search page: Tallahassee, FL' + IDX, 'https://my.tma.us/tmamemberdirectory/FindStartsWith', '', 'Membership type not seen.',
    flag='weak evidence (search snippet only)'))
R.append(rec('Rooney & Associates', 'Pinellas', '', 'Palm Harbor', '', '',
    'TMA member directory search page: Palm Harbor, FL' + IDX, 'https://my.tma.us/tmamemberdirectory/FindStartsWith', '', 'Membership type not seen.',
    flag='weak evidence (search snippet only)'))
json.dump(R, open('/home/user/ash/leadgen/data/tma_members.json', 'w'), indent=1, ensure_ascii=False)
print(len(R), 'records')
