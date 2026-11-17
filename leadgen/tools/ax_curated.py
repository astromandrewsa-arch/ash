# Curated entries for The Alarm Exchange (kirschenbaumesq.com). Built by ax_build.py.
# Keys of CUR are category positions on the "View All" page (0-15). "i" is the listing's position
# inside that category (a list when duplicate/related posts are merged into one entry).
# No phone numbers anywhere. Individuals seeking work: first name only, no personal email.

LISTING = "https://www.kirschenbaumesq.com/page/alarm-exchange?keywords=&category="

CUR = {}

# ---------------------------------------------------------------- 0 Parts - Equipment
CUR[0] = {
    "skipped_note": (
        "26 skipped. Out-of-state dealers clearing surplus stock (no Florida link): FBN Security Co LLC (Hikvision and "
        "Digital Watchdog cameras, 2 posts), Arcom Security (Phoenix AZ, Vivotek cameras), Five Alarm Security (Exacq NVR "
        "and Honeywell NetAXS, 2 posts), Alarm King Inc (OpenEye/Hanwha camera mounts), Gordico (Alarm.com NVR), HSLSS "
        "(Pelco/Axis CCTV), Burnco Integration (Optex PIRs), Accutronic Systems (2GIG/OpenEye), Balco Alarm (Starlink, "
        "Bosch), CMS Monitoring (Bosch receivers; listed again under Central Stations), Lauttamus (3 posts, central "
        "station receivers), Sentry Security Systems (Chesapeake VA), JM Electronic Engineering, First Alarm (Aptos CA), "
        "SAS Security Alarm (TX), Stellar Fire & Security, LAW Security (San Antonio TX), Monalarm Security (Gilbert AZ), "
        "former Sentry Watch station gear (Greensboro NC). Also 3 private individuals selling lots (fire panel, smart-home "
        "lot, Interlogix inventory). The out-of-state camera sellers (FBN, Arcom, Five Alarm, Alarm King, HSLSS, "
        "Gordico) are commercial video dealers that could matter if IRIS expands beyond Florida."),
    "entries": [
        dict(i=29, heading="Kentronix Security (company for sale, Jacksonville area)", poc="Tom Kent",
             role="Listed contact (owner's company; seller)", municipality="Orange Park", state="FL", zip="32073",
             website="http://www.kentronixsecurity.com", email="info@Kentronixsecurity.com",
             business_type="Dealer/Integrator",
             why=("Same sale is posted under Merger and Acquisitions (full entry there). Owner-run Florida dealer, 70% "
                  "commercial, whose own website says it serves Dade, Broward and Palm Beach counties."),
             next_step="watch for growth (see the Merger and Acquisitions entry)", florida=True, miami_dade=True),
        dict(i=12, heading="Scorpion Fire and Safety, LLC", poc="Corey Feldman", role="Listed contact",
             state="FL", email="general.scorpionfire@outlook.com", business_type="Dealer/Integrator",
             why=("Small fire/life-safety contractor whose listed contact number carries a Miami-Dade/Keys area code, so "
                  "it is almost certainly South Florida (city not stated; no website found; Sunbiz lookup blocked). "
                  "Fire-only work is a weaker fit for a camera product, but it serves commercial buildings locally."),
             next_step="verify location and whether they install cameras; low-priority reseller prospect",
             florida=True, miami_dade=False),
        dict(i=19, heading="Executive Electronics of Southwest Florida (E&E Security)", poc="Greg Minerva",
             role="Listed contact", municipality="Naples", state="FL", zip="34103",
             website="https://www.eesecurity.net/", email="greg@eesecurity.net", business_type="Dealer/Integrator",
             why=("Florida integrator (Naples and Bonita Springs, plus a Tampa office per its own website) that carries "
                  "access control and Axis video lines, but its site positions it as high-end residential smart home, "
                  "and it is in Southwest Florida, not Miami-Dade."),
             next_step="not a fit now (residential focus, outside Miami-Dade); keep on the Florida list",
             florida=True),
        dict(i=8, heading="NuTech National (parts wanted)", poc="Carol Montañez", role="Account Manager",
             municipality="Maitland", state="FL", zip="32751", website="https://nutechsecure.com/",
             email="cmontanez@nutechnational.com", business_type="Dealer/Integrator",
             why=("Florida-headquartered national alarm/CCTV servicing network; this post is a parts request. The full "
                  "NuTech entry is under Sub Contractors."),
             next_step="approach as channel partner (see the Sub Contractors entry)", florida=True),
    ],
}

