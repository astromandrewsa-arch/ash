// how_pwcrawl.cjs: render JS-heavy institution sites in headless Chromium (home + a few about/staff/contact pages).
// Saves redacted HTML + visible text to leadgen/raw/how/sites/<host>/pw_<slug>.{html,txt}. >=3.5 s between loads.
// usage: node how_pwcrawl.cjs [--max=5] URL [URL ...] | @file
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', 'raw', 'how', 'sites');
const PH = /(?<![\w\/=.-])(?:\+?1[\s.-]?)?\(?\b[2-9]\d{2}\)?[\s.\-–‑]?\d{3}[\s.\-–‑]\d{4}\b(?:\s*(?:x|ext\.?)\s*\d{1,5})?/g;
const TEL = /tel:[+\d\-\.\(\)%20 ]+/g;
const redact = s => s.replace(TEL, 'tel:REDACTED').replace(PH, '[phone redacted]');
const KEY = /about|staff|team|clergy|rabbi|leader|contact|admin|faculty|board|who-we|our-|security|member|mission|welcome|school|preschool|early/i;
const BAD = /\.(pdf|jpe?g|png|gif|svg|webp|mp4|mp3|zip|docx?|xlsx?|ics)(\?|$)|login|donat|calendar|event|mailto:|tel:|javascript:|\/tag\/|\/category\//i;
const hostkey = u => new URL(u).host.toLowerCase().replace(/^www\./, '');
const slug = u => { const p = new URL(u); let s = (p.pathname + (p.search ? '_' + p.search : '')).replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'index'; return 'pw_' + s.slice(0, 90); };
const score = h => { const s = h.toLowerCase(); const ks = ['staff', 'clergy', 'rabbi', 'leader', 'team', 'admin', 'about', 'contact', 'security', 'board', 'faculty', 'who']; for (let i = 0; i < ks.length; i++) if (s.includes(ks[i])) return i; return 50; };
(async () => {
  let max = 5; const urls = [];
  for (const a of process.argv.slice(2)) { if (a.startsWith('--max=')) max = parseInt(a.slice(6)); else if (a.startsWith('@')) urls.push(...fs.readFileSync(a.slice(1), 'utf8').split('\n').map(s => s.trim()).filter(s => s && !s.startsWith('#'))); else urls.push(a); }
  const b = await chromium.launch();
  const ctx = await b.newContext({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36', viewport: { width: 1366, height: 900 } });
  const p = await ctx.newPage();
  const load = async (u, dir) => {
    const t0 = Date.now();
    let ok = null;
    try {
      const r = await p.goto(u, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await p.waitForTimeout(4500);
      const st = r ? r.status() : 0;
      const txt = await p.evaluate(() => document.title + '\n' + (document.body ? document.body.innerText : ''));
      const html = await p.content();
      fs.mkdirSync(dir, { recursive: true });
      const base = path.join(dir, slug(p.url()));
      fs.writeFileSync(base + '.html', redact(html));
      fs.writeFileSync(base + '.txt', `URL: ${p.url()}\nSTATUS: ${st}\n` + redact(txt));
      console.log('OK', st, u, '->', p.url(), txt.length);
      const links = await p.evaluate(() => Array.from(document.querySelectorAll('a[href]')).map(a => [a.href, (a.innerText || '').trim().slice(0, 60)]));
      ok = { st, links, final: p.url() };
    } catch (e) { console.log('ERR', u, e.message.slice(0, 150)); }
    const el = Date.now() - t0; if (el < 3500) await p.waitForTimeout(3500 - el);
    return ok;
  };
  for (const u0 of urls) {
    const u = u0.startsWith('http') ? u0 : 'https://' + u0;
    const dir = path.join(ROOT, hostkey(u));
    if (fs.existsSync(path.join(dir, '_pwdone'))) { console.log('SKIP', u); continue; }
    const r = await load(u, dir);
    const log = [];
    if (r && r.st < 400) {
      const fh = new URL(r.final).host;
      let cand = [];
      for (const [h, t] of r.links) {
        try { const x = new URL(h); if (x.host !== fh) continue; } catch (e) { continue; }
        if (BAD.test(h)) continue;
        const hh = h.split('#')[0];
        if ((KEY.test(hh) || KEY.test(t)) && hh.replace(/\/$/, '') !== r.final.replace(/\/$/, '') && !cand.includes(hh)) cand.push(hh);
      }
      cand.sort((a, c) => score(a) - score(c));
      for (const h of cand.slice(0, max)) { const rr = await load(h, dir); log.push((rr ? rr.st : 'ERR') + ' ' + h); }
    }
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, '_pwdone'), (r ? r.st : 'ERR') + ' ' + u + '\n' + log.join('\n') + '\n');
  }
  await b.close();
  console.log('ALL DONE');
})();
