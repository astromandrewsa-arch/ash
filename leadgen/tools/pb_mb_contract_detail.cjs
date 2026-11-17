// Miami Beach public Awarded Contracts grid: search a keyword, expand each row's detail panel, dump detail text.
// Optionally page through all result pages. Read-only; pauses between actions.
const { chromium } = require('playwright');
const fs = require('fs');
const [kw, out, allPages] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36', viewport: { width: 1600, height: 1400 } });
  await p.goto('https://apps.miamibeachfl.gov/contractawards/', { waitUntil: 'networkidle', timeout: 90000 });
  const sel = 'input[name="ctl00$MainContent$ASPxGridView1$DXSE"]';
  await p.fill(sel, kw); await p.press(sel, 'Enter'); await p.waitForTimeout(5000);
  const results = [];
  for (let page = 0; page < 10; page++) {
    const n = await p.evaluate(() => document.querySelectorAll('tr[class*="dxgvDataRow"]').length);
    for (let i = 0; i < n; i++) {
      const rows = await p.$$('tr[class*="dxgvDataRow"]');
      const row = rows[i];
      const cells = await row.evaluate(tr => Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim()));
      let detail = '';
      try {
        const btn = await row.$('a, img[class*="Detail"], td[class*="Detail"] img');
        if (btn) { await btn.click(); await p.waitForTimeout(3500); }
        detail = await p.evaluate(() => { const d = document.querySelector('tr[class*="dxgvDetailRow"]'); return d ? d.innerText + ' LINKS: ' + Array.from(d.querySelectorAll('a')).map(a => (a.href||'') + ' ' + (a.getAttribute('onclick')||'')).join(' ; ') : ''; });
        if (btn) { const rows2 = await p.$$('tr[class*="dxgvDataRow"]'); const b2 = await rows2[i].$('a, img[class*="Detail"]'); if (b2) { await b2.click(); await p.waitForTimeout(2500); } }
      } catch (e) { detail = 'ERR ' + e.message; }
      results.push({ cells, detail });
      console.log(cells.slice(2, 5).join(' | '), '=>', detail.replace(/\s+/g, ' ').slice(0, 300));
    }
    if (allPages !== 'all') break;
    const next = await p.$('a.dxp-button:has-text("Next"), a[onclick*="PBN"]');
    if (!next) break;
    await next.click(); await p.waitForTimeout(5000);
  }
  fs.writeFileSync(out, JSON.stringify(results, null, 1));
  await b.close();
})();
