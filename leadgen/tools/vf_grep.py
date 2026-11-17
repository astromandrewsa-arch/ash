"""Grep a company's crawled pages for a regex; prints unique matching lines (phone-free)."""
import json, re, sys
slug, rx = sys.argv[1], re.compile(sys.argv[2], re.I)
w = int(sys.argv[3]) if len(sys.argv) > 3 else 220
d = json.load(open(f'/home/user/ash/leadgen/raw/verify/{slug}.json'))
seen = set()
for p in d['pages']:
    for l in p['text'].split('\n'):
        l = l.strip()
        if rx.search(l) and l not in seen:
            seen.add(l); m = rx.search(l); s = max(0, m.start() - w // 2)
            print(f"[{p['url'].split('/',3)[-1][:30]}] {l[s:s + w]}")
