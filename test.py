import urllib.request
import urllib.error
import urllib.parse
import json

req = urllib.request.Request(
    'http://localhost:8000/interactions', 
    data=b'{"doctor_name":"Dr. Test", "interaction_type":"Visit", "interaction_date":"2026-04-17T18:27:00"}',
    headers={'Content-Type':'application/json'}
)
try:
    urllib.request.urlopen(req)
    print("Success!")
except urllib.error.HTTPError as e:
    print(e.read().decode())
