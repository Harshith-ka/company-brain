import re
from typing import List, Dict, Any, Optional
from models import GitHubPRAuditRequest, GitHubPRAuditResponse, SlackCommandRequest, SlackCommandResponse
from services.hindsight_service import hindsight_service
from services.llm_service import llm_service

class IntegrationService:
    def __init__(self):
        pass

    async def audit_github_pr(self, req: GitHubPRAuditRequest) -> GitHubPRAuditResponse:
        combined = f"{req.pr_title}\n{req.diff_or_description}"
        q = combined.lower()

        # 1. Search Hindsight memories
        memories = hindsight_service.search_memories(combined, limit=6)
        
        status = "APPROVED"
        risk_score = 20
        cited_adrs = []
        cited_incidents = []
        suggested_changes = []
        checklist = [
            "CI automated unit and integration tests passing",
            "Canary deployment with automated rollback metrics"
        ]

        # Check for DB Connection / PgBouncer violations
        if any(w in q for w in ["max_connections", "postgres", "connection pool", "direct connection", "pg_pool", "database url"]):
            risk_score = 90
            status = "BLOCKED_HIGH_RISK"
            cited_adrs.append("ADR-004: Mandatory PgBouncer Connection Pooling")
            cited_incidents.append("INC-102: Black Friday Aurora Connection Exhaustion")
            suggested_changes.append("Configure database connection string to point to PgBouncer proxy on port 6432 instead of direct Aurora port 5432.")
            suggested_changes.append("Reduce client-side pool size from default to max 10 connections per container instance.")
            checklist.append("Verify traffic routes through PgBouncer transaction-mode pooler.")
            checklist.append("Confirm idle connection timeouts set to 30 seconds.")

        # Check for Redis Cache Stampede / TTL Jitter
        elif any(w in q for w in ["redis", "ttl", "cache", "expire", "elasticache"]):
            risk_score = 80
            status = "WARNING_REVIEW_REQUIRED"
            cited_adrs.append("ADR-006: 2-Tier Caching Architecture (Local LRU + DynamoDB)")
            cited_adrs.append("ADR-002: Recommendation Engine Caching")
            cited_incidents.append("INC-101: Cache Stampede Outage During Marketing Surge")
            suggested_changes.append("Inject randomized +/-20% TTL jitter in cache write handler to prevent synchronized key expiry.")
            suggested_changes.append("Wrap cache read with single-flight mutexes (sync.Once / golang.org/x/sync/singleflight).")
            checklist.append("Verify +/-20% randomized jitter on all SetKey TTLs.")
            checklist.append("Test fallback behavior under high cache miss rates in staging.")

        # Check for Kafka / Queue Ordering
        elif any(w in q for w in ["kafka", "sqs", "partition", "consumer group", "rebalance"]):
            risk_score = 70
            status = "WARNING_REVIEW_REQUIRED"
            cited_adrs.append("ADR-005: Apache Kafka for Order Event Stream")
            cited_adrs.append("ADR-019: Dead Letter Queues with Exponential Jitter")
            cited_incidents.append("INC-104: Kafka Consumer Group Cascading Rebalance Storm")
            suggested_changes.append("Enable static consumer group membership in consumer configuration to prevent rolling deployment cascades.")
            suggested_changes.append("Implement Dead Letter Queue (DLQ) with exponential backoff on retry count > 3.")
            checklist.append("Verify static group membership configured in Helm values.")
            checklist.append("DLQ routing alert configured in Datadog / PagerDuty.")

        # Check for Webhooks / Financial Mutations
        elif any(w in q for w in ["webhook", "stripe", "billing", "payment", "payout"]):
            risk_score = 85
            status = "WARNING_REVIEW_REQUIRED"
            cited_adrs.append("ADR-008: Distributed Idempotency Key Gateway")
            cited_incidents.append("INC-103: Stripe Double-Billing Race Condition")
            suggested_changes.append("Enforce atomic distributed lock on idempotency keys at API gateway entry before triggering workflow.")
            checklist.append("Idempotency key 24h retention verified.")
            checklist.append("Double-charge simulation test suite executed in CI.")

        # 2. Generate GitHub Markdown Comment via LLM
        system_prompt = (
            "You are CompanyBrain Guard, an automated GitHub CI/CD Action that protects NovaStack codebases. "
            "You audit Pull Requests against organizational memory (past incidents, postmortems, ADRs). "
            "Write a clear, professional, and actionable GitHub PR review comment in markdown format. "
            "Highlight the audit verdict (Approved / Warning / Blocked), cite specific ADRs & Incidents, explain failure risks, and provide exact code change instructions."
        )

        user_prompt = (
            f"Repository: {req.repo_name} | PR #{req.pr_number}: {req.pr_title}\n"
            f"Author: @{req.author}\n"
            f"Diff / PR Content:\n{req.diff_or_description}\n\n"
            f"Audit Verdict: {status} (Risk Score: {risk_score}/100)\n"
            f"Cited ADRs: {', '.join(cited_adrs) if cited_adrs else 'None'}\n"
            f"Cited Incidents: {', '.join(cited_incidents) if cited_incidents else 'None'}\n"
            f"Suggested Changes: {suggested_changes}\n"
            f"Checklist: {checklist}\n\n"
            "Format the GitHub PR comment clearly with badges, risk summary, historical citations, and actionable checklist."
        )

        llm_comment = await llm_service.generate_response(system_prompt, user_prompt)
        if not llm_comment:
            verdict_badge = "🔴 **BLOCKED: HIGH ARCHITECTURAL RISK**" if status == "BLOCKED_HIGH_RISK" else ("🟡 **WARNING: ARCHITECTURAL REVIEW REQUIRED**" if status == "WARNING_REVIEW_REQUIRED" else "🟢 **APPROVED: SAFE TO MERGE**")
            llm_comment = (
                f"## 🛡️ CompanyBrain Guard — PR #{req.pr_number} Audit Report\n\n"
                f"{verdict_badge} (Risk Score: **{risk_score}/100**)\n\n"
                f"CompanyBrain cross-checked this Pull Request against NovaStack's institutional history.\n\n"
                f"### ⚠️ Historical Precedents & Blast Radius\n" +
                (f"- **Violated Architectural Standards:** {', '.join(cited_adrs)}\n" if cited_adrs else "") +
                (f"- **Related Past Production Outages:** {', '.join(cited_incidents)}\n\n" if cited_incidents else "\n") +
                "### 🔧 Required Code Modifications\n" +
                "\n".join([f"- {ch}" for ch in suggested_changes]) +
                "\n\n### ✅ Safe Merge Checklist\n" +
                "\n".join([f"- [ ] {item}" for item in checklist]) +
                "\n\n---\n*Powered by CompanyBrain Persistent Organizational Memory (Hindsight)*"
            )

        return GitHubPRAuditResponse(
            pr_number=req.pr_number,
            status=status,
            risk_score=risk_score,
            markdown_comment=llm_comment,
            cited_adrs=cited_adrs,
            cited_incidents=cited_incidents,
            suggested_code_changes=suggested_changes,
            safe_merge_checklist=checklist
        )

    async def handle_slack_command(self, req: SlackCommandRequest) -> SlackCommandResponse:
        query = req.text.strip()
        memories = hindsight_service.search_memories(query, limit=5)

        responders = ["Dave Chen (Principal Architect)", "Priya Sharma (Staff SRE)"]
        
        # LLM response for Slack
        system_prompt = (
            "You are CompanyBrain Slack Copilot, responding directly in an engineering war-room channel. "
            "Give concise, punchy, high-signal engineering advice. "
            "Always cite specific ADR-xxx, INC-xxx, and recommend the best engineer/lead to loop in."
        )
        user_prompt = f"Slack Channel: #{req.channel_name}\nQuestion from @{req.user_name}: {query}\n\nRelevant Memories:\n" + "\n".join([f"- {m.title}: {m.lesson or m.outcome}" for m in memories])

        bot_reply = await llm_service.generate_response(system_prompt, user_prompt)
        if not bot_reply:
            bot_reply = f"🔍 **CompanyBrain War-Room Assistant:**\nFound {len(memories)} matching experiences in NovaStack memory for: *\"{query}\"*\n\n" + "\n".join([f"• **{m.title}** ({m.date}): {m.lesson or m.outcome}" for m in memories[:3]])

        blocks = [
            {
                "type": "header",
                "text": {"type": "plain_text", "text": "🧠 CompanyBrain Institutional Intelligence"}
            },
            {
                "type": "section",
                "text": {"type": "mrkdwn", "text": bot_reply}
            },
            {
                "type": "context",
                "elements": [
                    {"type": "mrkdwn", "text": f"👤 *Recommended On-Call Contacts:* {', '.join(responders)} | ⚡ *Source:* Hindsight Persistent Memory"}
                ]
            }
        ]

        return SlackCommandResponse(
            response_type="in_channel",
            text=bot_reply,
            formatted_blocks=blocks,
            historical_matches=len(memories),
            recommended_responders=responders
        )

integration_service = IntegrationService()