# ---------------------------------------------------------------- 1 Sub Contractors
CUR[1] = {
    "skipped_note": (
        "52 skipped: out-of-state subcontractors offering work or out-of-state companies seeking subs, none in Florida. "
        "Commercial video/access installers among them (possible partners if IRIS expands): River City Alarm Systems "
        "(Sacramento CA), All Action Alarm (Long Island NY), Bezemer Industries (Central CA), S.O.P. Complete dba "
        "Defilade Security (Charlotte NC), Secufire LLC (Knoxville TN, 3 posts), Industrial Communications LLC (WA), "
        "Cotel (NYC), Beyond Tech Solutions (CA), SL Security Pros (Long Island), Aegis Protective Solutions (SC), "
        "Mechanize Security (SC), Renewable IT Support (VA), KSHO Alarm Service (Houston), SS Tech / Safe and Sound "
        "Technologies (TX), Radcom (NYC, IBEW), Quantum Watch (Canada). Out-of-state companies seeking subs: Alert 360 "
        "(Virginia Beach), Alarm New England (CT/MA/RI), JP Systems (VT, 2 posts), HSLSS (NYC/NJ), Pom-Tec (NYC), Alarm "
        "Service Company of America (NC), Security Solutions / alarmyou (residential, 3 posts), E Shore Technologies (2 "
        "posts; main entry under License Holders), Sight and Sound Systems (VA/MD), Wain Security (OH), Ammarco dba "
        "Safeco Security (CA), Fedora Intertech (construction-site video, Maui), CSS (CT), Arrow Systems (Atlanta), AWS "
        "Security (CT), ABF Security (NJ), Transecurity (NE Texas), Secure4industry (LA). Fire-only or design "
        "shops: TBSC Fire System Alarms, All American Fire Systems (CA), ACT Engineering (DE), Securac BDA (TX). One "
        "individual tech team (NJ/NY/PA/CT)."),
    "entries": [
        dict(i=5, heading="Protective Security Solutions Inc.", poc="Brian Messier", role="Listed contact",
             municipality="Miami (unincorporated Miami-Dade, Kendall area)", state="FL", zip="33186",
             website="http://protectivesecuritysolutions.com (did not load on 17 Nov 2026: TLS handshake failure / 503)",
             email="brian@protectivesecuritysolutions.com", business_type="Dealer/Integrator",
             why=("Small Miami-Dade fire and security company (city and ZIP from its active Florida DBPR Certified Alarm "
                  "System Contractor I (EF) license, leadgen/data/dbpr_licenses.json; the listing itself gives no city "
                  "but the contact number has a Miami-area code). NICET and FASA/BASA certified, offering service, "
                  "inspection, repair and install work: a good size and profile for an IRIS reseller "
                  "near the Homestead/Coral Gables zones."),
             next_step="approach as reseller", florida=True, miami_dade=True),
        dict(i=[24, 13, 27, 28, 30, 32, 33],
             heading="NuTech National (national alarm/CCTV servicing network, Maitland FL)", poc="Melissa Torreano",
             role="Listed contact (Florida post); other posts list Melanie Felty, Payton Chestnutt (Service Coordinator "
                  "National Accounts), Diane Feger and Carol Montanez",
             municipality="Maitland", state="FL", zip="32751", website="https://nutechsecure.com/",
             email="melissa@nutechnational.com", business_type="Dealer/Integrator",
             why=("Florida-headquartered (Maitland, Florida license EF0001056 per its website) servicing network that "
                  "runs burglar, fire and CCTV service for national commercial clients and U.S. government sites, using "
                  "local subcontractors nationwide. A single agreement could put IRIS in front of many national-account "
                  "commercial buildings, including in South Florida."),
             next_step="approach as channel partner", florida=True),
        dict(i=[43, 47], heading="Global Axiom (seeking subcontractors, incl. Northern Florida)",
             poc="Renee Williams", role="Listed contact", website="https://www.globalaxiom.com/",
             email="Renee.williams@GlobalAxiom.com", business_type="Monitoring Center",
             why=("National provider whose website sells AI plus human remote video monitoring with 'voice-down or "
                  "escalation to first responders'; it subcontracts commercial/retail access control, burg and "
                  "interactive CCTV installs nationwide, with an immediate need in Northern Florida. Close to IRIS's "
                  "first-responder use case: partner or competitor."),
             next_step="approach as channel partner (also note as adjacent competitor)", florida=True),
        dict(i=7, heading="Samantha Design - Fire Alarm & BDA/ERRCS Design", poc="Samantha Young",
             role="Listed contact (designer)", state="FL", email="samanthadesign22@gmail.com",
             business_type="Subcontractor",
             why=("Florida-based fire alarm and BDA/ERRCS (first-responder radio coverage) designer who works for many "
                  "contractors and integrators; not a reseller, but a referral source to Florida commercial contractors "
                  "who already sell first-responder in-building systems."),
             next_step="watch / possible referral partner", florida=True),
        dict(i=29, heading="Granite Communications & Security (seeking an access-control sub in New Jersey)",
             poc="Randy Conkli", role="Listed contact", municipality="Lutz", state="FL", zip="33548",
             website="https://granitecs.com/", email="randy.c@granitecs.com", business_type="Dealer/Integrator",
             why=("The listing is for New Jersey work, but the company's own website gives a Lutz, FL (Tampa area) "
                  "address and describes CCTV, access control, networking and cabling for apartment/multi-tenant "
                  "properties and small businesses: a Florida camera and access integrator with multi-state jobs. "
                  "Right product fit; outside Miami-Dade."),
             next_step="approach as reseller (secondary; Florida outside Miami-Dade)", florida=True),
        dict(i=22, heading="Amelia Service Group (nationwide subcontract installers wanted)", poc="Scott Pitts",
             role="President", email="ops@ameliaservicegroup.com", business_type="Dealer/Integrator",
             why=("National systems integrator/data infrastructure firm recruiting subcontract installers. Its "
                  "president also posts as a Florida EF license holder (see License Holders), so it may be setting up "
                  "or qualifying Florida work."),
             next_step="watch for growth", florida=False),
        dict(i=[58, 53, 57], heading="Watchtower Security (multifamily surveillance, nationwide)",
             poc="Inna Kogan", role="Listed contact", website="watchtower-security.com (from email domain)",
             email="ikogan@watchtower-security.com", business_type="Dealer/Integrator",
             why=("Nationwide surveillance provider for multifamily housing, recruiting install subs across the US "
                  "(Memphis, San Francisco, Baltimore and 'all around the US'). Multifamily buildings with existing "
                  "cameras are an IRIS use case; a national installer is a possible channel."),
             next_step="approach as channel partner (low priority)", florida=False),
    ],
}

# ---------------------------------------------------------------- 2 License Holders / Qualifiers
CUR[2] = {
    "skipped_note": (
        "28 skipped: license holders or companies seeking license holders outside Florida (NY, NJ, IL, TX, CA, AZ, MI, MO, "
        "MD, NC/SC, GA/NC, TN/VA, UT/CA, multi-state West Coast) - e.g. Security Camera Systems Inc. owner (Staten "
        "Island), Phoenix Security (WA and 9 other states, 2 posts), Westec Security Network (MI), Safe and Sound "
        "Technologies (TX), MannComm Solutions (GA/NC), Miles Security Solutions (NJ), Somerset Fire Alarm and Security "
        "(MD), Optimum Fire and Security (NC/SC), Chorus (Mississippi), JP Systems (VT/NH/MA/NY), Archer Security "
        "Services (CA), TPB Design Engineering (NJ), an Illinois qualifier (posted Sep 2023), plus private individuals. Also "
        "K&K's own qualifier-placement notices (listing 1 and an Illinois request posted 20 Apr 2021); K&K is covered "
        "under Business Brokers."),
    "entries": [
        dict(i=27, heading="Krandog Consulting (Florida EF license holder, Miami)", poc="Lee Ehrenkrantz",
             role="Listed contact (license holder)", municipality="Miami", state="FL",
             website="krandogconsulting.com (parked/redirect page on 17 Nov 2026)",
             email="lee@krandogconsulting.com", business_type="Consultant/Broker",
             why=("Miami-based Florida-licensed low-voltage contractor (EF) whose license scope covers camera "
                  "surveillance and access control, offering to qualify companies. He sees which small Miami companies "
                  "are starting up or need a qualifier, so he is a referral route to new owner-run Miami dealers."),
             next_step="approach as channel partner (referral)", florida=True, miami_dade=True),
        dict(i=35, heading="All Secure (Orlando) - EF fire alarm qualifier available", poc="Rob Lucas",
             role="Listed contact (license holder)", municipality="Orlando", state="FL",
             website="https://allsecureus.com/", email="rlucas@allsecureus.com", business_type="Dealer/Integrator",
             why=("Orlando integrator (fire, security, access, AV, networking, nurse call, CCTV; commercial and "
                  "residential per its website). Right profile for IRIS but in Central Florida, not Miami-Dade."),
             next_step="approach as reseller (secondary, outside Miami-Dade)", florida=True),
        dict(i=[14, 34], heading="Florida EF (unlimited alarm) + Certified Building Contractor license holder",
             poc="Michael", role="License holder offering to qualify a company (individual; first name only)",
             state="FL", business_type="Other",
             found=("Two listings, no posting date shown: an individual holding an unlimited Florida alarm license (EF) "
                    "for all of Florida and a Florida Certified Building Contractor (CBC) license offers to qualify a "
                    "company ('make me an offer'); Kirschenbaum Qualifier Agreement required. The contact number has a "
                    "Broward-area code. Personal contact details omitted by policy."),
             why=("South Florida-based license holder; useful only as a pointer for a dealer partner that needs a "
                  "qualifier, not as an IRIS lead."),
             next_step="not a fit (individual); note for partners needing a qualifier", florida=True),
        dict(i=21, heading="Fuller Sound AV - Florida EF qualifier available", poc="Brian Jones",
             role="Listed contact (license holder)", state="FL",
             website="fullersoundav.com (could not be reached on 17 Nov 2026)", email="brian@fullersoundav.com",
             business_type="Other",
             why=("Florida EF qualifier (burglar, fire and all low voltage, statewide) attached to an AV company; the "
                  "contact number has a Florida Panhandle area code, so far from Miami-Dade."),
             next_step="watch", florida=True),
        dict(i=18, heading="BDH Technical Systems - Florida ES and Georgia low-voltage license holder",
             poc="Craig Bruce", role="Listed contact (license holder)", state="FL",
             website="bdhtechnicalsystems.com (returned 404 on 17 Nov 2026)", email="craig@bdhtechnicalsystems.com",
             business_type="Other",
             why=("Holds a Florida ES license and a Georgia unrestricted low-voltage license; contact number has a "
                  "Jacksonville-area code. Services of the company are not stated."),
             next_step="watch", florida=True),
        dict(i=10, heading="Florida EF license holder available (Scott Pitts)", poc="Scott Pitts",
             role="Listed contact (license holder; President of Amelia Service Group per another listing)",
             email="scott@pittsemail.com", business_type="Consultant/Broker",
             why=("Florida EF holder seeking to qualify a professional company; he also runs Amelia Service Group, a "
                  "nationwide integrator recruiting installers (see Sub Contractors)."),
             next_step="watch for growth", florida=True),
        dict(i=6, heading="E Shore Technologies - seeking license holders in 15 states incl. Florida",
             poc="Justin Lindner", role="Listed contact", website="eshoretechnologies.com (from email domain)",
             email="sales@eshoretechnologies.com", business_type="Dealer/Integrator",
             why=("Multi-state low-voltage company (alarm, access control, CCTV, fire; also hiring in Baltimore and "
                  "seeking subs in Virginia Beach/Norfolk and Maine) that wants license holders in Florida among 14 "
                  "other states and pays the fees. Expanding into Florida; could carry IRIS there."),
             next_step="watch for growth", florida=True),
        dict(i=4, heading="Established Florida fire alarm company seeking a sprinkler qualifier", poc="John Lane",
             role="Listed contact", state="FL", email="lanej2265@msn.com", business_type="Dealer/Integrator",
             why=("Unnamed established Florida fire alarm company (contact number has an Orlando-area code) adding "
                  "sprinkler service, testing and inspection. Fire-focused and Central Florida: weak IRIS fit."),
             next_step="not a fit now", florida=True),
        dict(i=2, heading="Stay Safe Ventures, LLC - multi-jurisdiction license qualifier", poc="Roy Pollack",
             role="Listed contact (license qualifier)", state="FL", website="https://staysafe.net/",
             email="roy@staysafe.net", business_type="Other",
             why=("Qualifier licensed in multiple jurisdictions; his company runs online electrical and alarm CEU "
                  "courses (Florida courses 'coming soon' per its site). Contact number has a Palm Beach-area code. "
                  "Peripheral to IRIS."),
             next_step="not a fit", florida=True),
        dict(i=32, heading="Advantage Security Corp - multi-state license holder incl. Florida",
             poc="Allen Sellars", role="Listed contact (license holder)", website="advantagesecuritycorp.com",
             business_type="Other",
             why=("Holds a Florida Alarm System Contractor II license plus GA, SC, VA, UT, AL, Wichita KS and Texas "
                  "licenses; member of a Georgia home builders group, so likely Georgia-based."),
             next_step="not a fit", florida=True),
        dict(i=39, heading="Florida EF (all low voltage and fire) license holder", poc="Kar",
             role="License holder offering to qualify a company (individual; first name as signed)", state="FL",
             business_type="Other",
             found=("Listing, no posting date shown: an individual holding a Florida 'Alarm 1 EF' license (all low "
                    "voltage and fire) offers to qualify a company; company pays for the K&K Qualifier Agreement. "
                    "Contact number has a Treasure Coast area code. Personal contact details omitted by policy."),
             why="Florida license holder only; not a dealer lead.", next_step="not a fit (individual)",
             florida=True),
        dict(i=7, heading="Anonymous qualifier licensed in 40 states (incl. Florida Alarm System Contractor)",
             poc="Eileen Wagda", role="K&K License Coordinator (listed contact)",
             email="EWagda@Kirschenbaumesq.com", business_type="Other",
             found=("Listing, no posting date shown: an anonymous license holder/qualifier with licenses in 40 states "
                    "(including Florida Alarm System Contractor, Georgia low voltage unrestricted, Texas, California "
                    "C-7/C-10, New York security and fire, and others) and NICET III in fire alarm seeks an executive "
                    "position obtaining licenses for a company nationwide. Contact is through K&K's License "
                    "Coordinator."),
             why="Florida-licensed individual seeking an executive role; not an IRIS lead.",
             next_step="not a fit", florida=True),
    ],
}

