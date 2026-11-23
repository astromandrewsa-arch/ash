"""Show text snippets from saved company pages: python3 tools/cw_show.py ROW REGEX [width]
Looks through raw/cw/html/<ROW>_*.html and prints REGEX matches with surrounding text."""
import sys, glob, re, os
from bs4 import BeautifulSoup

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
row, pat = sys.argv[1], sys.argv[2]
w = int(sys.argv[3]) if len(sys.argv) > 3 else 120
for f in sorted(glob.glob(os.path.join(HERE, "raw", "cw", "html", f"{row}_*.html"))):
    html = open(f, errors="ignore").read()
    s = BeautifulSoup(html, "lxml")
    canon = s.find("link", rel="canonical")
    for t in s(["script", "style", "noscript"]):
        t.decompose()
    txt = re.sub(r"\s+", " ", s.get_text(" ", strip=True))
    hits = list(re.finditer(pat, txt, re.I))
    if pat == "RAW":
        hits = list(re.finditer(sys.argv[3] if len(sys.argv) > 3 else "@", html, re.I))
        print("==", os.path.basename(f), canon.get("href") if canon else "")
        for m in hits[:15]:
            print("   ", html[max(0, m.start() - 150): m.end() + 150].replace("\n", " "))
        continue
    print("==", os.path.basename(f), canon.get("href") if canon else "", len(hits))
    for m in hits[:12]:
        print("   ", txt[max(0, m.start() - w): m.end() + w])
