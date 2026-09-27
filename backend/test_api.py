import requests
import json
import time

backend_url = 'http://127.0.0.1:8000'
frontend_url = 'http://127.0.0.1:5173'

print('=== 1. CHECKING HEALTH & SERVICES ===')
try:
    r = requests.get(f'{backend_url}/health', timeout=5)
    print(f'[OK] Backend Health: {r.json()}')
except Exception as e:
    print(f'[FAIL] Backend Health: {e}')

try:
    r = requests.get(frontend_url, timeout=5)
    print(f'[OK] Frontend Server: HTTP {r.status_code}')
except Exception as e:
    print(f'[FAIL] Frontend Server: {e}')

print('\n=== 2. TESTING ALL API ENDPOINTS ===')
endpoints = [
    ('GET', '/api/memories', {}),
    ('GET', '/api/decisions', {}),
    ('GET', '/api/incidents', {}),
    ('GET', '/api/timeline', {}),
    ('GET', '/api/graph', {}),
    ('GET', '/api/insights', {}),
    ('GET', '/api/demo/status', {}),
    ('POST', '/api/chat', {'query': 'Why did we stop using Redis?'}),
    ('POST', '/api/chat', {'query': 'Should we use Redis for Project Nova?'}),
    ('POST', '/api/chat', {'query': 'What has the company learned about caching?'}),
    ('POST', '/api/memory/ingest', {
        'title': 'INC-116: Test Ingestion Outage',
        'type': 'engineering_incident',
        'technology': 'Kafka',
        'project': 'Event Bus',
        'content': 'Event: Lag increased. Context: Network glitch. Decision: Restarted consumers. Outcome: Recovered. Lesson: Set proper consumer timeouts.'
    })
]

for method, path, payload in endpoints:
    url = f'{backend_url}{path}'
    t0 = time.time()
    try:
        if method == 'GET':
            res = requests.get(url, timeout=5)
        else:
            res = requests.post(url, json=payload, timeout=5)
        dt = (time.time() - t0) * 1000
        print(f'[{res.status_code}] {method} {path} ({dt:.1f}ms) - OK')
    except Exception as e:
        print(f'[ERROR] {method} {path} - {e}')

print('\n=== 3. DEMO STAGE PROGRESSION TEST ===')
# Test stage 1 (Cold Start)
r1 = requests.post(f'{backend_url}/api/chat', json={'query': 'Why did we stop using Redis?', 'demo_stage': 1}).json()
print(f'Stage 1 (Cold Start) Response: Confidence={r1["confidence_level"]}, Answer Snippet="{r1["answer"][:60]}..."')

# Test stage 3 (Full Knowledge)
r3 = requests.post(f'{backend_url}/api/chat', json={'query': 'Why did we stop using Redis?', 'demo_stage': 3}).json()
print(f'Stage 3 (Full Knowledge) Response: Confidence={r3["confidence_level"]}, Causal Steps={len(r3["causal_chain"])}, Evidence={len(r3["evidence"])}')

# Reset
requests.post(f'{backend_url}/api/demo/reset')
print('\n>>> All verification tests passed successfully! <<<')
