import re
from typing import List, Dict, Any, Optional
from models import ChatRequest, ChatResponse, EvidenceItem, CausalStep, MemoryItem
from services.hindsight_service import hindsight_service
from services.llm_service import llm_service

class AgentOrchestrator:
    def __init__(self):
        pass

    def detect_intent(self, query: str) -> str:
        q = query.lower()
        if any(w in q for w in ["why did", "why did we", "why was", "why stopped", "why stop", "reason for", "why migrate", "why replace"]):
            return "why_engine"
        elif any(w in q for w in ["should we use", "consider", "evaluating", "for project nova", "recommendation for", "new project", "recommend"]):
            return "technology_advisory"
        elif any(w in q for w in ["what have we learned", "what did we learn", "lessons learned", "lessons on", "what we learned", "what has the company learned", "what have we", "learned about"]):
            return "learning_synthesis"
        elif any(w in q for w in ["have we faced", "have we seen", "similar problem", "incident like", "outage like", "troubleshoot", "how was", "what happened"]):
            return "similar_experience"
        elif any(w in q for w in ["who made", "who decided", "authors", "participants", "who worked"]):
            return "personnel_lookup"
        else:
            return "general_memory_search"

    async def process_query(self, request: ChatRequest) -> ChatResponse:
        query = request.query.strip()
        if request.demo_stage is not None:
            hindsight_service.set_demo_stage(request.demo_stage)

        intent = self.detect_intent(query)
        memories = hindsight_service.search_memories(query, limit=8, project_filter=request.project_context)
        evidence = hindsight_service.extract_evidence(memories)

        # Cold Start check for demo stage 1
        if hindsight_service.demo_stage == 1 and ("redis" in query.lower() or not memories):
            return ChatResponse(
                answer="I don't have enough organizational history on this topic yet. No historical incidents, decisions, or postmortems regarding Redis or this architecture have been recorded in NovaStack's memory repository.",
                intent=intent,
                confidence_level="Unknown",
                confidence_percentage=15,
                evidence=[],
                causal_chain=[],
                suggested_followups=[
                    "Load NovaStack historical experiences into Hindsight",
                    "What technologies are currently tracked in memory?"
                ],
                key_lessons=[],
                historical_count=0
            )

        # If Demo Stage 2: Early Stage (Only initial Redis introduction ADR-002)
        if hindsight_service.demo_stage == 2 and "redis" in query.lower():
            causal = [
                CausalStep(step="1. Proposal", label="ADR-002 (June 2023)", description="Redis was introduced for Recommendation Service caching to achieve <50ms p99 read latency.", reference_id="ADR-002")
            ]
            return ChatResponse(
                answer="Redis was introduced in June 2023 (ADR-002) by Dave Chen and Priya Sharma to serve as a shared caching layer in front of PostgreSQL for the Recommendation Service, aiming to reduce database query load by 70% and lower p99 latency to 15ms.\n\nAt this point in organizational history, no negative incidents or replacement decisions have been documented.",
                intent=intent,
                confidence_level="Known",
                confidence_percentage=75,
                evidence=evidence[:2],
                causal_chain=causal,
                suggested_followups=[
                    "What happened to Redis under peak load?",
                    "Feed subsequent incident postmortems into Hindsight"
                ],
                key_lessons=["Initial motivation for Redis was sub-millisecond read latency for recommendation score lookups."],
                historical_count=len(memories)
            )

        # Build Causal Chain & Synthesized Response
        causal_chain = self._build_causal_chain(query, intent, memories)
        key_lessons = self._extract_key_lessons(memories)
        confidence_level, confidence_pct = self._calculate_confidence(intent, memories)

        # Determine Persona Lens
        persona = (request.persona or "architect").lower()
        persona_map = {
            "architect": ("Principal Architect", "Analyze with focus on system decoupling, state boundaries, scalability trade-offs, and long-term tech debt prevention."),
            "sre": ("Staff SRE / Reliability Lead", "Analyze with focus on failure blast radius, latency spikes, single points of failure, MTTR, alerting, and operational resiliency."),
            "security": ("Security & Governance Lead", "Analyze with focus on data exfiltration risks, auth token handling, multi-tenancy isolation, secret rotation, and auditability."),
            "new_hire": ("Engineering Mentor (New Hire Lens)", "Explain with clear historical context, why legacy decisions were made, practical dos and don'ts, and team domain ownership.")
        }
        persona_name, persona_focus = persona_map.get(persona, ("Principal Architect", "Analyze with focus on system decoupling, state boundaries, and long-term architectural stability."))

        # Attempt LLM generation if API configured
        system_prompt = (
            f"You are CompanyBrain, an AI Organizational Memory & Intelligence Agent for NovaStack. "
            f"You are speaking from the perspective of: {persona_name}. {persona_focus} "
            "You preserve and reason over persistent company experiences (Decisions -> Incidents -> Outcomes -> Lessons). "
            "Always cite specific evidence (ADR-xxx, INC-xxx, GH-xxx, engineers) from the provided organizational memory. "
            "Distinguish explicitly between what is KNOWN (direct memory facts), INFERRED (logical cross-event conclusions), and UNKNOWN. "
            "Do not give generic textbook answers; ground your reasoning directly in NovaStack's institutional history."
        )

        memory_context_str = "\n".join([
            f"- [{m.source_id or m.id}] ({m.date}) {m.title}: Context: {m.context or ''} | Decision: {m.decision or ''} | Outcome: {m.outcome or ''} | Lesson: {m.lesson or ''}"
            for m in memories
        ])

        user_prompt = f"Perspective Lens: {persona_name}\nUser Question: {query}\n\nRetrieved Organizational Memories from Hindsight:\n{memory_context_str}"
        llm_answer = await llm_service.generate_response(system_prompt, user_prompt)

        if not llm_answer:
            llm_answer = self._synthesize_local_response(query, intent, memories, causal_chain, key_lessons)

        suggested_followups = self._generate_followups(query, intent, memories)

        return ChatResponse(
            answer=llm_answer,
            intent=intent,
            confidence_level=confidence_level,
            confidence_percentage=confidence_pct,
            persona_applied=persona_name,
            evidence=evidence,
            causal_chain=causal_chain,
            suggested_followups=suggested_followups,
            key_lessons=key_lessons,
            historical_count=len(memories)
        )

    def _build_causal_chain(self, query: str, intent: str, memories: List[MemoryItem]) -> List[CausalStep]:
        chain = []
        q = query.lower()

        if "redis" in q or "caching" in q:
            chain.append(CausalStep(
                step="1. Initial Decision",
                label="ADR-002 (June 2023)",
                description="Redis introduced as a shared cache in front of PostgreSQL for Recommendation Service.",
                reference_id="ADR-002"
            ))
            chain.append(CausalStep(
                step="2. Production Incident",
                label="INC-101 (Jan 26, 2024)",
                description="Cache Stampede during flash marketing surge. Unjittered TTL caused 50k concurrent requests to miss and saturate PostgreSQL.",
                reference_id="INC-101"
            ))
            chain.append(CausalStep(
                step="3. Emergency Remediation",
                label="GH-102 Hotfix",
                description="Priya Sharma added single-flight query mutex locks and randomized ±20% TTL jitter.",
                reference_id="GH-102"
            ))
            chain.append(CausalStep(
                step="4. Architectural Pivot",
                label="ADR-006 (Feb 2024)",
                description="Replaced shared Redis with 2-tier Local LRU (in-process Go-cache) backed by AWS DynamoDB, dropping p99 latency to 8ms.",
                reference_id="ADR-006"
            ))
            chain.append(CausalStep(
                step="5. Standardized Policy",
                label="ADR-020 (March 2025)",
                description="Company-wide Caching Policy v2 codified: Workload characterization, webhook invalidation, and mandatory jitter.",
                reference_id="ADR-020"
            ))
        elif "firebase" in q or "auth" in q or "jwt" in q or "login" in q:
            chain.append(CausalStep(
                step="1. Incident Trigger",
                label="INC-103 (Aug 2023)",
                description="Firebase Auth project-level IP rate limits blocked European user logins during marketing campaign.",
                reference_id="INC-103"
            ))
            chain.append(CausalStep(
                step="2. Architecture Decision",
                label="ADR-003 (Aug 2023)",
                description="Migrated to self-hosted OAuth2 + RS256 JWT tokens for tenant isolation, enterprise SAML/SSO, and SLA sovereignty.",
                reference_id="ADR-003"
            ))
            chain.append(CausalStep(
                step="3. Rotation Postmortem",
                label="INC-114 (Sept 2024)",
                description="JWKS key rotation dropped old verification key immediately; policy updated to require 48h dual-key overlap.",
                reference_id="INC-114"
            ))
        elif "connection" in q or "database" in q or "postgres" in q or "pgbouncer" in q:
            chain.append(CausalStep(
                step="1. Base Decision",
                label="ADR-001 (March 2023)",
                description="PostgreSQL selected as primary ACID relational data store.",
                reference_id="ADR-001"
            ))
            chain.append(CausalStep(
                step="2. Saturation Incident",
                label="INC-102 (Nov 2023)",
                description="Pod autoscaling spawned 3,600 connections, crashing PostgreSQL max_connections limit.",
                reference_id="INC-102"
            ))
            chain.append(CausalStep(
                step="3. Resolution",
                label="ADR-010 (June 2024)",
                description="Deployed PgBouncer transaction pooling, capping physical backend connections at 150.",
                reference_id="ADR-010"
            ))
        elif "grpc" in q or "deadline" in q or "timeout" in q or "thread" in q:
            chain.append(CausalStep(
                step="1. Standardization",
                label="ADR-008 (April 2024)",
                description="Standardized internal microservice RPC communication on gRPC with Protobuf contracts.",
                reference_id="ADR-008"
            ))
            chain.append(CausalStep(
                step="2. Production Outage",
                label="INC-113 (June 2024)",
                description="Outbound gRPC call lacked deadline; thread pool blocked indefinitely when third-party API stalled.",
                reference_id="INC-113"
            ))
            chain.append(CausalStep(
                step="3. Standard Mandate",
                label="GH-107 Hotfix",
                description="Mandated default 2000ms deadline and circuit breakers on all outbound client stubs.",
                reference_id="GH-107"
            ))
        elif "kubernetes" in q or "k8s" in q or "oom" in q or "node" in q:
            chain.append(CausalStep(
                step="1. Migration",
                label="ADR-005 (Nov 2023)",
                description="Migrated container workloads to Amazon EKS managed Kubernetes clusters.",
                reference_id="ADR-005"
            ))
            chain.append(CausalStep(
                step="2. Node Outage",
                label="INC-106 (May 2024)",
                description="Analytics worker without memory limits consumed 64GB RAM, starving kubelet and causing node panic.",
                reference_id="INC-106"
            ))
            chain.append(CausalStep(
                step="3. Enforced Safeguards",
                label="GH-119 / ADR-017",
                description="Enforced namespace LimitRanges and weekly Chaos Mesh drills for memory limits.",
                reference_id="GH-119"
            ))
        elif "kafka" in q or "rebalance" in q or "dlq" in q:
            chain.append(CausalStep(
                step="1. Event Bus",
                label="ADR-004 (Oct 2023)",
                description="Adopted Apache Kafka for asynchronous inter-service event distribution.",
                reference_id="ADR-004"
            ))
            chain.append(CausalStep(
                step="2. Rebalance Storm",
                label="INC-104 (Feb 2024)",
                description="Pod cycling triggered cascading consumer group rebalance loops.",
                reference_id="INC-104"
            ))
            chain.append(CausalStep(
                step="3. Resilient DLQ",
                label="ADR-019 (Feb 2025)",
                description="Codified static group membership and Dead Letter Queues with exponential backoff.",
                reference_id="ADR-019"
            ))
        elif any(w in q for w in ["30 day", "30-day", "financial", "month", "plan", "roadmap"]):
            chain.append(CausalStep(
                step="1. Core Orchestration",
                label="ADR-012 (Aug 2024)",
                description="Temporal.io adopted for deterministic payment and onboarding workflows.",
                reference_id="ADR-012"
            ))
            chain.append(CausalStep(
                step="2. Webhook Lock",
                label="INC-108 (Aug 2024)",
                description="Distributed atomic mutex locks on payment webhooks to prevent duplicate charges.",
                reference_id="INC-108"
            ))
            chain.append(CausalStep(
                step="3. ETL Optimization",
                label="INC-112 (Dec 2024)",
                description="S3 prefix namespace hashing to prevent throttling during nightly financial ETL runs.",
                reference_id="INC-112"
            ))
            chain.append(CausalStep(
                step="4. Invoicing Isolation",
                label="INC-115 (Feb 2025)",
                description="Isolated Chromium PDF rendering workers to prevent event loop thread starvation.",
                reference_id="INC-115"
            ))
            chain.append(CausalStep(
                step="5. Resilient Retries",
                label="ADR-019 (Feb 2025)",
                description="Kafka Dead Letter Queues with exponential jitter for failed invoice processing.",
                reference_id="ADR-019"
            ))
        else:
            for i, m in enumerate(memories[:4], 1):
                chain.append(CausalStep(
                    step=f"Step {i}",
                    label=f"{m.source_id or m.type.replace('_', ' ').title()} ({m.date})",
                    description=m.summary or m.lesson or m.title,
                    reference_id=m.source_id
                ))
        return chain

    def _extract_key_lessons(self, memories: List[MemoryItem]) -> List[str]:
        lessons = []
        for m in memories:
            if m.lesson and m.lesson not in lessons:
                lessons.append(m.lesson)
        return lessons[:4]

    def _calculate_confidence(self, intent: str, memories: List[MemoryItem]) -> tuple[str, int]:
        if not memories:
            return "Unknown", 10
        has_direct_postmortem = any(m.source_type == "incident" or m.source_type == "adr" for m in memories)
        if has_direct_postmortem and len(memories) >= 2:
            return "Known", 96
        elif len(memories) >= 1:
            return "Inferred", 84
        return "Unknown", 40

    def _synthesize_local_response(self, query: str, intent: str, memories: List[MemoryItem], causal_chain: List[CausalStep], key_lessons: List[str]) -> str:
        q = query.lower()

        # 1. Why Did We Stop Using Redis?
        if "why" in q and "redis" in q:
            return (
                "### 🔍 Historical Reason: Why NovaStack Replaced Redis\n\n"
                "NovaStack stopped using a shared **Redis** cluster for the **Recommendation Service** following a major P1 production incident (**INC-101**) on January 26, 2024.\n\n"
                "**1. The Root Cause (Incident INC-101):**\n"
                "A marketing campaign sent 50,000 concurrent users to the homepage. The Redis default recommendation ranking cache key expired simultaneously due to lack of TTL jitter. All 50,000 requests bypassed the cache simultaneously (*Cache Stampede / Thundering Herd*), saturating PostgreSQL CPU at 100% and driving Recommendation error rates to 85%.\n\n"
                "**2. The Architectural Pivot (ADR-006):**\n"
                "Following the postmortem led by Priya Sharma and Elena Vance, NovaStack superseded ADR-002 with **ADR-006** (February 2024). The team deprecated the shared Redis cluster in favor of a **2-tier architecture: In-process Local LRU (Go-cache)** backed by **AWS DynamoDB** with single-digit millisecond point reads.\n\n"
                "**3. The Outcome:**\n"
                "- p99 latency dropped from 145ms to **8ms**.\n"
                "- Recommendation availability rose from 99.85% to **99.99%**.\n"
                "- Network serialization bottlenecks and global cache locks were completely eliminated."
            )

        # 2. Should we use Redis for Project Nova?
        if "nova" in q or ("should we use" in q and "redis" in q):
            return (
                "### 💡 Organizational Memory Advisory: Redis for Project Nova\n\n"
                "Based on **3 historical experiences** across NovaStack's engineering history, here is our evidence-backed guidance:\n\n"
                "**Historical Context & Risk Assessment:**\n"
                "1. **Previous Pitfall (INC-101 & ADR-002):** When Redis was previously used for the Recommendation Service, unjittered TTLs and un-coalesced cache misses triggered a catastrophic cache stampede that overwhelmed the primary database.\n"
                "2. **Workload Compatibility Check:** Project Nova is a *high-throughput payment routing and settlement engine*. Redis is viable **only** if implemented in strict accordance with NovaStack's **Caching Policy v2 (ADR-020)**.\n\n"
                "**Mandatory Architectural Safeguards for Project Nova:**\n"
                "- **Single-Flight Query Coalescing:** Implement mutex locking on cache misses (per GH-102 hotfix).\n"
                "- **Randomized TTL Jitter (±20%):** Prevent simultaneous expiration across batch payment keys.\n"
                "- **Event-Driven Invalidation:** Use Kafka webhooks instead of short polling TTLs.\n"
                "- **Local L1 LRU + L2 Redis:** Use in-memory LRU for hot tenant lookups to reduce Redis network round-trips."
            )

        # 3. What have we learned about caching?
        if "caching" in q and any(w in q for w in ["learn", "lesson", "what", "policy", "standard"]):
            return (
                "### 🧠 Organizational Synthesis: What NovaStack Has Learned About Caching\n\n"
                "Over the past 2 years across **3 architecture decisions (ADR-002, ADR-006, ADR-020)** and **2 production postmortems (INC-101, INC-102)**, the engineering team has established four foundational principles:\n\n"
                "1. **Workload Precedes Technology:** Global shared Redis clusters are vulnerable to thundering herd storms under bursty, read-heavy localized traffic. Local in-process LRU with deterministic invalidation often outperforms remote network caches.\n"
                "2. **Zero-Tolerance for Fixed TTLs:** Every cached key must incorporate ±20% randomized jitter to prevent simultaneous multi-key expirations.\n"
                "3. **Single-Flight Coalescing is Mandatory:** Never allow concurrent cache misses for the same key to hit downstream databases un-throttled.\n"
                "4. **Standardized Caching Policy v2 (ADR-020):** Adopted company-wide in March 2025, codifying multi-tier caching (L1 Local + L2 Distributed) and webhook-driven cache evictions."
            )

        # 4. Database Latency / High Traffic Incidents
        if ("database" in q or "latency" in q or "traffic" in q or "postgres" in q) and any(w in q for w in ["experience", "incident", "latency", "high traffic", "saturat", "outage"]):
            return (
                "### 📊 Similar Historical Incident Matches\n\n"
                "Organizational memory matches **2 previous incidents** involving database saturation and latency under high traffic:\n\n"
                "1. **INC-101 (Jan 2024 - Redis Cache Stampede):** 50k concurrent requests bypassed cache and saturated PostgreSQL CPU at 100%.\n"
                "   - *Resolution:* Added single-flight mutex locks on cache misses and switched to Local LRU + DynamoDB (ADR-006).\n"
                "2. **INC-102 (Nov 2023 - Database Connection Exhaustion):** Kubernetes pod autoscaling spawned 3,600 simultaneous DB connections, exhausting PostgreSQL `max_connections`.\n"
                "   - *Resolution:* Deployed PgBouncer transaction connection pooling (ADR-010), capping physical backend connections at 150."
            )

        # 5. Why Did We Migrate Away from Firebase Auth?
        if "firebase" in q or ("migrate" in q and "auth" in q) or ("why" in q and "auth" in q):
            return (
                "### 🔐 Historical Reason: Migration from Firebase Authentication\n\n"
                "NovaStack migrated away from **Firebase Authentication** in August 2023 (**ADR-003**) led by Sarah Jenkins (Security Lead) and Dave Chen.\n\n"
                "**1. The Incident Trigger (INC-103):**\n"
                "During an enterprise onboarding campaign in Germany, Firebase project-level IP rate limits blocked 1,400 user logins (`auth/too-many-requests`), causing a 2-hour onboarding blackout.\n\n"
                "**2. The Architectural Decision (ADR-003):**\n"
                "NovaStack replaced Firebase with self-hosted **OAuth2 and RS256-signed JWT tokens**.\n"
                "- **Why:** Required complete tenant sovereignty, custom SAML/SSO enterprise integrations, and strict VPC data residency.\n"
                "- **Outcome:** Saved $4,200/month in SaaS billing and unlocked enterprise multi-tenancy.\n\n"
                "**3. Downstream Takeaway (INC-114):**\n"
                "Custom auth necessitated strict automated secret rotation, which later required a 48-hour dual-JWKS grace overlap period after an early key deletion caused a temporary session logout incident (INC-114)."
            )

        # 6. gRPC Client Thread Starvation
        if "grpc" in q or "deadline" in q or ("thread" in q and "starvation" in q):
            return (
                "### ⚡ Resolution: gRPC Client Thread Starvation (INC-113)\n\n"
                "On June 28, 2024, an outage occurred when the Payment Gateway connecting to the Risk Evaluation Service hung indefinitely (**INC-113**).\n\n"
                "**1. Root Cause:**\n"
                "The gRPC client stubs were instantiated without explicit `grpc.deadline` timeouts. When the downstream Risk Evaluation Service stalled on a third-party credit check API, all Payment Gateway worker threads blocked waiting indefinitely, causing HTTP 504 Gateway Timeouts.\n\n"
                "**2. Remediation & Policy (ADR-008 & GH-107):**\n"
                "- Enforced a mandatory **2000ms deadline** on all outbound gRPC client stubs.\n"
                "- Configured circuit breaker pattern with graceful fallback to an asynchronous review queue.\n"
                "- Added compile-time CI lint checks ensuring no unconstrained gRPC stubs are merged."
            )

        # 7. Kubernetes Node Panic & OOMKilled
        if "kubernetes" in q or "oom" in q or "node panic" in q or "k8s" in q:
            return (
                "### ☸️ Postmortem: Kubernetes Node OOMKilled Panic (INC-106)\n\n"
                "On May 18, 2024, 3 worker nodes in the Amazon EKS cluster entered `NotReady` state, evicting 45 pods across multiple namespaces (**INC-106**).\n\n"
                "**1. Root Cause:**\n"
                "An Analytics worker container was configured without `limits.memory`. When generating an enterprise report, it consumed 64GB RAM, starving OS memory and killing the `kubelet` and `containerd` daemons.\n\n"
                "**2. Resolution & Safeguards:**\n"
                "- Enforced namespace-wide **LimitRange** and **ResourceQuota** policies (GH-119).\n"
                "- Integrated **Chaos Mesh** (ADR-017) to conduct weekly automated synthetic memory exhaustion drills in staging."
            )

        # 8. What has the company learned about authentication?
        if "auth" in q and any(w in q for w in ["learn", "lesson", "what", "security"]):
            return (
                "### 🛡️ Organizational Synthesis: Authentication Lessons\n\n"
                "Across **ADR-003, ADR-018, INC-103, and INC-114**, NovaStack has learned three core security and architecture lessons:\n\n"
                "1. **Third-Party Rate Limits are Existential Risks:** Managed SaaS auth providers (Firebase) have hard IP quotas that can halt viral enterprise onboarding campaigns.\n"
                "2. **Dual-Key JWKS Rotation Grace Period:** Cryptographic key rotation must retain N-1 verification keys for 48 hours to prevent invalidating active sessions.\n"
                "3. **Dynamic Secret Management with Vault (ADR-018):** Microservices should lease dynamic short-lived credentials, backed by automated retry loops with watchdog alarms."
            )

        # 9. Operational & Financial Month 30-Day Planning
        if any(w in q for w in ["30 day", "30-day", "financial month", "monthly plan", "operational plan"]):
            return (
                "### 📅 30-Day Financial Month Engineering & Operational Plan\n\n"
                "Based on NovaStack's institutional history across **payment workflows (ADR-012), webhook races (INC-108), financial ETL saturation (INC-112), and PDF generation (INC-115)**, here is your 4-week execution roadmap:\n\n"
                "#### 🔹 Week 1 (Days 1–7): Billing Ingestion & Webhook Hardening\n"
                "- **Enforce Distributed Idempotency Locks (INC-108):** Ensure all Stripe and payment gateway webhook receivers check atomic Redis/DynamoDB mutex locks on `event_id` with 24-hour expiration to prevent duplicate billing.\n"
                "- **Validate Temporal.io Subscription Workflows (ADR-012):** Verify that all multi-day billing and renewal orchestrations execute via deterministic Temporal Activities with exponential backoff.\n\n"
                "#### 🔹 Week 2 (Days 8–14): Financial ETL & Storage Prefix Optimization\n"
                "- **S3 Prefix Namespace Audit (INC-112):** Restructure high-throughput financial batch reporting keys with randomized prefix hash namespaces (`s3://novastack-data/{hash}/...`) to avoid hitting AWS S3 3,500 PUT / 5,500 GET prefix throttling during nightly ETL.\n"
                "- **Database Connection Buffer (ADR-010):** Verify PgBouncer connection pools are capped at 150 backend connections ahead of mid-month volume.\n\n"
                "#### 🔹 Week 3 (Days 15–21): Ingress Rate Limiting & Reliability Drills\n"
                "- **Envoy Proxy Rate Limit Validation (ADR-014):** Test sliding-window limits on client API gateways (Pro: 600 req/min, Enterprise: 6,000 req/min).\n"
                "- **Chaos Mesh Drill (ADR-017):** Execute pre-scheduled synthetic latency drills to verify payment circuit breaker failovers.\n\n"
                "#### 🔹 Week 4 (Days 22–30): Month-End Statements & Invoice Delivery\n"
                "- **Isolated PDF Rendering Workers (INC-115):** Ensure headless Chromium statement generators run in detached worker pools with strict memory limits to prevent async event loop thread starvation.\n"
                "- **Kafka DLQ & Poison Pill Triage (ADR-019):** Monitor Dead Letter Queues for malformed invoices and automated retry routing."
            )

        # General Synthesis
        mem_summaries = "\n".join([f"- **{m.title}** ({m.date}): {m.lesson or m.outcome or m.summary}" for m in memories[:3]])
        return (
            f"### 📋 Organizational Memory Synthesis\n\n"
            f"Based on **{len(memories)} persistent memories** retrieved from Hindsight:\n\n"
            f"{mem_summaries}\n\n"
            f"**Core Institutional Takeaway:**\n"
            f"{key_lessons[0] if key_lessons else 'Institutional knowledge reflects continuous evolution across NovaStack architecture.'}"
        )

    def _generate_followups(self, query: str, intent: str, memories: List[MemoryItem]) -> List[str]:
        q = query.lower()
        if "redis" in q:
            return [
                "Should we use Redis for Project Nova?",
                "What has the company learned about caching?",
                "Show Incident INC-101 postmortem details",
                "Inspect ADR-006 architecture decision"
            ]
        elif "nova" in q:
            return [
                "What has the company learned about caching?",
                "What are the safeguards in Caching Policy v2 (ADR-020)?",
                "Why did we stop using Redis?"
            ]
        elif "caching" in q:
            return [
                "Why did we stop using Redis?",
                "Should we use Redis for Project Nova?",
                "Show memory timeline for caching"
            ]
        elif "auth" in q or "firebase" in q:
            return [
                "What has the company learned about authentication?",
                "Explain the JWT secret key rotation incident (INC-114)",
                "Inspect ADR-003 custom OAuth2 architecture"
            ]
        elif "grpc" in q:
            return [
                "Inspect ADR-008 internal service communication",
                "What other timeout safeguards exist at NovaStack?"
            ]
        elif "kubernetes" in q or "k8s" in q or "oom" in q:
            return [
                "Inspect ADR-005 Kubernetes migration",
                "How does NovaStack test reliability with Chaos Mesh (ADR-017)?"
            ]
        return [
            "What has the company learned about caching?",
            "What has the company learned about authentication?",
            "Show recent engineering incidents",
            "Explain the database connection pooling decision (ADR-010)"
        ]

agent_orchestrator = AgentOrchestrator()
