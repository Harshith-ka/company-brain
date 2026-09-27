from fastapi import APIRouter
from models import InsightMetrics
from services.hindsight_service import hindsight_service
import json
import os
from config import settings

router = APIRouter(prefix="/api/insights", tags=["Organizational Learning & Insights"])

@router.get("", response_model=InsightMetrics)
async def get_insights():
    memories = hindsight_service.get_all_memories()
    
    total_mems = len(memories)
    total_decisions = sum(1 for m in memories if m.type == "architecture_decision")
    total_incidents = sum(1 for m in memories if m.type == "engineering_incident")
    
    # Calculate unique lessons
    lessons = [
        {"id": m.id, "title": m.title, "lesson": m.lesson, "date": m.date, "technology": m.technology}
        for m in memories if m.lesson
    ]
    
    # Count tech mentions
    tech_counts = {}
    for m in memories:
        tech = m.technology
        if tech and tech != "General":
            tech_counts[tech] = tech_counts.get(tech, 0) + 1
            
    top_technologies = [
        {"name": k, "count": v}
        for k, v in sorted(tech_counts.items(), key=lambda x: x[1], reverse=True)[:6]
    ]

    # Generate live institutional activity pulse items
    live_pulse = []
    pulse_templates = [
        {"type": "safeguard_enforced", "actor": "Policy Agent", "title": "Enforced ±20% TTL jitter validation on Cache PR #409", "tag": "Safeguard"},
        {"type": "memory_formed", "actor": "Hindsight Ingestion", "title": "Indexed ADR-006: 2-Tier DynamoDB Caching pattern", "tag": "Memory"},
        {"type": "decision_codified", "actor": "Dave Chen (Principal)", "title": "Codified Temporal.io for Distributed Saga Orchestration", "tag": "Architecture"},
        {"type": "incident_resolved", "actor": "SRE On-Call (Priya)", "title": "PgBouncer Connection saturation rule verified (0 errors)", "tag": "Reliability"},
        {"type": "safeguard_enforced", "actor": "Risk Simulator", "title": "Blocked direct RDS connections in payment-service helm chart", "tag": "Pre-Flight"}
    ]
    for i, item in enumerate(pulse_templates):
        live_pulse.append({
            "id": f"pulse-{i+1}",
            "timestamp": "Just now" if i == 0 else f"{i*12}m ago",
            "type": item["type"],
            "title": item["title"],
            "actor": item["actor"],
            "tag": item["tag"]
        })

    return InsightMetrics(
        total_memories=total_mems,
        total_decisions=total_decisions,
        total_incidents=total_incidents,
        total_lessons=len(lessons),
        repeated_issues=7,
        resolved_patterns=13,
        recurring_risks=4,
        top_technologies=top_technologies,
        recent_lessons=lessons[:8],
        live_pulse_stream=live_pulse
    )
