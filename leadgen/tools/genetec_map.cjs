// Loads Genetec's public "Find a reseller" map page in a browser and records what the page itself loads/renders.
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36', viewport: {width: 1400, height: 1000} });
  let captured = null;
  p.on('response', async r => { if (/sheets\.googleapis\.com/.test(r.url())) { try { captured = await r.text(); } catch (e) {} } });
  await p.goto('https://www.genetec.com/contact-us/unified-elite-resellers', { waitUntil: 'networkidle', timeout: 90000 }).catch(e => console.log('goto', e.message));
  await p.waitForTimeout(8000);
  if (captured) { fs.writeFileSync('/home/user/ash/leadgen/raw/mfr_b/genetec_elite_page_data.json', captured); console.log('captured', captured.length); }
  // Also read the rendered list from the store-locator shadow DOM
  const items = await p.evaluate(() => {
    const out = [];
    const walk = (root) => { root.querySelectorAll('*').forEach(el => { if (el.shadowRoot) walk(el.shadowRoot); }); 
      root.querySelectorAll('li, .result-item, gmpx-place-overview').forEach(li => { const t = li.innerText; if (t && t.length < 600) out.push(t); }); };
    walk(document);
    return out;
  });
  fs.writeFileSync('/home/user/ash/leadgen/raw/mfr_b/genetec_elite_rendered.json', JSON.stringify(items, null, 1));
  console.log('rendered items', items.length);
  await b.close();
})();
