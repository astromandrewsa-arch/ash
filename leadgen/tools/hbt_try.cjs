process.env.CURL_HOSTS = 'buildings.honeywell.com';
const { open } = require('./pw_curlroute.cjs');
const fs = require('fs');
(async () => {
  const { b, ctx } = await open();
  const p = await ctx.newPage(); const log = [];
  p.on('request', r => { if (r.url().includes('bullseye')) log.push(r.method() + ' ' + r.url()); });
  try { await p.goto('https://buildings.honeywell.com/us/en/brands/our-brands/security/partnerships/dealer-locator', { waitUntil: 'load', timeout: 120000 }); } catch (e) { console.log('goto', e.message.slice(0, 100)); }
  await p.waitForTimeout(15000);
  const f = p.frames().find(f => f.url().includes('bullseye'));
  if (f) { console.log('frame', f.url()); console.log((await f.evaluate(() => document.body.innerText)).slice(0, 1500)); }
  console.log(log.join('\n'));
  await b.close();
})();
