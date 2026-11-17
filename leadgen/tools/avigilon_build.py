import sys
sys.path.insert(0, '/home/user/ash/leadgen/tools')
from mfr_common import *
N = 'Self-declared on dealer site (Avigilon has no public partner list; its "Partner Locator" is a lead form).'
out = [
    rec(name='Support305', brand='Avigilon', listing_level='Certified integrator (self-declared)',
        address='2990 SW 35th Ave', city='Miami', state='FL', zip='33133', website='https://support305.pages.dev/',
        services_on_listing='Security camera installation; Avigilon by Motorola Solutions surveillance; "Certified Surveillance Partners" section lists Avigilon',
        service_area='Miami-Dade, Broward, Palm Beach (per site)',
        listing_url='https://support305.pages.dev/services/surveillance', query='web search: Avigilon certified integrator Miami',
        notes=N + ' Page text: "As a certified integrator, we proudly deploy Avigilon by Motorola Solutions". Site is hosted on a pages.dev address (a mirror at dist-2hx.pages.dev also exists); the company\'s main domain was not confirmed.'),
    rec(name='Security 101 (Miami)', brand='Avigilon', listing_level='Technology / strategic partner (self-declared)',
        address='2400 West 84th Street, Suite 15', city='Hialeah', state='FL', zip='33016', website='https://www.security101.com/miami',
        services_on_listing='Commercial security integration: video, access control, alarm monitoring, visitor management',
        service_area='Greater Miami',
        listing_url='https://www.security101.com/miami', query='web search: Avigilon authorized partner Miami',
        notes=N + ' Page lists Avigilon under "Technology Partners / Strategic Partners" ("long-standing strategic partnerships with the security industry\'s leading manufacturers"); it does not use the words authorized or certified for Avigilon. Page states "The Miami headquarters for Security 101 is at 2400 West 84th Street, Suite 15, Hialeah, FL 33016."'),
    rec(name='AT&I Security Systems', brand='Avigilon', listing_level='Authorized dealer and integration partner (self-declared)',
        address='', city='Cooper City', state='FL', zip='33330', website='https://www.atisecuritysystems.com/',
        services_on_listing='Avigilon Unity, Avigilon Alta (formerly Openpath), video surveillance, access control, analytics; design, installation, support',
        service_area='Florida',
        listing_url='https://www.atisecuritysystems.com/access-control-old/avigilon/', query='web search: Miami integrator Avigilon authorized dealer',
        notes=N + ' Page text: "As an authorized Avigilon dealer and integration partner in Florida". The page shows only Cooper City, FL 33330 (Broward HQ). The Verkada locator lists an AT&I Miami sales office at 1221 Brickell Avenue, Miami 33131. The page URL contains "-old" and may be an archived page on their site.'),
    rec(name='SecureComm Systems', brand='Avigilon', listing_level='Certified Partner (self-declared)',
        address='', city='', state='FL', zip='', website='https://securecommsystems.com/',
        services_on_listing='Networking, wireless networking, CCTV, access control, structured cabling; veteran-owned; State of Florida licensed security integrator',
        service_area='Miami-Dade, Broward, Palm Beach, Monroe, Collier, Martin counties',
        listing_url='https://securecommsystems.com/about', query='web search: Miami FL security integrator Avigilon certified partner',
        notes=N + ' About page "Certifications & Partnerships" lists "Avigilon - Certified Partner". Site says "based in South Florida" with no street address, so a Miami-Dade base is NOT confirmed (the service area includes Miami-Dade). Check before use.'),
]
save('/home/user/ash/leadgen/data/mfr_avigilon.json', out)
