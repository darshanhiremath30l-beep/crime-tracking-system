from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

# simple report without file
payload = {
    'title': 'Inproc Test',
    'description': 'Automated in-process test',
    'latitude': '14.4668',
    'longitude': '75.9219',
    'severity': 'Medium',
    'type': 'crime'
}

resp = client.post('/report', data=payload)
print('POST /report ->', resp.status_code)
try:
    print(resp.json())
except Exception:
    print(resp.text)

# fetch crimes
r2 = client.get('/crimes')
print('GET /crimes ->', r2.status_code, 'items=', len(r2.json()))
print(r2.json()[:3])