# ---------------------------------------------------------------- 3 Help Wanted
CUR[3] = {
    "skipped_note": (
        "38 skipped: out-of-state employers hiring techs, managers or salespeople. Commercial video/access integrators "
        "among them (useful only if IRIS expands): Tulsa Surveillance Technologies (Tulsa OK, commercial video, 2 posts), "
        "GM Data Communications (Long Island NY; Milestone, LenelS2, Axis, Hanwha), Advanced Integration LLC (Warwick "
        "NY, IP CCTV), eCLIPSE Network Solutions (Albany NY), A3 Communications (Nashville, access/video sales), "
        "Egan Security Group (Vail CO), SL Security Pros (Lindenhurst NY), Contral Security (Blairstown NJ), Powered "
        "Protection (Buffalo NY), Marshall Alarm Systems (Yorktown NY), HSLSS (NYC/NJ), E Shore Technologies "
        "(Baltimore; main entry under License Holders), EMC Security (Atlanta, commercial PM), Alarm New England "
        "(Newburyport MA), CSI Security (LA County), Premier Security Services (LA), Fidelity Burglar & Fire Alarm "
        "(Philadelphia, 2 posts), ESCC (NYC, high-end residential), Brookhill Tech Designs (Oceanside NY). Others: Jade "
        "Alarm Co. (Kansas City, 5 posts incl. central station operators), IDS Research & Development (Tenafly NJ, "
        "forensic alarm expert), Systems Design Co (East End, Long Island NY), DSI Security (Dothan AL, guard company), "
        "AlertONE Service (Rancho Cucamonga CA; contact number has a Florida area code but the job and company are in "
        "California, website parked), Pincus Security (Rockland NY), Ammarco dba Safeco Security (CA), Hermary (SF Bay "
        "Area), Security Solutions / alarmyou (Chicago, residential), a Franklin NC low-voltage firm, SLH Home Systems "
        "(MN), NAPCO Security Technologies (manufacturer, Amityville NY) and an anonymous NYC central station manager "
        "search via K&K."),
    "entries": [
        dict(i=[29, 30], heading="IDS Alarm Services, Inc. (hiring senior techs: Central Florida and NE Florida)",
             poc="Jay Lassiter", role="Listed contact", municipality="Kingsland", state="GA", zip="31548",
             website="https://www.idsalarm.com/", email="jay@idsalarm.net", business_type="Dealer/Integrator",
             why=("Commercial security, fire and CCTV dealer (founded 1990, Kingsland GA per its website) that serves "
                  "businesses in Florida and Georgia and is hiring in Central and Northeast Florida with signing "
                  "bonuses: a growing commercial camera installer in Florida, though not in Miami-Dade."),
             next_step="approach as reseller (secondary; Florida outside Miami-Dade)", florida=True),
        dict(i=[27, 26], heading="NuTech National (hiring techs at military-contractor sites: Orlando FL, Grand Prairie TX)",
             poc="Carol Montanez", role="Listed contact", municipality="Maitland", state="FL", zip="32751",
             website="https://nutechsecure.com/", email="cmontanez@nutechnational.com",
             business_type="Dealer/Integrator",
             why="Same Florida-headquartered national servicing network as the Sub Contractors entry; shows growth.",
             next_step="approach as channel partner (see Sub Contractors entry)", florida=True),
        dict(i=22, heading="Florida EF + NICET IV fire/security professional seeking a role (SW Florida)",
             poc="Eric", role="Job seeker (individual; first name only)", municipality="?", state="FL",
             business_type="Other",
             found=("Listing, no posting date shown: an experienced fire alarm and security professional in Southwest "
                    "Florida (Lee/Collier counties) with a Florida EF license and NICET IV, experienced in everything "
                    "except sales, wants to assist and possibly qualify a small burglar, fire alarm, central station or "
                    "security integrator. Personal contact details omitted by policy."),
             why=("Not a dealer lead; a Florida-licensed resource a partner dealer could hire or use as qualifier."),
             next_step="not a fit (individual)", florida=True),
    ],
}

