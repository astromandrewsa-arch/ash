// usage: node render.cjs URL  -> prints JSON {url, status, html}
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36', ignoreHTTPSErrors: false });
  const p = await ctx.newPage();
  let out = { url: process.argv[2], status: null, html: '' };
  try {
    const r = await p.goto(process.argv[2], { waitUntil: 'domcontentloaded', timeout: 45000 });
    await p.waitForTimeout(3500);
    out.status = r ? r.status() : null; out.url = p.url(); out.html = await p.content();
  } catch (e) { out.error = e.message.split('\n')[0]; }
  process.stdout.write(JSON.stringify(out));
  await b.close();
})();
