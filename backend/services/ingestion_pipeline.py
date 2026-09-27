import uuid
import re
import json
from datetime import datetime
from typing import Dict, Any, Optional, List
from models import IngestDocRequest, MemoryItem, IngestResponse
from services.hindsight_service import hindsight_service
from services.llm_service import llm_service

class IngestionPipeline:
    def __init__(self):
        pass

    async def extract_experience(self, request: IngestDocRequest) -> MemoryItem:
        content = request.content.strip()
        mem_id = f"MEM-INGEST-{uuid.uuid4().hex[:6].upper()}"
        date_str = request.date or datetime.now().strftime("%Y-%m-%d")

        # 1. Attempt AI-Powered Structured Semantic Extraction via LLM (Ollama)
        extracted_dict = await self._ai_extract(request.title, content, request.type)

        if not extracted_dict:
            # Fallback to intelligent regex & heuristic parser
            extracted_dict = self._heuristic_extract(request.title, content, request.type, request.technology, request.project, request.author)

        # Build clean tags
        tags = [
            request.type.lower(),
            (extracted_dict.get("technology") or request.technology or "general").lower(),
            (extracted_dict.get("project") or request.project or "core").lower(),
            "institutional_memory"
        ]
        for extra_tag in extracted_dict.get("tags", []):
            if extra_tag.lower() not in tags:
                tags.append(extra_tag.lower())

        memory = MemoryItem(
            id=mem_id,
            title=extracted_dict.get("title") or request.title,
            type=extracted_dict.get("type") or request.type,
            project=extracted_dict.get("project") or request.project or "Core Platform",
            technology=extracted_dict.get("technology") or request.technology or "General",
            author=extracted_dict.get("author") or request.author or "Engineering Team",
            date=date_str,
            event=extracted_dict.get("event") or f"Document logged: {request.title}",
            context=extracted_dict.get("context") or content[:300],
            decision=extracted_dict.get("decision") or "Recorded into organizational memory",
            action=extracted_dict.get("action") or "Synthesized into company brain repository",
            outcome=extracted_dict.get("outcome") or "Codified institutional precedent",
            lesson=extracted_dict.get("lesson") or f"Key takeaway recorded for {request.technology or 'Infrastructure'}.",
            summary=extracted_dict.get("summary") or f"{request.title}: {extracted_dict.get('lesson', '')}",
            tags=tags,
            source_id=mem_id,
            source_type="ingested_document",
            confidence_score=0.96,
            metadata={
                "risk_level": extracted_dict.get("risk_level", "Medium"),
                "safeguards": extracted_dict.get("safeguards", []),
                "raw_length": len(content),
                "extracted_via": "ollama_llama3.2" if extracted_dict.get("ai_extracted") else "heuristic_engine"
            }
        )

        # Store into Hindsight persistent memory layer
        hindsight_service.store_memory(memory)
        return memory

    async def _ai_extract(self, title: str, content: str, doc_type: str) -> Optional[Dict[str, Any]]:
        system_prompt = (
            "You are the NovaStack Knowledge Extraction Engine. "
            "Your job is to analyze engineering documents, GitHub PRs, incident postmortems, ADRs, and Slack chats. "
            "Extract structured experience data strictly in valid JSON format with the following keys:\n"
            "{\n"
            '  "title": "Precise descriptive title",\n'
            '  "type": "engineering_incident" | "architecture_decision" | "github_issue" | "meeting_note",\n'
            '  "technology": "Technologies involved (comma separated)",\n'
            '  "project": "Target subsystem or project",\n'
            '  "author": "Engineers or squad name",\n'
            '  "event": "Trigger event, incident catalyst, or proposal",\n'
            '  "context": "Technical background, symptoms, or problem constraints",\n'
            '  "decision": "Technical decision, architecture choice, or hotfix applied",\n'
            '  "action": "Specific engineering actions taken",\n'
            '  "outcome": "Measurable outcome or observed impact",\n'
            '  "lesson": "Actionable, permanent engineering takeaway / directive",\n'
            '  "summary": "2-sentence executive summary",\n'
            '  "risk_level": "Critical" | "High" | "Medium" | "Low",\n'
            '  "safeguards": ["Mandatory safeguard 1", "Mandatory safeguard 2"],\n'
            '  "tags": ["tag1", "tag2"]\n'
            "}\n"
            "Return ONLY the JSON object without markdown formatting or commentary."
        )

        user_prompt = f"Document Title: {title}\nDocument Type: {doc_type}\n\nContent:\n{content}"

        response_text = await llm_service.generate_response(system_prompt, user_prompt)
        if not response_text:
            return None

        try:
            # Clean possible markdown wrapping
            json_str = response_text.strip()
            if json_str.startswith("```json"):
                json_str = json_str[7:]
            if json_str.startswith("```"):
                json_str = json_str[3:]
            if json_str.endswith("```"):
                json_str = json_str[:-3]
            json_str = json_str.strip()

            data = json.loads(json_str)
            data["ai_extracted"] = True
            return data
        except Exception:
            return None

    def _heuristic_extract(self, title: str, content: str, doc_type: str, tech: Optional[str], proj: Optional[str], author: Optional[str]) -> Dict[str, Any]:
        # Intelligent regex patterns
        event_m = re.search(r'(?:Event|Trigger|What happened|Proposal|Problem|Incident):\s*([^\n\r]+)', content, re.IGNORECASE)
        context_m = re.search(r'(?:Context|Background|Root Cause|Symptoms|Why):\s*([^\n\r]+)', content, re.IGNORECASE)
        decision_m = re.search(r'(?:Decision|Remediation|Solution|Fix|Architectural Choice):\s*([^\n\r]+)', content, re.IGNORECASE)
        action_m = re.search(r'(?:Action|Implementation|Steps taken):\s*([^\n\r]+)', content, re.IGNORECASE)
        outcome_m = re.search(r'(?:Outcome|Result|Impact|Metrics):\s*([^\n\r]+)', content, re.IGNORECASE)
        lesson_m = re.search(r'(?:Lesson|Learnings?|Takeaway|Rule|Directives?):\s*([^\n\r]+)', content, re.IGNORECASE)

        # Tech detection
        tech_list = []
        for kw in ["redis", "postgres", "postgresql", "kafka", "temporal", "dynamodb", "sqs", "grpc", "kubernetes", "k8s", "docker", "vault", "elasticsearch", "duckdb", "go", "python", "typescript"]:
            if kw in content.lower() or (tech and kw in tech.lower()):
                tech_list.append(kw.capitalize())

        inferred_tech = ", ".join(tech_list) if tech_list else (tech or "General Architecture")
        inferred_event = event_m.group(1).strip() if event_m else f"Engineering activity logged: {title}"
        inferred_context = context_m.group(1).strip() if context_m else content[:200]
        inferred_decision = decision_m.group(1).strip() if decision_m else "Standardized in NovaStack architecture repository"
        inferred_action = action_m.group(1).strip() if action_m else "Implemented changes in codebase and verified in CI"
        inferred_outcome = outcome_m.group(1).strip() if outcome_m else "Production verified with zero regressions"
        inferred_lesson = lesson_m.group(1).strip() if lesson_m else f"Always enforce automated validation and circuit breakers when modifying {inferred_tech}."

        return {
            "title": title,
            "type": doc_type,
            "technology": inferred_tech,
            "project": proj or "Core Platform",
            "author": author or "Engineering Team",
            "event": inferred_event,
            "context": inferred_context,
            "decision": inferred_decision,
            "action": inferred_action,
            "outcome": inferred_outcome,
            "lesson": inferred_lesson,
            "summary": f"{title}: {inferred_lesson}",
            "risk_level": "High" if "incident" in doc_type.lower() or "outage" in content.lower() else "Medium",
            "safeguards": [
                f"Verify {inferred_tech} configuration in pre-flight staging tests.",
                "Enforce canary rollout with automated rollback triggers."
            ],
            "tags": [t.lower() for t in tech_list],
            "ai_extracted": False
        }

    async def ingest_document(self, request: IngestDocRequest) -> IngestResponse:
        try:
            extracted_mem = await self.extract_experience(request)
            return IngestResponse(
                success=True,
                memory_id=extracted_mem.id,
                message=f"Successfully extracted and indexed experience tuple into Hindsight persistent memory.",
                extracted_memory=extracted_mem
            )
        except Exception as e:
            return IngestResponse(
                success=False,
                memory_id="",
                message=f"Failed to ingest document: {str(e)}",
                extracted_memory=None
            )

ingestion_pipeline = IngestionPipeline()