# ---------------------------------------------------------------- 4 Position Wanted
CUR[4] = {
    "skipped_note": ("1 skipped: a semi-retired electronic security owner in Michigan City, Indiana seeking part-time "
                     "sales/consulting work in NW Indiana/SW Michigan (individual, out of area)."),
    "entries": [],
}

# ---------------------------------------------------------------- 5 Merger and Acquisitions
CUR[5] = {
    "skipped_note": (
        "12 skipped: out-of-state account sales handled by K&K (Southern Middle Tennessee; central New Jersey, asking "
        "$185,000; San Bernardino County CA; Atlanta and Cordele GA with Brivo access control and Eagle Eye cameras; "
        "Syracuse NY; Riverside CA with 88 camera service accounts; San Antonio TX; Queens NY with CCTV and access "
        "control service clients, $17,000 RMR; Litchfield/Fairfield CT; Poughkeepsie NY, about $50,000 RMR) and two "
        "buyers outside the target market: an anonymous East Coast buyer of residential accounts (via K&K) and NSSI "
        "(nssi.net), buying fire, security, access and camera accounts in Southern California."),
    "entries": [
        dict(i=7, heading="For Sale: Miami-Dade commercial alarm accounts (165 accounts, seller anonymous, via K&K)",
             poc="Ken Kirschenbaum", role="Seller's attorney (as stated); NDA via Kathleen Lampert",
             municipality="Miami", state="FL", website="https://www.kirschenbaumesq.com/",
             email="KLampert@Kirschenbaumesq.com", business_type="Dealer/Integrator",
             why=("An anonymous seller is offering 165 all-commercial accounts in Miami-Dade (101 commercial security, "
                  "64 commercial fire; most in Miami; net RMR about $7,200). Whoever buys them gains commercial "
                  "buildings in Miami-Dade, which is the IRIS reseller profile; the seller is leaving these accounts."),
             next_step="watch for the sale; approach the buyer as reseller once known", florida=True,
             miami_dade=True),
        dict(i=15, heading="Kentronix Security (company for sale, Jacksonville area; serves Dade/Broward/Palm Beach)",
             poc="Tom Kent", role="Listed contact (seller)", municipality="Orange Park", state="FL", zip="32073",
             website="http://www.kentronixsecurity.com", email="info@Kentronixsecurity.com",
             business_type="Dealer/Integrator",
             why=("Owner-run, veteran-owned dealer, 53 years under one owner, about $31,850 gross RMR at 70% commercial, "
                  "two technicians, Micro Key software. Its website (Orange Park) says it serves Duval, Clay, St. "
                  "Johns, Nassau, Palm Beach, Broward and Dade counties and lists a Fort Lauderdale line; the IAF "
                  "directory also shows a Kentronix office in Plantation (Broward). The 87-year-old owner is retiring, "
                  "so a buyer will inherit a commercial Florida base."),
             next_step="watch for the sale; approach the new owner (or the Plantation office) as reseller",
             florida=True, miami_dade=True),
        dict(i=1, heading="For Sale: Tampa, Florida alarm accounts (about 180 accounts, via K&K)",
             poc="Kathleen Lampert", role="Listed contact (K&K, NDA)", municipality="Tampa", state="FL",
             email="KLampert@Kirschenbaumesq.com", business_type="Dealer/Integrator",
             why=("Small Tampa dealer (one tech) selling about $12,350 net RMR, half commercial intrusion plus 80 "
                  "commercial fire. Outside Miami-Dade; the buyer may be a Florida dealer to watch."),
             next_step="watch", florida=True),
        dict(i=2, heading="For Sale: Sarasota / Fort Myers accounts (18 accounts, via K&K)",
             poc="Ken Kirschenbaum", role="Listed contact for buyers (K&K)", municipality="Sarasota", state="FL",
             email="Ken@Kirschenbaumesq.com", business_type="Dealer/Integrator",
             why="Tiny, mostly residential book (net RMR about $417) on the Gulf Coast. Low relevance.",
             next_step="not a fit", florida=True),
    ],
}

# ---------------------------------------------------------------- 6 Central Stations
CUR[6] = {
    "skipped_note": (
        "10 skipped: stations that are local to New York or Texas or Canada, or not stated as nationwide (Metrodial, "
        "Counterforce Central Alarm Services, Electronix Systems, Alarm Tech Central - all NY; Dispatch Center Ltd. "
        "(Texas licensed); Allstate Security Industries (Texas; video verification); Com-Linq; Northern911 and The "
        "Security Response Center (Canada)) and Frontpoint (residential DIY company buying residential/small-business "
        "accounts)."),
    "entries": [
        dict(i=1, heading="COPS Monitoring", poc="Diane", role="Listed contact (first name only on the listing)",
             website="https://www.copsmonitoring.com", email="info@copsmonitoring.com",
             business_type="Monitoring Center",
             why=("Large nationwide wholesale central station with a Florida monitoring center (Boca Raton per its "
                  "website) plus NJ and TX, monitoring burglary, fire and video for dealers. Possible channel or "
                  "referral partner to the Florida dealers it serves."),
             next_step="approach as channel partner", florida=True),
        dict(i=0, heading="Rapid Response Monitoring", website="http://www.rrms.com", email="sales@rrms.com",
             business_type="Monitoring Center",
             why=("National wholesale central station (audio, video, IP, commercial) already monitoring Florida dealer "
                  "accounts (the Sarasota account sale says 'Monitored by Rapid Response'). Channel partner candidate."),
             next_step="approach as channel partner"),
        dict(i=5, heading="National Monitoring Center (NMC) and Netwatch North America",
             poc="Tatiana Abramek; Nicola Oakie",
             role="Senior Sales Executive, NMC; Vice President of Sales, Netwatch North America",
             email="tabramek@nmccentral.com; noakie@netwatchusa.com", business_type="Monitoring Center",
             why=("Nationwide wholesale station (CA and TX) selling dealers Netwatch proactive video monitoring: "
                  "dealers using it already sell recurring video services to commercial sites, which is where IRIS "
                  "fits; also a possible integration partner."),
             next_step="approach as channel partner"),
        dict(i=23, heading="Legacy Security Services, Inc.", poc="Mike Putman", role="Listed contact",
             website="https://legacysecurityinc.com", email="sales@legacysecurityinc.com",
             business_type="Monitoring Center",
             why=("Southeastern wholesale station (Greenville SC, Denham Springs LA) offering remote video, dealer "
                  "financing and equipment distribution to dealers."),
             next_step="approach as channel partner (low priority)"),
        dict(i=10, heading="TMS - Total Monitoring Services", poc="Dawn Smith", role="Listed contact",
             website="https://www.tmscentral.com/", business_type="Monitoring Center",
             why="Wholesale station supporting video verification (Videofied, CHeKT) for dealers.",
             next_step="watch"),
        dict(i=13, heading="GMS - General Monitoring Service", website="https://www.gmscentral.com",
             email="info@gmscentral.com", business_type="Monitoring Center",
             why="Nationwide wholesale monitoring incl. video and IoT for dealers.", next_step="watch"),
        dict(i=15, heading="Affiliated Monitoring", poc="Mike Zydor", role="Listed contact",
             website="http://www.affiliated.com", email="sales@affiliated.com", business_type="Monitoring Center",
             why="Nationwide wholesale station (TX, NJ), UL video listed, with dealer apps and transfer incentives.",
             next_step="watch"),
        dict(i=16, heading="Becklar Monitoring", poc="Troy Iverson", role="Listed contact",
             website="http://www.becklar.com", email="sales@agmonitoring.com", business_type="Monitoring Center",
             why="North America-wide wholesale station with dealer dashboards; commercial and video monitoring.",
             next_step="watch"),
        dict(i=22, heading="Emergency24", poc="Tom McNeil", role="VP of Sales and Marketing",
             email="Tmcneil@emergency24.com", business_type="Monitoring Center",
             why="National wholesale central station with four monitoring centers, including video.",
             next_step="watch"),
        dict(i=21, heading="CMS Monitoring", poc="Tara Subbiondo", role="Listed contact",
             municipality="Farmingdale", state="NY", website="http://www.cmsmonitoring.com",
             email="sales@cmsmonitoring.com", business_type="Monitoring Center",
             why="Wholesale monitoring available in all 50 states.", next_step="watch"),
        dict(i=19, heading="Cen-Signal", municipality="Columbus", state="GA", website="http://www.cen-signal.com",
             email="sales@censignal.com", business_type="Monitoring Center",
             why="Southeastern wholesale station licensed nationwide; serves many Southeast dealers.",
             next_step="watch"),
        dict(i=6, heading="USA Central Station Alarm Corp", poc="Joyce Rosito; Cliff Thompson",
             role="Listed contacts", website="http://www.usacentralstation.com",
             email="joyce.rosito@usacs.net; cliff.thompson@usacs.net", business_type="Monitoring Center",
             why="Monitoring throughout the United States for dealers.", next_step="watch"),
        dict(i=3, heading="NationWide Central Station Monitoring Corp", poc="Alan Ankeles", role="Listed contact",
             website="http://www.NationwideDigital.com", email="aankeles@NationwideDigital.com",
             business_type="Monitoring Center", why="UL-listed station monitoring 'all of America'.",
             next_step="watch"),
        dict(i=4, heading="Statewide Monitoring", poc="Steven Coppola", role="Listed contact",
             website="http://www.statewidecs.com", email="Steven@statewidecs.com", business_type="Monitoring Center",
             why="Nationwide wholesale monitoring of burglary, fire and video.", next_step="watch"),
        dict(i=20, heading="Central Security Communications, Inc.", poc="Natalie",
             role="Listed contact (first name only on the listing)", website="http://www.centralsecurity.com",
             email="Natalie@centralsecurity.com", business_type="Monitoring Center",
             why="Family-owned station monitoring throughout the USA since 1963.", next_step="watch"),
    ],
}

