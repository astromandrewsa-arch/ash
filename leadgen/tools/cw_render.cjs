// usage: node cw_render.cjs URL  -> prints JSON {url, status, html}  (plain headless Chromium, no evasion)
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36' });
  const p = await ctx.newPage();
  const out = { url: process.argv[2], status: null, html: '' };
  try {
    const r = await p.goto(process.argv[2], { waitUntil: 'domcontentloaded', timeout: 45000 });
    await p.waitForTimeout(4000);
    try { await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await p.waitForTimeout(1200); } catch (e) {}
    out.status = r ? r.status() : null;
    for (let i = 0; i < 4; i++) {
      try { await p.waitForLoadState('load', { timeout: 15000 }); out.url = p.url(); out.html = await p.content(); break; }
      catch (e) { await p.waitForTimeout(3000); }
    }
  } catch (e) { out.error = e.message.split('\n')[0]; }
  process.stdout.write(JSON.stringify(out));
  await b.close();
})();
