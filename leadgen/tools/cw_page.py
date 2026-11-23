"""Fetch one or more specific pages of a company's own site (robots.txt respected, 1.5 s apart), save the HTML
under raw/cw/html/<ROW>_*.html and print the phone numbers / emails found with their surrounding text.
usage: python3 tools/cw_page.py ROW URL [URL ...]   (add --render to force headless Chromium)"""
import sys, os, time, hashlib, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cw_crawl import fetch, render, extract, HTML_DIR

args = sys.argv[1:]
force_render = "--render" in args
args = [a for a in args if a != "--render"]
row, urls = args[0], args[1:]
for i, u in enumerate(urls):
    if i:
        time.sleep(1.5)
    if force_render:
        fu, html, how = render(u)
    else:
        fu, html, how = fetch(u)
        if html and how == "requests":
            p, *_ = extract(html, fu)
            if not p:
                ru, rh, rhow = render(fu)
                if rh:
                    fu, html, how = ru, rh, rhow
    print("=====", u, "->", fu, how)
    if not html:
        continue
    fn = hashlib.md5(fu.encode()).hexdigest()[:10]
    open(os.path.join(HTML_DIR, f"{row}_{fn}.html"), "w").write(html)
    phones, emails, links, txt, title = extract(html, fu)
    print("title:", title)
    seen = {}
    for p in phones:
        seen.setdefault(p["phone"], []).append(p.get("ctx", "")[:170])
    for k, v in seen.items():
        print("  ", k, len(v), "|", v[0])
    print("   emails:", emails)
    for m in re.finditer(r"\b(?:1[-. ])?\(?\d{3}\)?[-. ]\d{3}[-. ][A-Z]{4}\b", txt):
        print("   vanity:", txt[max(0, m.start() - 60): m.end() + 30].replace("\n", " | "))
