// Miami Beach public "Awarded Contracts" grid (apps.miamibeachfl.gov/contractawards): use the grid's public search box
// for each keyword and dump the visible rows. Read-only; 4 s pause between searches.
const { chromium } = require('playwright');
const fs = require('fs');
const kws = process.argv.slice(2);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36', viewport: { width: 1600, height: 1200 } });
  await p.goto('https://apps.miamibeachfl.gov/contractawards/', { waitUntil: 'networkidle', timeout: 90000 });
  const out = {};
  for (const kw of kws) {
    const sel = 'input[name="ctl00$MainContent$ASPxGridView1$DXSE"]';
    await p.fill(sel, '');
    await p.fill(sel, kw);
    await p.press(sel, 'Enter');
    await p.waitForTimeout(5000);
    const rows = await p.evaluate(() => Array.from(document.querySelectorAll('tr[class*="dxgvDataRow"]')).map(tr => Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim()).concat(Array.from(tr.querySelectorAll('a')).map(a => a.href + ' ' + (a.getAttribute('onclick')||'')))));
    const pager = await p.evaluate(() => { const e = document.querySelector('[class*="dxpSummary"], .dxp-summary'); return e ? e.innerText : ''; });
    out[kw] = { pager, rows };
    console.log(kw, rows.length, pager);
    await p.waitForTimeout(4000);
  }
  fs.writeFileSync('/home/user/ash/leadgen/raw/permits/bids/mb_contractawards_search2.json', JSON.stringify(out, null, 1));
  await b.close();
})();
