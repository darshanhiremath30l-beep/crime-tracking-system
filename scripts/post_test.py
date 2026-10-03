import uuid, urllib.request
url = 'http://127.0.0.1:8000/report'
fields = {
    'title': 'Automated Test',
    'description': 'Test submission from agent',
    'latitude': '6.5',
    'longitude': '3.3',
    'severity': '2',
    'type': 'crime'
}
boundary = '----WebKitFormBoundary' + uuid.uuid4().hex
lines = []
for name, value in fields.items():
    lines.append('--' + boundary)
    lines.append(f'Content-Disposition: form-data; name="{name}"')
    lines.append('')
    lines.append(str(value))
lines.append('--' + boundary + '--')
body = '\r\n'.join(lines).encode('utf-8')
req = urllib.request.Request(url, data=body)
req.add_header('Content-Type', f'multipart/form-data; boundary={boundary}')
req.add_header('Content-Length', str(len(body)))
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        print('STATUS', resp.getcode())
        print(resp.read().decode('utf-8'))
except Exception as e:
    print('ERROR', e)
