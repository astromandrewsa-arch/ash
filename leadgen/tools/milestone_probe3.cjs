const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36', viewport: {width: 1400, height: 1000} });
  const scripts = [];
  p.on('response', r => { const u = r.url(); if (/impartner/.test(u) && /\.js(\?|$)/.test(u)) scripts.push(u); });
  await p.goto('https://www.milestonesys.com/where-to-buy-reseller-and-distributor/', { waitUntil: 'networkidle', timeout: 90000 }).catch(e => console.log('goto', e.message));
  await p.click('#CybotCookiebotDialogBodyButtonDecline').catch(()=>{});
  await p.waitForTimeout(1500);
  await p.screenshot({ path: '/home/user/ash/leadgen/raw/mfr_b/milestone_locator.png' });
  console.log(scripts.join('\n'));
  await b.close();
})();
