# CompanyBrain System Architecture

> **AI Organizational Intelligence & Persistent Memory Platform**
> Built for the **AI Agents That Learn Using Hindsight** Hackathon.

---

## 1. High-Level Architectural Flow

```text
                                COMPANY SOURCES
                                       │
                ┌──────────────────────┼──────────────────────┐
                │                      │                      │
             GitHub                Documents              Incidents
          (Issues/PRs)            (ADRs/Notes)          (Postmortems)
                │                      │                      │
                └──────────────────────┼──────────────────────┘
                                       ↓
                               INGESTION PIPELINE
                     (Event → Context → Decision → Action
                               → Outcome → Lesson)
                                       ↓
                      ┌─────────────────────────────────┐
                      │                                 │
                      │       HINDSIGHT MEMORY          │
                      │ Persistent Organizational Graph │
                      │                                 │
                      └────────────────┬────────────────┘
                                       │
                                       ▼
                             AGENT ORCHESTRATOR
                ┌──────────────────────┴──────────────────────┐
                │                                             │
         INTENT DETECTOR                              CONFIDENCE SCORER
   (Why Engine, Advisory,                        (Known: Direct Citation
    Incident Lookup, Synthesis)                   Inferred: Cross-event synthesis
                │                                 Unknown: Cold start)
                │                                             │
                └──────────────────────┬──────────────────────┘
                                       ▼
                               REASONING SYNTHESIS
                        (LLM + Causal Reconstruction)
                                       │
                                       ▼
                           INTERACTIVE FRONTEND
             (Chat, 60s Demo Runner, Memory Graph, Timeline,
                 Decision Explorer, Incident Postmortems)
```

---

## 2. Core Experience Memory Object

Unlike traditional RAG chunking, CompanyBrain models each organizational event as a 6-part causal relationship:

```json
{
  "id": "MEM-INC-101",
  "title": "Redis Cache Stampede Outage",
  "type": "engineering_incident",
  "project": "Recommendation Service",
  "technology": "Redis",
  "date": "2024-01-26",
  "event": "Recommendation Service error rate spiked to 85%; p99 latency reached 4.8s",
  "context": "Marketing push sent 50k concurrent users to homepage; default cache key lacked TTL jitter",
  "decision": "Emergency rollout of single-flight mutex locks on cache misses and ±20% randomized jitter",
  "action": "Scaled Aurora replicas; authored ADR-006 to deprecate Redis in favor of Local LRU + DynamoDB",
  "outcome": "Stabilized latency; ADR-006 lowered p99 to 8ms and raised availability to 99.99%",
  "lesson": "Never use fixed TTLs on hot cache keys. Implement single-flight query coalescing to avoid thundering herds."
}
```

---

## 3. The "Why?" Engine Causal Backward Tracer

When a user asks:
> *"Why did NovaStack stop using Redis?"*

CompanyBrain traces historical nodes backward in chronological order:

$$\text{ADR-002 (Introduction)} \longrightarrow \text{INC-101 (Stampede Outage)} \longrightarrow \text{GH-102 (Hotfix)} \longrightarrow \text{ADR-006 (Local LRU Pivot)} \longrightarrow \text{ADR-020 (Company Policy v2)}$$

---

## 4. Evidence-Based Confidence Classification

1. **Known (90% - 100%)**: Directly supported by explicit incident postmortems, ADRs, or GitHub pull requests with verified authors and timestamps.
2. **Inferred (75% - 89%)**: Synthesized across multiple related memories (e.g. projecting past caching lessons onto the new Project Nova architecture).
3. **Unknown (< 50%)**: Insufficient organizational history in Hindsight (triggering honest cold-start disclosure).
