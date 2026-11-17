// Open EnerGov CSS search (permit module), open Advanced, optionally choose a permit type by label, click Search; log the search POST body.
const { chromium } = require('playwright');
const fs = require('fs');
const [base, typeLabel, outPrefix] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36', viewport: {width: 1400, height: 1000} });
  const posts = [];
  p.on('request', r => { if (/search\/search/.test(r.url())) posts.push(r.postData()); });
  await p.goto(base + '#/search?m=2&fm=2&ps=10&pn=1&em=true&st=', { waitUntil: 'networkidle', timeout: 90000 }).catch(e => console.log('goto err', e.message));
  await p.waitForTimeout(4000);
  try { await p.click('text=Advanced', { timeout: 10000 }); } catch (e) { console.log('adv click err', e.message); }
  await p.waitForTimeout(3000);
  const selects = await p.evaluate(() => Array.from(document.querySelectorAll('select')).map(s => ({ id: s.id, name: s.name, model: s.getAttribute('ng-model') || s.getAttribute('data-ng-model'), n: s.options.length, first: Array.from(s.options).slice(0, 4).map(o => o.text) })));
  console.log(JSON.stringify(selects, null, 1));
  const inputs = await p.evaluate(() => Array.from(document.querySelectorAll('input')).filter(i => i.offsetParent !== null).map(i => ({ id: i.id, model: i.getAttribute('ng-model') || i.getAttribute('data-ng-model'), type: i.type })));
  console.log(JSON.stringify(inputs));
  if (typeLabel && typeLabel !== '-') {
    const sel = await p.evaluate((lbl) => { for (const s of document.querySelectorAll('select')) { for (const o of s.options) { if (o.text.trim() === lbl) return '#' + s.id; } } return null; }, typeLabel);
    console.log('type select', sel);
    if (sel) { await p.selectOption(sel, { label: typeLabel }); await p.waitForTimeout(2500); }
    const btns = await p.$$('button:has-text("Search"), input[value="Search"]');
    console.log('search buttons', btns.length);
    for (const bt of btns) { if (await bt.isVisible()) { await bt.click(); break; } }
    await p.waitForTimeout(8000);
  }
  fs.writeFileSync(outPrefix + '_posts.json', JSON.stringify(posts, null, 1));
  fs.writeFileSync(outPrefix + '_text.txt', await p.evaluate(() => document.body.innerText));
  console.log('posts', posts.length);
  await b.close();
})();
