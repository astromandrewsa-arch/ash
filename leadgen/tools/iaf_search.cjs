// Loads the public IAF member directory and clicks Search with blank fields (as the page instructs).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36' });
  await p.goto('https://members.iaf-safe.org/members/directory/search_bootstrap.php?twocol=&org_id=AAFL', { waitUntil: 'networkidle' });
  await p.click('#search_button');
  await p.waitForTimeout(8000);
  const html = await p.$eval('#results-wrapper', e => e.innerHTML);
  require('fs').writeFileSync(process.argv[2], html);
  console.log('len', html.length);
  await b.close();
})();
