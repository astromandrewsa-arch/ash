"""td_si_list_parse.py: parse securityinformed/sourcesecurity directory list pages -> entries."""
import sys, json, re
from bs4 import BeautifulSoup
def parse_list(html_file, base='https://www.securityinformed.com'):
    s = BeautifulSoup(open(html_file).read(), 'lxml')
    out = []
    seen = set()
    for a in s.find_all('a', href=True):
        h = a['href']
        if re.search(r'/companies/[^/]+\.html$', h) and 'directory.html' not in h and a.parent.name == 'div' and 'h3' in (a.parent.get('class') or []):
            name = a.get_text(' ', strip=True)
            if not name or h in seen:
                continue
            # find enclosing card
            card = a; good = a
            for _ in range(6):
                if card.parent is None: break
                card = card.parent
                t = card.get_text('\n', strip=True)
                if len(t.split('\n')) >= 3 and len(card.find_all('div', class_='h3')) == 1:
                    good = card
            card = good
            lines = [l for l in card.get_text('\n', strip=True).split('\n') if l]
            seen.add(h)
            out.append({'name': name, 'href': h if h.startswith('http') else base + h, 'card': lines[:8]})
    return out
if __name__ == '__main__':
    base = sys.argv[2] if len(sys.argv) > 2 else 'https://www.securityinformed.com'
    for e in parse_list(sys.argv[1], base):
        print(json.dumps(e, ensure_ascii=False))
