const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36', viewport: {width: 1400, height: 1000} });
  p.on('request', r => { const u = r.url(); if (/impartner/.test(u) && /locator\/v1|geocode|places|autocomplete/i.test(u) || /maps\.googleapis/.test(u)) console.log('REQ', r.method(), decodeURIComponent(u).slice(0,1200)); });
  await p.goto('https://www.milestonesys.com/where-to-buy-reseller-and-distributor/', { waitUntil: 'networkidle', timeout: 90000 }).catch(e => console.log('goto', e.message));
  await p.click('#CybotCookiebotDialogBodyButtonDecline').catch(()=>{});
  await p.waitForTimeout(2000);
  const html = await p.evaluate(() => { const el = document.querySelector('[class*="mp-"]'); let root = el; for (let i=0;i<6 && root && root.parentElement;i++) root = root.parentElement; return root ? root.outerHTML : ''; });
  require('fs').writeFileSync('/home/user/ash/leadgen/raw/mfr_b/milestone_locator_dom.html', html);
  const sel = await p.evaluate(() => Array.from(document.querySelectorAll('select')).map(s => Array.from(s.options).map(o => o.value + '=' + o.text)));
  console.log(JSON.stringify(sel));
  const ins = await p.evaluate(() => Array.from(document.querySelectorAll('input')).map(e => [e.type, e.placeholder, e.className.toString().slice(0,80), e.getAttribute('formcontrolname')]));
  console.log(JSON.stringify(ins));
  await b.close();
})();
