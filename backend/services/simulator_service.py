import re
from typing import List, Dict, Any, Optional
from models import SimulationRequest, SimulationResponse, RiskFactor, EvidenceItem
from services.hindsight_service import hindsight_service
from services.llm_service import llm_service

class RiskSimulatorService:
    def __init__(self):
        pass

    async def simulate_change(self, request: SimulationRequest) -> SimulationResponse:
        title = request.proposal_title.strip()
        change = request.proposed_change.strip()
        combined_text = f"{title} {change} {request.technology_involved} {request.target_project}"
        
        # 1. Search relevant Hindsight memories
        memories = hindsight_service.search_memories(combined_text, limit=6)
        evidence = hindsight_service.extract_evidence(memories)

        # 2. Rule-based memory matching & risk heuristic
        q = combined_text.lower()
        risks: List[RiskFactor] = []
        affected_adrs: List[str] = []
        safeguards: List[str] = []
        risk_score = 30
        risk_level = "Moderate Risk"
        recommendation = "CONDITIONALLY APPROVED"

        # Check for Redis / Caching risks (INC-101, ADR-002, ADR-006)
        if any(w in q for w in ["redis", "shared cache", "in-memory cache", "cache stampede", "elasticache"]):
            risk_score = 88
            risk_level = "High Risk"
            affected_adrs.append("ADR-006: 2-Tier Caching (Local LRU + DynamoDB)")
            affected_adrs.append("ADR-002: Recommendation Engine Caching")
            risks.append(RiskFactor(
                severity="Critical",
                title="Cache Stampede & Thundering Herd Vulnerability",
                historical_incident_ref="INC-101 (Jan 2024 Cache Stampede)",
                description="NovaStack previously suffered a 3-hour catastrophic outage when synchronized TTL expirations overwhelmed backing databases during traffic surges.",
                mitigation="Mandatory ±20% randomized TTL jitter, single-flight request coalescing mutexes, and multi-tier local in-process cache fallback."
            ))
            risks.append(RiskFactor(
                severity="High",
                title="Shared Redis Network Latency & Single Point of Failure",
                historical_incident_ref="ADR-006 Postmortem Analysis",
                description="Central Redis cluster introduced 15-25ms network hop latency compared to sub-millisecond local in-process memory cache.",
                mitigation="Maintain in-process Go-cache / LRU for hot read paths; only use distributed stores for shared mutable state."
            ))
            safeguards.append("Implement single-flight request coalescing to prevent thundering herd.")
            safeguards.append("Enforce ±20% randomized TTL jitter on all cache keys.")
            safeguards.append("Enforce strict fallback circuit breakers if remote cache latency exceeds 50ms.")
            recommendation = "HIGH CAUTION: Violates ADR-006 architectural policy unless single-flight mutexes and local LRU layers are strictly enforced."

        # Check for Database Connection Pool / PgBouncer risks (INC-102, ADR-004)
        elif any(w in q for w in ["pgbouncer", "connection pool", "direct connection", "database connection", "rds", "postgres"]):
            risk_score = 92
            risk_level = "Critical Risk"
            affected_adrs.append("ADR-004: Centralized PgBouncer Connection Pooling")
            risks.append(RiskFactor(
                severity="Critical",
                title="Database Connection Exhaustion Under Autoscaling",
                historical_incident_ref="INC-102 (Black Friday Database Outage)",
                description="Elastic Kubernetes pod scaling spawned 1,200+ direct Postgres connections, exhausting max_connections (500) and crashing Aurora Postgres.",
                mitigation="Centralized transaction-mode PgBouncer proxy layer is strictly mandatory before all PostgreSQL clusters."
            ))
            safeguards.append("Never allow direct Kubernetes application pod connections to RDS Aurora.")
            safeguards.append("Enforce transaction-level connection pooling via PgBouncer with max 50 server connections per pool.")
            safeguards.append("Set aggressive connection idle timeouts (idle_timeout = 30s).")
            recommendation = "REJECTED WITHOUT SAFEGUARDS: Direct database connections directly reproduce INC-102."

        # Check for Kafka vs SQS / Queue Ordering & Replay (ADR-005, INC-103)
        elif any(w in q for w in ["kafka", "sqs", "rabbitmq", "event stream", "message queue", "event replay"]):
            risk_score = 75
            risk_level = "High Risk"
            affected_adrs.append("ADR-005: Apache Kafka for Order Event Stream")
            risks.append(RiskFactor(
                severity="High",
                title="Loss of Strict Event Ordering & Replay Capabilities",
                historical_incident_ref="ADR-005 Evaluation & Decision Matrix",
                description="Switching from partitioned Kafka to standard SQS loses partition-level FIFO ordering and 7-day retrospective event replay for financial audit reconciliation.",
                mitigation="If using SQS, use SQS FIFO with strict MessageGroupId; ensure external event storage for long-term historical replay."
            ))
            safeguards.append("Ensure partition-key hashing guarantees causal event ordering.")
            safeguards.append("Implement dead-letter queues (DLQ) with automated alert triggers on retry count > 3.")
            recommendation = "CONDITIONALLY APPROVED with strict architectural review of ordering and replay guarantees."

        # Check for Webhook / Idempotency / Financial risks (INC-104, ADR-008)
        elif any(w in q for w in ["webhook", "payment", "idempotency", "stripe", "billing", "financial"]):
            risk_score = 85
            risk_level = "High Risk"
            affected_adrs.append("ADR-008: Distributed Idempotency Key Gateway")
            risks.append(RiskFactor(
                severity="Critical",
                title="Duplicate Transaction & Double-Processing Race Condition",
                historical_incident_ref="INC-104 (Stripe Double-Billing Incident)",
                description="Retried webhook calls processed in parallel caused double customer charges and ledger discrepancies.",
                mitigation="Enforce atomic Redis/DynamoDB distributed lock on idempotency keys before processing financial mutations."
            ))
            safeguards.append("Atomic idempotency validation at API gateway entry before triggering async workflows.")
            safeguards.append("24-hour deduplication window on all external webhooks.")
            recommendation = "CONDITIONALLY APPROVED: Idempotency gateway middleware must be verified in pre-flight staging tests."

        # Check for gRPC / Microservices (ADR-001, ADR-007)
        elif any(w in q for w in ["grpc", "rest", "protobuf", "service-to-service", "internal api"]):
            risk_score = 45
            risk_level = "Moderate Risk"
            affected_adrs.append("ADR-001: gRPC for Internal Microservice Communication")
            risks.append(RiskFactor(
                severity="Medium",
                title="Schema Incompatibility & Latency Regression",
                historical_incident_ref="ADR-001 Performance Benchmark",
                description="Internal HTTP/JSON REST APIs increased inter-service latency by 4x compared to binary Protobuf serialization.",
                mitigation="Maintain strict Protobuf schema registry with backward compatibility checks in CI/CD pipeline."
            ))
            safeguards.append("Run buf lint and buf breaking in CI before merging schema changes.")
            safeguards.append("Set gRPC deadline propagations on all downstream RPC calls.")
            recommendation = "APPROVED WITH MONITORING: Ensure CI contract tests are active."

        else:
            # General safe change
            risk_score = 25
            risk_level = "Low Risk / Safe"
            safeguards.append("Standard canary deployment (10% -> 50% -> 100%) with automated rollbacks.")
            safeguards.append("Monitor p99 latency, error rates, and CPU utilization for 60 minutes post-deployment.")
            recommendation = "APPROVED: No historical violations or recurring incident patterns detected."

        # 3. LLM Deep Synthesis for Architectural Simulation
        system_prompt = (
            "You are the NovaStack Principal Architectural Risk Evaluator & Simulator. "
            "You analyze proposed technical changes against past incidents, ADRs, postmortems, and engineering failures in company memory. "
            "Provide an incisive, realistic engineering risk analysis citing specific past incidents (INC-xxx) and architectural decisions (ADR-xxx). "
            "Format your analysis clearly with Executive Summary, Historical Precedents, and Operational Safeguards."
        )

        memory_context_str = "\n".join([
            f"- [{m.source_id or m.id}] ({m.date}) {m.title}: {m.summary or m.lesson or ''}"
            for m in memories
        ])

        user_prompt = (
            f"Proposed Change Title: {title}\n"
            f"Proposed Implementation: {change}\n"
            f"Target System/Project: {request.target_project}\n"
            f"Technology Involved: {request.technology_involved}\n\n"
            f"Retrieved Historical Memories & Lessons from Hindsight:\n{memory_context_str}\n\n"
            f"Evaluate the architectural blast radius, historical conflict with past lessons, and required safeguards."
        )

        llm_summary = await llm_service.generate_response(system_prompt, user_prompt)
        if not llm_summary:
            llm_summary = (
                f"### 🛡️ Architectural Pre-Flight Simulation Report: {title}\n\n"
                f"**Risk Rating:** {risk_level} (Score: {risk_score}/100) — **{recommendation}**\n\n"
                f"#### 🔍 Historical Pattern Analysis\n"
                f"The proposed change affects core infrastructure patterns previously addressed across **{len(memories)} organizational memories**. "
                f"Historical analysis indicates critical sensitivity to past lessons recorded in **{', '.join(affected_adrs) if affected_adrs else 'NovaStack Baseline ADRs'}**.\n\n"
                f"#### ⚠️ Key Blast Radius & Failure Modes\n" +
                "\n".join([f"- **{r.title}** ({r.severity}): {r.description}\n  *Recommended Mitigation:* {r.mitigation}" for r in risks]) +
                f"\n\n#### 📋 Mandatory Pre-Deployment Safeguards\n" +
                "\n".join([f"- [ ] {s}" for s in safeguards])
            )

        return SimulationResponse(
            proposal_title=title,
            risk_level=risk_level,
            risk_score=risk_score,
            approval_recommendation=recommendation,
            summary=llm_summary,
            identified_risks=risks,
            affected_adrs=affected_adrs,
            mandatory_safeguards=safeguards,
            historical_evidence=evidence
        )

simulator_service = RiskSimulatorService()