# ---------------------------------------------------------------- 7 Business Brokers / Consultants
CUR[7] = {
    "skipped_note": ("5 skipped: HR consulting (TRK HR Management Services, LA), Reitman Consulting Group (tax/financial; "
                     "listed again under Financial Services), Strandberg Consulting (NJ business coaching), Harding "
                     "Security Services (Canada-only broker), and an individual sales/franchise consultant in Arizona."),
    "entries": [
        dict(i=11, heading="Alarm Consulting Group, Inc.", poc="Kurt W Becker", role="Listed contact",
             state="FL", website="http://www.alarmconsultinggroup.com", email="kwbecker@alarmconsultinggroup.com",
             business_type="Consultant/Broker",
             why=("Consultant to alarm companies on operations, licensing, quality-control inspections for buyers and "
                  "sellers, and central-station evaluation; contact number has a Palm Beach-area code (no address on "
                  "the website). Knows Florida dealers' operations; possible referral partner."),
             next_step="approach as channel partner (referral)", florida=True),
        dict(i=10, heading="Rooney & Associates, Inc. (retired)", poc="John J. Rooney", role="President/Owner",
             municipality="Palm Harbor", state="FL", business_type="Consultant/Broker",
             why="Florida alarm-industry specialist since 1973, but the listing says RETIRED.",
             next_step="not a fit", florida=True),
        dict(i=0, heading="Kirschenbaum & Kirschenbaum PC (host of The Alarm Exchange; account brokering)",
             poc="Ken Kirschenbaum", role="Listed contact (attorney; finds buyers and sellers)",
             municipality="Garden City", state="NY", zip="11530", website="https://www.kirschenbaumesq.com/",
             email="Ken@Kirschenbaumesq.com", business_type="Consultant/Broker",
             why=("Alarm-industry law firm that runs this exchange, brokers account sales (including the Miami-Dade, "
                  "Tampa and Sarasota books listed now) and says its contracts are used by over 6,000 alarm companies. "
                  "Posting on The Alarm Exchange is free (email Ken); vendors such as Verkada, Link Business "
                  "Communications and MongoTel already post dealer-revenue programs in the RMR category, so an IRIS "
                  "dealer-program listing could go there."),
             next_step="post an IRIS dealer-program listing; ask to be told of Florida account buyers",
             florida=False),
        dict(i=[3], heading="Acquisition and Funding Services (AFS)", poc="Rory Russell", role="Owner",
             website="http://www.afssmartfunding.com", email="Rory.Russell@afssmartfunding.com",
             business_type="Consultant/Broker",
             why=("Nationwide broker representing some of the largest buyers in North America and sellers of all "
                  "sizes; sees which dealers are buying and growing."),
             next_step="watch"),
        dict(i=6, heading="Vertex Capital", poc="Barry Epstein", role="President",
             website="http://www.vertexcapitalcorp.com", email="bepstein@vertexcapitalcorp.com",
             business_type="Consultant/Broker",
             why="Sell-side M&A for monitoring, integration, fire, guard and PERS companies nationwide.",
             next_step="watch"),
        dict(i=9, heading="Giacalone Associates, LLC", poc="Peter Giacalone", role="Listed contact",
             website="http://www.giacaloneassociates.com", email="peter@giacaloneassociates.com",
             business_type="Consultant/Broker",
             why=("Represents active buyers of third-party central stations and of full-service dealers and "
                  "integrators; advisory work with dealers."),
             next_step="watch"),
        dict(i=12, heading="Egan Security Group (broker)", poc="Pat Egan", role="Listed contact",
             website="https://egansecuritygroup.com/", email="pegan@egansecuritygroup.com",
             business_type="Consultant/Broker",
             why="Alarm-business broker with over 200 transactions; publishes current listings of businesses for sale.",
             next_step="watch"),
        dict(i=13, heading="Alarm Acquisitions (broker)", poc="Robert Lintz", role="Listed contact",
             website="http://www.alarm-acquisitions.com", email="Acquisitions100@gmail.com",
             business_type="Consultant/Broker", why="Broker helping dealers grow by acquisition or sell accounts.",
             next_step="watch"),
        dict(i=7, heading="Dealer Cortex LLC", poc="Justin Steigerwalt", role="Listed contact",
             website="https://www.dealercortex.com", email="jws@DealerCortex.com", business_type="Consultant/Broker",
             why=("Technology and process consultant specifically for small and medium alarm dealers and integrators: "
                  "the same segment IRIS sells through."),
             next_step="approach as channel partner (low priority)"),
    ],
}

