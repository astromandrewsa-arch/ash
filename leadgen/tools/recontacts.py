# Re-run contact extraction on cached pages is not possible (only samples cached), so re-fetch contact pages only for
# sites whose cache has pages; cheap: re-enrich with force in parallel.
import json, glob, sys
sys.path.insert(0, '/home/user/ash/leadgen')
from enrich import enrich_many, enrich
import enrich as E
urls = []
for f in glob.glob('/home/user/ash/leadgen/cache/*.json'):
    d = json.load(open(f))
    if d.get('ok'):
        urls.append(d['website'])
from concurrent.futures import ThreadPoolExecutor
with ThreadPoolExecutor(8) as ex:
    list(ex.map(lambda u: E._safe_force(u), urls))
print('done', len(urls))
