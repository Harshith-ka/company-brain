from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class MemoryItem(BaseModel):
    id: str
    title: str
    type: str = Field(..., description="engineering_incident | architecture_decision | github_issue | meeting_note | lesson_learned")
    project: str
    technology: str
    author: Optional[str] = "NovaStack Team"
    date: str
    event: Optional[str] = None
    context: Optional[str] = None
    decision: Optional[str] = None
    action: Optional[str] = None
    outcome: Optional[str] = None
    lesson: Optional[str] = None
    summary: Optional[str] = None
    tags: List[str] = []
    source_id: Optional[str] = None
    source_type: Optional[str] = None
    confidence_score: float = 0.95
    metadata: Dict[str, Any] = {}

class DecisionItem(BaseModel):
    id: str
    title: str
    date: str
    status: str
    category: str
    technology: str
    project: str
    authors: List[str]
    decision: str
    reason: str
    alternatives_considered: List[str]
    expected_outcome: str
    actual_outcome: str
    lessons_learned: str

class IncidentItem(BaseModel):
    id: str
    title: str
    date: str
    severity: str
    system: str
    duration: str
    lead_responder: str
    participants: List[str]
    symptoms: str
    root_cause: str
    actions_taken: List[str]
    resolution: str
    impact: str
    lessons_learned: str
    related_adrs: List[str] = []
    related_incidents: List[str] = []

class EvidenceItem(BaseModel):
    id: str
    title: str
    type: str
    technology: str
    relevance_reason: str
    citation_snippet: str
    date: str
    source_id: Optional[str] = None

class CausalStep(BaseModel):
    step: str
    label: str
    description: str
    reference_id: Optional[str] = None

class ChatRequest(BaseModel):
    query: str
    project_context: Optional[str] = None
    persona: Optional[str] = "architect"  # "architect" | "sre" | "security" | "new_hire"
    demo_stage: Optional[int] = None  # 1: Cold start, 2: After Redis intro, 3: Full history

class ChatResponse(BaseModel):
    answer: str
    intent: str
    confidence_level: str = Field(..., description="'Known' | 'Inferred' | 'Unknown'")
    confidence_percentage: int = 95
    persona_applied: Optional[str] = "Principal Architect"
    evidence: List[EvidenceItem] = []
    causal_chain: List[CausalStep] = []
    suggested_followups: List[str] = []
    key_lessons: List[str] = []
    historical_count: int = 0

class SimulationRequest(BaseModel):
    proposal_title: str
    proposed_change: str
    target_project: Optional[str] = "Core Platform"
    technology_involved: Optional[str] = "General"
    target_workload: Optional[str] = "High-throughput production"

class RiskFactor(BaseModel):
    severity: str  # "Critical" | "High" | "Medium" | "Low"
    title: str
    historical_incident_ref: Optional[str] = None
    description: str
    mitigation: str

class SimulationResponse(BaseModel):
    proposal_title: str
    risk_level: str  # "Critical Risk" | "High Risk" | "Moderate Risk" | "Low Risk / Safe"
    risk_score: int  # 0 to 100
    approval_recommendation: str
    summary: str
    identified_risks: List[RiskFactor] = []
    affected_adrs: List[str] = []
    mandatory_safeguards: List[str] = []
    historical_evidence: List[EvidenceItem] = []

class IngestDocRequest(BaseModel):
    title: str
    type: str
    content: str
    project: Optional[str] = "Core Platform"
    technology: Optional[str] = "General"
    author: Optional[str] = "Engineering Team"
    date: Optional[str] = None

class IngestResponse(BaseModel):
    success: bool
    memory_id: str
    message: str
    extracted_memory: Optional[MemoryItem] = None

class TimelineItem(BaseModel):
    id: str
    date: str
    title: str
    category: str
    type: str
    summary: str
    lesson: Optional[str] = None
    related_ids: List[str] = []

class GraphNode(BaseModel):
    id: str
    label: str
    type: str  # tech, project, person, decision, incident, lesson
    category: Optional[str] = None
    data: Dict[str, Any] = {}

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str
    relation: str

class GraphData(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]

class LivePulseItem(BaseModel):
    id: str
    timestamp: str
    type: str  # "memory_formed" | "incident_resolved" | "decision_codified" | "safeguard_enforced"
    title: str
    actor: str
    tag: str

class InsightMetrics(BaseModel):
    total_memories: int
    total_decisions: int
    total_incidents: int
    total_lessons: int
    repeated_issues: int
    resolved_patterns: int
    recurring_risks: int
    top_technologies: List[Dict[str, Any]]
    recent_lessons: List[Dict[str, Any]]
    live_pulse_stream: List[LivePulseItem] = []

class GitHubPRAuditRequest(BaseModel):
    repo_name: str = "novastack/core-platform"
    pr_number: int = 492
    pr_title: str
    author: str = "dev-engineer"
    diff_or_description: str
    target_branch: str = "main"

class GitHubPRAuditResponse(BaseModel):
    pr_number: int
    status: str  # "APPROVED" | "WARNING_REVIEW_REQUIRED" | "BLOCKED_HIGH_RISK"
    risk_score: int
    markdown_comment: str
    cited_adrs: List[str] = []
    cited_incidents: List[str] = []
    suggested_code_changes: List[str] = []
    safe_merge_checklist: List[str] = []

class SlackCommandRequest(BaseModel):
    command: Optional[str] = "/askbrain"
    text: str
    channel_name: Optional[str] = "incident-war-room"
    user_name: Optional[str] = "sre-oncall"

class SlackCommandResponse(BaseModel):
    response_type: str = "in_channel"  # "in_channel" | "ephemeral"
    text: str
    formatted_blocks: List[Dict[str, Any]] = []
    historical_matches: int = 0
    recommended_responders: List[str] = []

