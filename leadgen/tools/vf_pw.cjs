// Headless fallback for JS-rendered sites: homepage + About/Team/Contact/Locations/Services pages.
// Usage: node vf_pw.cjs <slug> <url>   -> writes raw/verify/<slug>.json (phone-stripped text only)
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = '/home/user/ash/leadgen/raw/verify';
const PHONE = /(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g;
const strip = s => (s || '').replace(PHONE, '');
const KW = [['about',10],['team',10],['leadership',10],['management',9],['who-we-are',10],['our-company',9],['company',6],['staff',9],['meet',8],['history',7],['founder',9],['owner',9],['people',8],['contact',9],['location',8],['office',6],['services',7],['service',5],['solutions',6],['commercial',7],['business',5],['video',6],['surveillance',7],['cctv',7],['camera',7],['security',3],['industr',5],['market',5],['vertical',6],['partner',5],['brand',5],['product',3],['nosotros',8],['contacto',7]];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const dom = h => h.toLowerCase().replace(/^www\./, '');
(async () => {
  const [slug, start] = process.argv.slice(2);
  const res = { name: slug, start_url: start, pages: [], errors: [], via: 'playwright' };
  const b = await chromium.launch();
  const ctx = await b.newContext({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36', viewport: { width: 1366, height: 900 } });
  const p = await ctx.newPage();
  // robots.txt (User-agent: * only)
  let disallow = [];
  try {
    const u = new URL(start); const rr = await ctx.request.get(u.origin + '/robots.txt', { timeout: 20000 });
    if (rr.ok()) { let on = false; for (const line of (await rr.text()).split(/\r?\n/)) { const [k, ...v] = line.split(':'); const val = v.join(':').trim();
      if (/^user-agent$/i.test(k.trim())) on = val === '*'; else if (on && /^disallow$/i.test(k.trim()) && val) disallow.push(val); } }
  } catch (e) {}
  const rx = d => new RegExp('^' + d.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\\\$$/, '$'));
  const ok = url => { const u = new URL(url); const path = u.pathname + u.search; return !disallow.some(d => rx(d).test(path)); };
  await sleep(2500);
  async function grab(url) {
    try {
      const r = await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await p.waitForTimeout(3500);
      const d = await p.evaluate(() => {
        const em = new Set();
        document.querySelectorAll('a[href^="mailto:"]').forEach(a => em.add(decodeURIComponent(a.getAttribute('href').slice(7).split('?')[0]).trim()));
        const links = [...document.querySelectorAll('a[href]')].map(a => [a.href, (a.innerText || '').trim().slice(0, 80)]);
        const md = document.querySelector('meta[name="description"]');
        return { title: document.title, text: document.body ? document.body.innerText : '', emails: [...em], links, meta: md ? md.content : '' };
      });
      const tm = (d.text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) || []); tm.forEach(e => d.emails.push(e));
      const emails = [...new Set(d.emails)].filter(e => !/(sentry|wixpress|example\.|domain\.com|\.png|\.jpg)/i.test(e));
      res.pages.push({ url: p.url(), status: r ? r.status() : 0, title: d.title, meta: strip(d.meta), text: strip(d.text).slice(0, 60000), emails, jsonld: [] });
      return d.links;
    } catch (e) { res.errors.push(url + ': ' + e.message.slice(0, 150)); return []; }
  }
  if (!ok(start)) { res.errors.push('robots disallows homepage'); }
  else {
    const links = await grab(start);
    res.final_home = p.url();
    const hd = dom(new URL(p.url()).hostname);
    const cands = new Map();
    for (const [href, text] of links) {
      let u; try { u = new URL(href); } catch (e) { continue; }
      if (!/^https?:$/.test(u.protocol) || dom(u.hostname) !== hd) continue;
      if (/\.(pdf|jpe?g|png|gif|zip|docx?|mp4|svg|webp)$/i.test(u.pathname)) continue;
      const key = u.pathname.replace(/\/$/, '') || '/'; if (key === '/') continue;
      const hay = (u.pathname + ' ' + text).toLowerCase();
      let sc = KW.reduce((a, [k, w]) => a + (hay.includes(k) ? w : 0), 0);
      if (sc <= 0) continue; if (/blog|news|post|privacy|terms|career|job|faq|login|pay/.test(hay)) sc -= 6;
      if (!cands.has(key) || cands.get(key)[0] < sc) cands.set(key, [sc, u.origin + u.pathname]);
    }
    const picked = [...cands.values()].sort((a, b) => b[0] - a[0]).slice(0, 9);
    for (const [, u] of picked) { if (!ok(u)) { res.errors.push('robots disallows ' + u); continue; } await sleep(2500); await grab(u); }
  }
  await b.close();
  fs.writeFileSync(`${OUT}/${slug}.json`, JSON.stringify(res, null, 1));
  console.log(slug, 'pages', res.pages.length, 'chars', res.pages.reduce((a, x) => a + x.text.length, 0), res.errors.slice(0, 2).join(' | '));
})();