# ---------------------------------------------------------------- 8 Insurance
CUR[8] = {
    "skipped_note": ("7 skipped: insurance agencies for alarm companies with no Florida tie or channel value for IRIS "
                     "(The Insurance Center, Alarm Shield / John T. Costa Agency, J. Krug and Associates, Paris Kirwan "
                     "Associates, Snelling Walters, Central Insurance Agency, Eclipse Marketing & Insurance)."),
    "entries": [
        dict(i=5, heading="Merrill Insurance - Alarm Association of Florida endorsed program",
             website="merrillinsurance.com (from email domain)", email="askme@merrillinsurance.com",
             business_type="Other",
             why=("Exclusive insurance partner of the Alarm Association of Florida (liability and E&O for security, "
                  "fire, monitoring and integrators). Not a lead; useful context on the Florida association network and "
                  "on E&O questions dealers may raise about giving police camera access."),
             next_step="not a fit (context only)", florida=True),
        dict(i=3, heading="Security America insurance (founded by ESA) / ESA membership",
             poc="Crystal Jacobs; Rhett Butler; Jared Buhanan",
             role="Listed contacts (insurance); ESA membership contact", email="info@securityamericains.com; membership@esaweb.org",
             business_type="Other",
             why="Insurance arm of the Electronic Security Association; ESA itself is listed under Associations.",
             next_step="not a fit (see ESA entry)"),
    ],
}

# ---------------------------------------------------------------- 9 Financial Services
CUR[9] = {
    "skipped_note": ("4 skipped: Reitman Consulting Group (tax/financial advisory), AFS (duplicate of the Business "
                     "Brokers entry), AlarmCredit.com (consumer equipment financing for dealers) and Astute Financial "
                     "Consulting (bookkeeping/reporting)."),
    "entries": [
        dict(i=3, heading="Wise Financial Consulting", poc="Ken Wiesenfeld", role="Listed contact", state="FL",
             website="https://www.wisefincon.com/", email="ken@wisefincon.com", business_type="Consultant/Broker",
             why=("Accounting, fractional-CFO and sell-side preparation for fire and security companies (Sedona, "
                  "QuickBooks, FieldHub); contact number has a Palm Beach-area code. Works inside owner-run Florida "
                  "dealers; possible referral source, not a reseller."),
             next_step="watch / possible referral partner", florida=True),
        dict(i=5, heading="Security Owners Group (peer financial reviews for integrators)", poc="Armando Perez",
             role="Listed contact", website="https://www.SecurityOwnersGroup.com",
             email="Armando@SecurityOwnersGroup.com", business_type="Consultant/Broker",
             why=("Runs quarterly anonymized peer groups for security integrator owners; a way to reach many owner-run "
                  "integrators at once with an RMR pitch."),
             next_step="approach as channel partner (low priority)"),
        dict(i=1, heading="Alarm Financial Services (AFS)", poc="Jim Wooster", role="Listed contact",
             website="http://www.alarmfunding.com", email="jfwooster@alarmfunding.com",
             business_type="Consultant/Broker",
             why=("Lender to small and mid-size security and fire dealers nationwide since 1987 ($150k to $2M); values "
                  "RMR, so an RMR add-on story resonates with its borrowers."),
             next_step="watch"),
    ],
}

# ---------------------------------------------------------------- 10 Educational and Training
CUR[10] = {
    "skipped_note": ("10 skipped: state-specific license/CEU schools outside Florida (Strandberg Consulting NJ, SECURAC "
                     "Houston, MBFAA and NYSESA and Electrical Training Center LI (New York 81-hour course), WAESA "
                     "(Washington), M.S. Electrical Training (MD/VA/DE)), ESA's CFAT Level II and Advanced Intrusion "
                     "course posts (covered by the ESA entry) and a sales-training consultant in Arizona."),
    "entries": [
        dict(i=10, heading="Alarm Association of Florida (AAF) - training", website="https://fla-alarms.org/",
             email="mkenna@fla-alarms.org", business_type="Association",
             why=("Florida's alarm association and state-approved training provider (ECLB0001140) for license-holder "
                  "renewals and BASA/FASA courses; its members are Florida dealers. A second Florida association "
                  "channel alongside IAF (classes, events, sponsorships)."),
             next_step="approach as channel partner (association)", florida=True),
        dict(i=[5, 6], heading="ESA National Training School - Florida FASA/BASA (ECLB approved) and other courses",
             website="https://esaweb.org (ESA)", business_type="Association",
             why=("ESA's training school runs the Florida FASA/BASA course (English and Spanish) and technician "
                  "certifications; reaches technicians at Florida dealers. See the ESA entry under Associations."),
             next_step="watch", florida=True),
        dict(i=4, heading="SecurityCEU.com / The CMOOR Group", poc="Connie Moorhead", role="Listed contact",
             website="https://securityceu.com", email="connie@cmoor.com", business_type="Software/Vendor",
             why=("Builds training and compliance programs for The Monitoring Association, ADI, Brivo, Johnson "
                  "Controls, Siemens and the Alarm Association of Florida. A route to put IRIS dealer training in "
                  "front of Florida technicians with CEU credit."),
             next_step="watch / possible training partner"),
    ],
}

# ---------------------------------------------------------------- 11 Marketing
CUR[11] = {
    "skipped_note": ("3 skipped: Security Signs & Decals (yard signs), PaulRyanDesign.com (web design) and AlarmBrand "
                     "(dealer websites)."),
    "entries": [
        dict(i=0, heading="Security Dealer Marketing", poc="David Morgan", role="Listed contact",
             website="http://www.securitydealermarketing.com/", email="dmorgan@securitydealermarketing.com",
             business_type="Software/Vendor",
             why="Full-service marketing agency for security dealers; could help produce IRIS co-marketing for dealers.",
             next_step="watch"),
        dict(i=4, heading="Group Gerhardt", poc="Rob Gerhardt", role="Listed contact",
             website="http://groupgerhardt.com", email="Rob@groupgerhardt.com", business_type="Software/Vendor",
             why="Research, development and dealer-support company for the security and integration industries.",
             next_step="watch"),
    ],
}

# ---------------------------------------------------------------- 12 Technical Support
CUR[12] = {
    "skipped_note": (
        "17 skipped: fire alarm design and code consultants outside Florida (Fire Alarm Design Co. of Vermont, 2 posts; "
        "Superior Protection Services NYC; Peace of Mind Fire (CT); Best Fire Alarm Design; Logixs FP Design (NY/NJ); "
        "Fire Alarm System Engineering (NY/NJ/PA); Tracker Fire; SAC Design Services (MI); MCG Design Services; Global "
        "Fire Alarm/MNS Design (OK)), a Texas fire inspector, SECURAC forensic alarm expert (TX), a NYC locksmith, "
        "Systems Support Specialists (NY central-station tech consulting), Intercontinental Security Services (Texas "
        "IP/thermal camera design) and Alarm Assistant (duplicate; entry under the RMR category)."),
    "entries": [
        dict(i=[15, 13], heading="Custom Technical Service Inc. - fire alarm design for Florida alarm companies",
             poc="Tim Lerace", role="Listed contact", municipality="Titusville", state="FL",
             email="Ierace@AOL.com", business_type="Subcontractor",
             why=("Titusville fire alarm designer (license EF0000908) working only for Florida alarm companies; a "
                  "referral source to Florida commercial dealers, not a reseller."),
             next_step="watch / possible referral partner", florida=True),
        dict(i=0, heading="Redline Estimating LLC", poc="Luis Garcia", role="Listed contact", state="FL",
             website="https://redline-estimating.vercel.app", email="redliningestimates@gmail.com",
             business_type="Subcontractor",
             why=("Nationwide fire alarm takeoff/estimating service; contact number has a Broward-area code. Works "
                  "with South Florida fire contractors; minor referral value."),
             next_step="not a fit", florida=True),
        dict(i=8, heading="1st Responders, LLC - fire alarm consulting and design", poc="Scott Slough",
             role="Listed contact (SET, NICET IV)", website="1st-responders.com (parked page on 17 Nov 2026)",
             email="scott@1st-responders.com", business_type="Consultant/Broker",
             why=("Fire alarm design and plan review firm; the listing says 'WA Fire Alarm Consulting' yet the contact "
                  "number has a Miami-Dade/Keys area code, so its location is unclear. Verify before use."),
             next_step="verify location; likely not a fit"),
    ],
}

