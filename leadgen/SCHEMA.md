# Lead-gen data contract (for research agents)

Raw records go to `leadgen/data/<source>.json` as a JSON array. One object per listing:

```json
{
  "name": "trading name as shown on the listing/website",
  "brand": "brand whose locator listed them (manufacturer files only)",
  "listing_level": "partner tier/level text if the locator shows one, else ''",
  "address": "street line(s) if shown, else ''",
  "city": "", "state": "FL", "zip": "",
  "website": "if shown on the listing (or the company's own site if obvious), else ''",
  "email": "ONLY if printed on the listing itself, else ''",
  "contact_name": "ONLY a person named on the listing itself, else ''",
  "contact_role": "role as stated on the listing, or 'Listed contact' if none stated",
  "contact_source": "exact URL where that name appears",
  "services_on_listing": "short text of services/categories the listing shows, else ''",
  "service_area": "any service-area text on the listing (e.g. 'Miami-Dade, Broward'), else ''",
  "listing_url": "URL of the locator/listing page (or API endpoint used by the public page)",
  "query": "ZIP(s) or query that returned it",
  "notes": "anything else useful"
}
```

Hard rules
- NEVER record phone numbers anywhere (not in JSON, notes, or logs).
- Contact names ONLY from the source listing or the company's own website. Never from LinkedIn, ZoomInfo,
  Apollo, RocketReach or any people database. Never guess. No name -> leave "".
- Emails only if published. Never construct one. Unknown -> "".
- Public pages only: no logins, no account creation, no CAPTCHA solving/bypassing, no paywalls, obey robots.txt.
  Do not submit contact/lead forms or contact anyone. (Using a public locator's search box/ZIP filter is fine.)
- Calling the same public JSON endpoint that the public locator page itself calls is fine; keep to one request
  every 3+ seconds per site.
- Never fabricate. American spelling.
- If blocked: wait 30-60 s and retry once; try headless Playwright; try other public routes to the same data
  (other filters, ZIP-by-ZIP, sitemap, print/list view, web.archive.org); web-search for the same listings.
  If still blocked, write it up in the notes file under "NEEDS MANUAL WORK" with URL, error, what you tried.

Tooling notes
- Python 3.13 with requests, bs4, lxml, pandas available. Node 22 + Playwright (`require('playwright')`,
  `chromium.launch()` needs no options). The repo root package.json is `"type": "module"`, so Node CommonJS
  scripts must use the `.cjs` extension. Put scratch scripts in `leadgen/tools/`, raw downloads in `leadgen/raw/`
  (both are git-ignored).
- Do NOT run git commands (the coordinator commits). Do not edit files other than your own outputs.
