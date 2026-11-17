"""Mask phone-number patterns in text files in place (lead-gen rule: never store phone numbers).
Usage: python3 pb_mask.py file1.txt [file2.txt ...]"""
import re, sys
PHONE = re.compile(r'(?<!\d)(?:\+?1[\s.-]*)?\(?\d{3}\)?[\s.-]*\d{3}[\s.-]+\d{4}(?!\d)')

def mask(s):
    return PHONE.sub('[phone]', s)

if __name__ == '__main__':
    for f in sys.argv[1:]:
        t = open(f, encoding='utf-8', errors='ignore').read()
        open(f, 'w', encoding='utf-8').write(mask(t))