# ---------------------------------------------------------------- 13 Technology and Services (RMR)
CUR[13] = {
    "skipped_note": ("12 skipped: vendors with no fit or channel value for IRIS: Loyva (e-signature), Innovative Business "
                     "Software (central-station software), consulting expert witness Peter Goldring (NY), Sperry West "
                     "(covert cameras), Contechnical (CADGEN FireCAD), Alarm Tech Central (smoke sensitivity testing), "
                     "MongoTel (PBX phone dealer program), CRN Wireless (communicators), MonitoringContracts.com "
                     "(contract printers), GoVivo Mobile (customer app), Cornerstone Billing Solutions and EverGuard-Care "
                     "by Essence (PERS)."),
    "entries": [
        dict(i=6, heading="WorkHorse SCS (alarm business software)", poc="Steven Hayes", role="Listed contact",
             municipality="Palmetto", state="FL", website="http://www.WorkHorseSCS.com",
             email="steven.hayes@workhorsescs.com", business_type="Software/Vendor",
             why=("Florida-based (Palmetto, per its website) operations/RMR software for alarm dealers, integrated with "
                  "40+ central stations; its Florida dealer customers are IRIS prospects and it could be a referral "
                  "or integration partner."),
             next_step="approach as channel partner (low priority)", florida=True),
        dict(i=7, heading="Micro Key Solutions (accounting, billing, field-service and central-station software)",
             poc="Victoria Ferro", role="Listed contact", state="FL", website="http://www.microkey.com",
             email="vferro@microkey.com", business_type="Software/Vendor",
             why=("Dealer software used by more than 4,000 customers (Kentronix uses it); contact number has a "
                  "Central Florida area code. Possible referral/integration partner."),
             next_step="watch", florida=True),
        dict(i=5, heading="Alarm Assistant (virtual assistant and answering service for alarm companies)",
             poc="Katia Tsuboyama", role="Listed contact", municipality="Palmetto", state="FL", zip="34221",
             website="https://www.alarmassistant.com", email="alex@alarmassistant.com; katia@alarmcompanymarketing.com",
             business_type="Software/Vendor",
             why=("Florida-based (Palmetto per its website) service vendor to alarm dealers; also posted under "
                  "Technical Support. Minor referral value."),
             next_step="not a fit", florida=True),
        dict(i=13, heading="Strategic Sales Support consulting (Stew Sherman)", poc="Stew Sherman",
             role="Listed contact (consultant)", state="FL", email="glades0823@yahoo.com",
             business_type="Consultant/Broker",
             why=("Sales-process consultant (10+ years at a large national fire and security integrator) targeting "
                  "small and mid-size integrators; contact number has a Palm Beach-area code. Could introduce IRIS to "
                  "South Florida integrators he coaches."),
             next_step="approach as channel partner (referral)", florida=True),
        dict(i=1, heading="AiN Group (dealer buying group)", poc="Stanley Matysiak", role="President",
             email="Stan@aingroup.com", business_type="Association",
             why=("Private buying group of independent dealers with dealer-to-dealer support and marketing programs; one "
                  "agreement could put IRIS in front of many small/mid dealers (Snelling Walters insurance also cites "
                  "AiN partnership)."),
             next_step="approach as channel partner"),
        dict(i=0, heading="Link Business Communications - commercial phone referral program for alarm companies",
             poc="John Haenn", role="Listed contact", email="sales@linkbusinesscommunications.com",
             business_type="Software/Vendor",
             why=("Pays alarm dealers a monthly referral fee on commercial customers' phone bills: the same "
                  "'recurring revenue from your commercial clients' pitch IRIS uses. A model for wording an IRIS dealer "
                  "listing, and its participating dealers have commercial bases."),
             next_step="watch (comparable dealer-revenue program)"),
        dict(i=12, heading="Verkada Partner Program", website="https://www.verkada.com/",
             business_type="Software/Vendor",
             why=("Verkada recruits alarm dealers here with renewal-based license revenue. Dealers selling Verkada "
                  "cloud cameras are natural IRIS prospects, and Verkada is a competitor for dealers' attention."),
             next_step="watch (competitive context)"),
        dict(i=2, heading="RSPNDR (guard response platform)", poc="Frank Pietrobono", role="Listed contact",
             website="http://www.rspndr.io", email="frank@rspndr.io", business_type="Software/Vendor",
             why=("Connects monitoring stations to licensed mobile guards with live digital incident reports: an "
                  "adjacent incident-response layer. Possible partner for a combined 'verified incident, then "
                  "responders see inside' story."),
             next_step="watch / possible partner"),
        dict(i=8, heading="Connect ONE by Connected Technologies", poc="Mike Simon", role="Listed contact",
             email="sales@connectedtechnologies.us", business_type="Software/Vendor",
             why=("Cloud service that puts intrusion, access, video and fire for many sites on one screen as dealer RMR; "
                  "dealers using it already manage multi-site video, and it could be an integration partner."),
             next_step="watch / possible integration partner"),
        dict(i=15, heading="CheckMyCCTV (IPX360 Solutions)", website="https://www.ipx360solutions.com/checkmycctv",
             business_type="Software/Vendor",
             why=("Remote CCTV health monitoring sold by dealers as RMR; dealers using it maintain commercial camera "
                  "fleets that IRIS would expose to dispatch. Possible co-selling partner."),
             next_step="watch / possible partner"),
        dict(i=11, heading="Managely by Bold Group (dealer business software)", poc="Justin DeBaggis",
             role="Senior Director of Sales, Business Management",
             website="http://www.boldgroup.com/financial-management-solutions/managely",
             email="justin.debaggis@boldgroup.com", business_type="Software/Vendor",
             why="Bold Group's dealer platform with central-station integration; wide dealer reach.",
             next_step="watch"),
        dict(i=3, heading="FieldHub (operations and accounting software for security integrators)",
             poc="Miles Fawcett", role="CEO", website="https://www.fieldhub.com", email="miles@fieldhub.com",
             business_type="Software/Vendor",
             why="All-in-one software for security integrators incl. RMR management; reaches integrators.",
             next_step="watch"),
    ],
}

# ---------------------------------------------------------------- 14 Associations
CUR[14] = {
    "skipped_note": ("16 skipped: state or local associations outside Florida (Illinois ESA, New Mexico, Louisiana, "
                     "Mississippi, South Texas (2 posts), WAESA, Nevada, Colorado, Maryland, Texas TBFAA (2 posts), "
                     "Metropolitan NY (MBFAA), New York State ESA, Houston Gulf Coast, North Texas)."),
    "entries": [
        dict(i=14, heading="Integration Association of Florida (IAF)", poc="Shannon Few", role="Executive Director",
             state="FL", website="http://www.IAF-SAFE.org", email="Shannon.Few@IAF-SAFE.org",
             business_type="Association",
             why=("Florida's association for security, fire and low-voltage integration companies since 1968 (the "
                  "member directory is already in leadgen/data/iaf_members.json). Best single channel to Miami-Dade "
                  "dealers: events, newsletter, sponsorship, introductions."),
             next_step="approach as channel partner (association)", florida=True),
        dict(i=11, heading="False Alarm Reduction Association (FARA)", poc="Brad Shipp", role="Executive Director",
             website="http://www.faraonline.org", email="exdirector@faraonline.org", business_type="Association",
             why=("Members are government and public-safety agencies plus alarm-industry people: the police-dispatch "
                  "side that IRIS serves. Useful for validating the dispatch use case and for introductions to "
                  "agencies that would ask dealers for IRIS."),
             next_step="approach as channel partner (public-safety side)"),
        dict(i=7, heading="The Monitoring Association (TMA)", poc="Celia Trigo Besore",
             role="Executive Director (MBA, CAE)", email="cbesore@tma.us", business_type="Association",
             why=("Association of monitoring centers, the link between alarm systems and police dispatch; relevant to "
                  "how video and alarm data reach dispatchers."),
             next_step="watch / possible partner"),
        dict(i=5, heading="Electronic Security Association (ESA)", poc="Sophia Dominguez",
             role="Membership Development Manager", website="https://esaweb.org",
             email="Sophia.Dominguez@esaweb.org", business_type="Association",
             why="Largest US trade association for electronic security dealers; national dealer reach.",
             next_step="watch / possible channel"),
        dict(i=10, heading="National Electronic Security Alliance (NESA)", poc="Brad Shipp",
             role="Executive Director", website="http://www.nesaus.org", email="exdirector@nesaus.org",
             business_type="Association",
             why="Federation of state alarm associations; a route to state associations beyond Florida.",
             next_step="watch"),
    ],
}

