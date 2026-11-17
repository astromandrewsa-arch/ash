"""td_build_boma.py: BOMA Miami-Dade records from its public WordPress site (member directory itself is Cloudflare-challenged)."""
import json
COMM = 'https://www.bomamiamidade.org/committees/'
SPON = 'https://www.bomamiamidade.org/toby/toby-sponsorship/'
recs = [
 {'name': 'Kastle Systems, Inc.', 'brand': '', 'listing_level': '2025 TOBY sponsor; BOMA Miami-Dade committee participant',
  'address': '', 'city': '', 'state': 'FL', 'zip': '', 'website': 'https://www.kastle.com/',
  'email': '', 'contact_name': 'Claudia Grene', 'contact_role': 'BOMA Miami-Dade Registration Committee and Social Media & Website Committee member (listed as "Kastle")',
  'contact_source': COMM, 'services_on_listing': '', 'service_area': '',
  'listing_url': COMM + ' | ' + SPON,
  'query': 'BOMA Miami-Dade public site (committees page; 2025 TOBY sponsors list)',
  'notes': 'Member directory (members.bomamiamidade.org/member-directory) is behind a Cloudflare challenge, so category listings could not be read. Kastle appears by name on the BOMA committees page and the 2025 TOBY sponsor list. Kastle is a national managed access-control/video provider; local Miami office address not on these pages.',
  'directory': ['BOMA Miami-Dade (public site)'], 'flag': 'national firm; not from member-directory category (directory blocked)'},
 {'name': 'Allied Universal', 'brand': '', 'listing_level': '2025 TOBY sponsor',
  'address': '', 'city': '', 'state': 'FL', 'zip': '', 'website': 'https://www.aus.com/',
  'email': '', 'contact_name': '', 'contact_role': '', 'contact_source': '',
  'services_on_listing': '', 'service_area': '', 'listing_url': SPON,
  'query': 'BOMA Miami-Dade public site (2025 TOBY sponsors list)',
  'notes': 'Named in the 2025 TOBY sponsor list on bomamiamidade.org. Primarily guard services; has a technology/integration division (Allied Universal Technology Services). No local details on the page.',
  'directory': ['BOMA Miami-Dade (public site)'], 'flag': 'national guard-services firm with integration arm; not from member-directory category (directory blocked)'},
]
json.dump(recs, open('/home/user/ash/leadgen/raw/tma_dir/boma_records.json', 'w'), indent=1, ensure_ascii=False)
print(len(recs))
