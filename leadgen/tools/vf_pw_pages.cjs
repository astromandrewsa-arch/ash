// Headless fetch of specific pages (2.5 s apart); appends phone-stripped text to raw/verify/<slug>.json and prints it.
const { chromium } = require('playwright'); const fs = require('fs');
const PHONE = /(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g; const strip = s => (s || '').replace(PHONE, '');
(async () => {
  const [slug, ...urls] = process.argv.slice(2); const path = `/home/user/ash/leadgen/raw/verify/${slug}.json`;
  const d = fs.existsSync(path) ? JSON.parse(fs.readFileSync(path)) : { name: slug, pages: [], errors: [] };
  const b = await chromium.launch(); const p = await b.newPage({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36' });
  for (const u of urls) {
    try { const r = await p.goto(u, { waitUntil: 'domcontentloaded', timeout: 60000 }); await p.waitForTimeout(3500);
      const x = await p.evaluate(() => ({ title: document.title, text: document.body ? document.body.innerText : '', emails: [...document.querySelectorAll('a[href^="mailto:"]')].map(a => a.getAttribute('href').slice(7).split('?')[0]) }));
      d.pages.push({ url: p.url(), status: r ? r.status() : 0, title: x.title, meta: '', text: strip(x.text).slice(0, 60000), emails: x.emails, jsonld: [] });
      console.log('=== ', r && r.status(), p.url(), '|', x.title, '| emails', x.emails.join(',')); console.log(strip(x.text).slice(0, 3000));
    } catch (e) { console.log('ERR', u, e.message.slice(0, 120)); }
    await new Promise(r => setTimeout(r, 2500));
  }
  await b.close(); fs.writeFileSync(path, JSON.stringify(d, null, 1));
})();
