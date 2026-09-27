import asyncio
import sys

sys.stdout.reconfigure(encoding='utf-8')
from services.agent_orchestrator import agent_orchestrator
from models import ChatRequest

queries = [
    "Why did we stop using Redis?",
    "Should we use Redis for Project Nova?",
    "What has the company learned about caching?",
    "Have we experienced database latency during high traffic?",
    "Why did we migrate away from Firebase Auth?",
    "How was the gRPC client thread starvation incident resolved?",
    "What happened during the Kubernetes node panic?",
    "What has the company learned about authentication?"
]

async def run():
    print("="*75)
    print("DIRECT AGENT ORCHESTRATOR REASONING VERIFICATION")
    print("="*75)
    for idx, q in enumerate(queries, 1):
        res = await agent_orchestrator.process_query(ChatRequest(query=q, demo_stage=3))
        preview = res.answer[:140].replace("\n", " ")
        print(f"[{idx}/8] QUERY: \"{q}\"")
        print(f"  • Intent: {res.intent}")
        print(f"  • Confidence: {res.confidence_level} ({res.confidence_percentage}%)")
        print(f"  • Evidence: {len(res.evidence)} citations")
        print(f"  • Causal Steps: {len(res.causal_chain)} steps")
        print(f"  • Key Lessons: {len(res.key_lessons)}")
        print(f"  • Follow-ups: {len(res.suggested_followups)}")
        print(f"  • Answer Preview:\n    {preview}...\n")

asyncio.run(run())
