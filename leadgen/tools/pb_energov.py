"""Minimal client for a Tyler EnerGov Citizen Self Service public search (same JSON endpoints the public page calls).
Rate limited to one request every 3.5 s."""
import json, time, copy, sys, requests

class EnerGov:
    def __init__(self, base, tenant_id, tenant_name, tenant_url, template_post):
        self.base = base.rstrip('/')
        self.s = requests.Session()
        self.s.headers.update({
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json;charset=UTF-8',
            'tenantId': str(tenant_id), 'tenantName': tenant_name, 'Tyler-TenantUrl': tenant_url,
            'Tyler-Tenant-Culture': 'en-US', 'Referer': self.base,
        })
        self.template = json.loads(template_post) if isinstance(template_post, str) else template_post
        self.last = 0

    def _wait(self):
        d = time.time() - self.last
        if d < 3.5: time.sleep(3.5 - d)
        self.last = time.time()

    def get(self, path):
        self._wait()
        r = self.s.get(self.base + path, timeout=60)
        r.raise_for_status()
        return r.json()

    def post(self, path, body):
        self._wait()
        r = self.s.post(self.base + path, data=json.dumps(body), timeout=90)
        r.raise_for_status()
        return r.json()

    def search(self, keyword='', exact=True, filter_module=2, page=1, size=100, sort='PermitNumber.keyword', asc=True, permit=None):
        b = copy.deepcopy(self.template)
        b['Keyword'] = keyword; b['ExactMatch'] = exact; b['FilterModule'] = filter_module
        b['PageNumber'] = page; b['PageSize'] = size; b['SortBy'] = sort; b['SortAscending'] = asc
        if permit:
            b['PermitCriteria'].update(permit)
        return self.post('/api/energov/search/search', b)
