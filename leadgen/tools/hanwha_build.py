import sys
sys.path.insert(0, '/home/user/ash/leadgen/tools')
from mfr_common import *
N = 'Self-declared on dealer site (Hanwha Vision America has no public dealer/integrator locator; its site lists distributors only).'
out = [
    rec(name='Support305', brand='Hanwha Vision', listing_level='Certified surveillance partner (self-declared)',
        address='2990 SW 35th Ave', city='Miami', state='FL', zip='33133', website='https://support305.pages.dev/',
        services_on_listing='Security camera installation; "Certified Surveillance Partners: Avigilon, Axis Communications, Hanwha Vision, Hikvision"',
        service_area='Miami-Dade, Broward, Palm Beach (per site)',
        listing_url='https://support305.pages.dev/services/surveillance', query='web search: Hanwha Vision partner integrator Miami',
        notes=N + ' The page heading "Certified Surveillance Partners / We integrate only with proven leaders in surveillance technology" lists Hanwha Vision. Site is hosted on a pages.dev address; the main domain was not confirmed.'),
]
save('/home/user/ash/leadgen/data/mfr_hanwha.json', out)
