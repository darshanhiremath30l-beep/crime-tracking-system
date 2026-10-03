import os, json, time
APP_DIR = os.path.join(os.path.dirname(__file__), '..', 'backend')
DATA_FILE = os.path.join(APP_DIR, 'crimes.json')
UPLOAD_DIR = os.path.join(APP_DIR, 'uploads')
os.makedirs(UPLOAD_DIR, exist_ok=True)
crimes = []
if os.path.exists(DATA_FILE):
    try:
        with open(DATA_FILE, 'r') as f:
            crimes = json.load(f)
    except Exception:
        crimes = []
new = {
    'id': len(crimes) + 1,
    'title': 'Local Script Test',
    'description': 'Inserted by add_crime_local.py',
    'latitude': 6.5,
    'longitude': 3.3,
    'type': 'crime',
    'severity': '2',
    'created_at': time.strftime('%Y-%m-%d %H:%M:%S'),
    'media_url': None
}
crimes.append(new)
with open(DATA_FILE, 'w') as f:
    json.dump(crimes, f, indent=2)
print('WROTE', DATA_FILE)
print(new)
