import requests
import sys

sys.stdout.reconfigure(encoding='utf-8')

q = "i need a 30 day plan for next financial month"
res = requests.post("http://127.0.0.1:8000/api/chat", json={"query": q}).json()
print("=== QUERY TEST ===")
print("Query:", q)
print("Intent:", res.get("intent"))
print(f"Confidence: {res.get('confidence_level')} ({res.get('confidence_percentage')}%)")
print("Evidence cited:", len(res.get("evidence", [])))
print("\n[ANSWER]:\n" + res.get("answer", ""))