# ---------------------------------------------------------------- 15 Miscellaneous
CUR[15] = {
    "skipped_note": ("3 skipped: Kirschenbaum & Kirschenbaum's own services (standard form agreements at "
                     "alarmcontracts.com, alarm company valuation, legal service for buying/selling accounts). K&K is "
                     "covered under Business Brokers."),
    "entries": [],
}

TOP_PICKS = [
    ["Protective Security Solutions Inc.",
     "Small owner-contact EF-licensed fire and security company in Kendall (Miami 33186), offering service and install "
     "work: best direct Miami-Dade reseller prospect on the exchange."],
    ["Integration Association of Florida (IAF)",
     "Florida integrators' association; executive director listed; best channel to Miami-Dade dealers."],
    ["For Sale: Miami-Dade commercial alarm accounts (165 accounts, seller anonymous, via K&K)",
     "101 commercial security + 64 commercial fire accounts in Miami changing hands; the buyer is an ideal IRIS reseller."],
    ["Kentronix Security (company for sale, Jacksonville area; serves Dade/Broward/Palm Beach)",
     "70% commercial owner-run dealer serving Dade and Broward (Plantation office) is for sale; approach the new owner."],
    ["NuTech National (national alarm/CCTV servicing network, Maitland FL)",
     "Florida-HQ national service network for commercial and government sites; channel to many buildings at once."],
    ["Krandog Consulting (Florida EF license holder, Miami)",
     "Miami low-voltage license holder (cameras, access control) who qualifies new companies; referral route to new "
     "Miami dealers."],
    ["Kirschenbaum & Kirschenbaum PC (host of The Alarm Exchange; account brokering)",
     "Free listing on The Alarm Exchange: post an IRIS dealer-program notice in the RMR category, as Verkada and others do."],
    ["False Alarm Reduction Association (FARA)",
     "Public-safety agency membership: validates and opens the police-dispatch side of IRIS."],
    ["AiN Group (dealer buying group)",
     "Buying group of independent dealers; one agreement reaches many small/mid dealers."],
    ["Global Axiom (seeking subcontractors, incl. Northern Florida)",
     "AI + human video monitoring that escalates to first responders; partner or competitor, active in Florida."],
]

NOTES = (
    "Method: fetched https://www.kirschenbaumesq.com/robots.txt (disallows /article/the-alarm-exchange*; nothing under "
    "that path was requested), then the main page https://www.kirschenbaumesq.com/page/alarm-exchange (the 'View All' "
    "link points to the same page) and each of the 16 category views of the page's public search filter "
    "(?keywords=&category=<slug>), plus https://www.kirschenbaumesq.com/page/alarm-exchange-links. All requests were "
    "4 s apart. Every category view contained exactly the same listings as the main page (no pagination, nothing "
    "extra), so the main page is the complete set: 16 categories, 335 listings, all read. The alarm-exchange-links page "
    "holds only reciprocal-link banner code and K&K contact lines (no listings). The page shows no posting dates except "
    "two old ones (an Illinois qualifier 'Posted September 2023'; a K&K Illinois request 'posted April 20, 2021'); "
    "listings marked NEW on the page are noted in 'found'. "
    "Enrichment: one homepage request each (3 s apart) to the websites of Florida-linked companies to confirm city/ZIP "
    "and services (eesecurity.net, nutechnational.com -> nutechsecure.com, idsalarm.com, kentronixsecurity.com, "
    "allsecureus.com, staysafe.net, alarmconsultinggroup.com, wisefincon.com, alarmassistant.com, workhorsescs.com, "
    "microkey.com, copsmonitoring.com, globalaxiom.com, granitecs.com). Protective Security Solutions' Miami ZIP "
    "33186 comes from the project's Florida DBPR license file (leadgen/data/dbpr_licenses.json); Kentronix's "
    "Plantation office from leadgen/data/iaf_members.json. Names come only from the listings themselves; no people "
    "databases were used for names (a web search surfaced a ZoomInfo page, which was ignored). No phone numbers are "
    "recorded: listing text in 'found' has every number replaced with '[phone omitted]', and the builder fails if "
    "anything phone-shaped remains. Where a listing gives no city, 'state' is set to FL only when the contact number "
    "has a Florida area code, and the 'why' says so (the number itself is not recorded). Individuals seeking work or "
    "offering their license are recorded by first name only, with no personal email. "
    "Flags: florida = located in Florida, or the listing explicitly involves Florida work, licenses or accounts; "
    "miami_dade = based in, or explicitly serving, Miami-Dade County. Duplicate or related posts by the same company "
    "inside one category are merged into one entry (each category's 'included' counts listings, so it can exceed the "
    "number of entries). Out-of-state local dealers and techs were skipped but named in each category's skipped_note "
    "(commercial video installers are flagged there) so they are not lost. "
    "Hidden Florida company: Granite Communications & Security posted only a New Jersey access-control subcontractor "
    "request, but its website places it in Lutz, FL 33548 (Tampa area) doing CCTV, access control and cabling for "
    "multi-tenant properties and small businesses; it is entered under Sub Contractors as a Florida integrator. "
    "Several other listings carry Florida area codes without saying so (NuTech National, Executive Electronics, "
    "Scorpion Fire and Safety, Alarm Consulting Group, Wise Financial, Stew Sherman, Redline Estimating, Micro Key); "
    "all were checked and flagged. "
    "NEEDS MANUAL WORK: (1) Protective Security Solutions website https://protectivesecuritysolutions.com - TLS "
    "handshake failure via curl and HTTP 503 via WebFetch on 17 Nov 2026 (tried http, https, www); confirm services "
    "(cameras?) and owner from the site when it is up. (2) Scorpion Fire and Safety, LLC - no website; Sunbiz search "
    "https://search.sunbiz.org/Inquiry/CorporationSearch/SearchResults (term SCORPION FIRE AND SAFETY) returned HTTP 403 "
    "with a Cloudflare challenge (not bypassed); web search found nothing; city unknown (Miami-Dade/Keys area code). "
    "(3) Krandog Consulting - krandogconsulting.com is a parked/redirect page; Sunbiz blocked as above; web search found "
    "nothing. (4) Fuller Sound AV - https://fullersoundav.com and www. both failed (proxy CONNECT 502), retried once. "
    "(5) 1st Responders, LLC - 1st-responders.com parked; listing says 'WA' but number is a South Florida area code. "
    "(6) BDH Technical Systems - bdhtechnicalsystems.com returns 404. (7) Micro Key Solutions and Alarm Consulting "
    "Group show no street address on their homepages; Florida inferred from area codes."
)
