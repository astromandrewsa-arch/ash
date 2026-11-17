"""Self-declared partner records (fallback) for brands without a public dealer locator."""
import sys
sys.path.insert(0, '/home/user/ash/leadgen/tools')
from mfr_common import *

S101_URL = 'https://www.security101.com/miami'
S305_URL = 'https://support305.pages.dev/services/surveillance'


def s101(brand, note):
    return rec(name='Security 101 (Miami)', brand=brand, listing_level='Technology / strategic partner (self-declared)',
               address='2400 West 84th Street, Suite 15', city='Hialeah', state='FL', zip='33016', website=S101_URL,
               services_on_listing='Commercial security integration: video, access control, alarm monitoring, visitor management',
               service_area='Greater Miami', listing_url=S101_URL, query=f'web search: {brand} partner Miami',
               notes=note + f' Security 101 Miami page shows the {brand} logo in its "Technology Partners" slider ("long-standing strategic partnerships with the security industry\'s leading manufacturers"); no authorized/certified wording for the brand. Page: "The Miami headquarters for Security 101 is at 2400 West 84th Street, Suite 15, Hialeah, FL 33016."')


def s305(brand, note):
    return rec(name='Support305', brand=brand, listing_level='Certified surveillance partner (self-declared)',
               address='2990 SW 35th Ave', city='Miami', state='FL', zip='33133', website='https://support305.pages.dev/',
               services_on_listing='Security camera installation; "Certified Surveillance Partners: Avigilon, Axis Communications, Hanwha Vision, Hikvision"',
               service_area='Miami-Dade, Broward, Palm Beach (per site)', listing_url=S305_URL,
               query=f'web search: {brand} partner integrator Miami',
               notes=note + f' The page heading "Certified Surveillance Partners / We integrate only with proven leaders in surveillance technology" lists {brand}. Site is hosted on a pages.dev address; the main domain was not confirmed.')


HAN = 'Self-declared on dealer site (Hanwha Vision America has no public dealer/integrator locator; its site lists distributors only).'
AXN = 'Self-declared on dealer site (Axis has no public reseller locator in the US; "Find a partner close to you" is a lead form).'
EEN = 'Self-declared on dealer site (Eagle Eye Networks has no public reseller locator; it offers referrals only).'

hanwha = [s305('Hanwha Vision', HAN), s101('Hanwha Vision', HAN)]
axis = [
    rec(name='Baltic Service LLC', brand='Axis Communications', listing_level='AXIS Communications Certified Partner Program integrator (self-declared)',
        address='16850 Collins Ave #112', city='Sunny Isles Beach', state='FL', zip='33160', website='https://www.adbsnow.com',
        email='info@adbsnow.com',
        services_on_listing='Network systems integrator: video surveillance, access control, intercoms, network infrastructure, WiFi, VoIP, network security',
        service_area='Miami-Dade, Broward, Palm Beach, Florida Keys (per site)',
        listing_url='https://adbsnow-site.pages.dev/about-us.html', query='web search: Axis Communications partner program integrator Miami',
        notes=AXN + ' Page text: "We are an AXIS Communications Certified Partner Program integrator - authorized to design, install, and support AXIS products at the enterprise level." "Based in Miami and serving all of South Florida." The 401 E Las Olas Blvd, Fort Lauderdale address on the page is the AXIS Experience Center, not Baltic\'s office. The page is hosted on a pages.dev address; the site footer names www.adbsnow.com. Email as printed in the site footer.'),
    s305('Axis Communications', AXN),
    s101('Axis Communications', AXN),
]
een = [s101('Eagle Eye Networks', EEN)]
save('/home/user/ash/leadgen/data/mfr_hanwha.json', hanwha)
save('/home/user/ash/leadgen/data/mfr_axis.json', axis)
save('/home/user/ash/leadgen/data/mfr_eagleeye.json', een)
