// Loads the Milestone public locator (no cookie-banner interaction) and screenshots it.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36', viewport: {width: 1400, height: 1400} });
  p.on('request', r => { const u = r.url(); if (/impartner/.test(u) && /locator\/v1/.test(u)) console.log('REQ', r.method(), decodeURIComponent(u).slice(0,1500)); });
  await p.goto('https://www.milestonesys.com/where-to-buy-reseller-and-distributor/', { waitUntil: 'networkidle', timeout: 90000 }).catch(e => console.log('goto', e.message));
  await p.waitForTimeout(4000);
  await p.evaluate(() => { const d = document.getElementById('CybotCookiebotDialog'); if (d) d.style.display = 'none'; });
  const el = await p.$('i-locator-root');
  console.log('locator root', !!el);
  const ins = await p.evaluate(() => { const out=[]; const walk=(r)=>{ r.querySelectorAll('*').forEach(e=>{ if(e.shadowRoot) walk(e.shadowRoot); if(['INPUT','SELECT','BUTTON'].includes(e.tagName) || /autocomplete/i.test(e.tagName)) out.push([e.tagName,e.type,e.placeholder,(e.innerText||'').slice(0,30),e.className.toString().slice(0,60)]); }); }; walk(document); return out; });
  console.log(JSON.stringify(ins.filter(x=>!/Cybot/.test(x[4]))));
  await p.screenshot({ path: '/home/user/ash/leadgen/raw/mfr_b/milestone_locator3.png', fullPage: false });
  await b.close();
})();
