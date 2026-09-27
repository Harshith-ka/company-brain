export interface MemoryItem {
  id: string;
  title: string;
  type: string;
  project: string;
  technology: string;
  author?: string;
  date: string;
  event?: string;
  context?: string;
  decision?: string;
  action?: string;
  outcome?: string;
  lesson?: string;
  summary?: string;
  tags: string[];
  source_id?: string;
  source_type?: string;
  confidence_score: number;
  metadata?: Record<string, any>;
}

export interface EvidenceItem {
  id: string;
  title: string;
  type: string;
  technology: string;
  relevance_reason: string;
  citation_snippet: string;
  date: string;
  source_id?: string;
}

export interface CausalStep {
  step: string;
  label: string;
  description: string;
  reference_id?: string;
}

export interface ChatResponse {
  answer: string;
  intent: string;
  confidence_level: 'Known' | 'Inferred' | 'Unknown';
  confidence_percentage: number;
  persona_applied?: string;
  evidence: EvidenceItem[];
  causal_chain: CausalStep[];
  suggested_followups: string[];
  key_lessons: string[];
  historical_count: number;
}

export interface RiskFactor {
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  title: string;
  historical_incident_ref?: string;
  description: string;
  mitigation: string;
}

export interface SimulationResponse {
  proposal_title: string;
  risk_level: string;
  risk_score: number;
  approval_recommendation: string;
  summary: string;
  identified_risks: RiskFactor[];
  affected_adrs: string[];
  mandatory_safeguards: string[];
  historical_evidence: EvidenceItem[];
}

export interface SimulationRequest {
  proposal_title: string;
  proposed_change: string;
  target_project?: string;
  technology_involved?: string;
  target_workload?: string;
}

export interface LivePulseItem {
  id: string;
  timestamp: string;
  type: string;
  title: string;
  actor: string;
  tag: string;
}

export interface DecisionItem {
  id: string;
  title: string;
  date: string;
  status: string;
  category: string;
  technology: string;
  project: string;
  authors: string[];
  decision: string;
  reason: string;
  alternatives_considered: string[];
  expected_outcome: string;
  actual_outcome: string;
  lessons_learned: string;
}

export interface IncidentItem {
  id: string;
  title: string;
  date: string;
  severity: string;
  system: string;
  duration: string;
  lead_responder: string;
  participants: string[];
  symptoms: string;
  root_cause: string;
  actions_taken: string[];
  resolution: string;
  impact: string;
  lessons_learned: string;
  related_adrs: string[];
  related_incidents: string[];
}

export interface TimelineItem {
  id: string;
  date: string;
  title: string;
  category: string;
  type: string;
  summary: string;
  lesson?: string;
  related_ids: string[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'technology' | 'project' | 'person' | 'decision' | 'incident' | 'memory';
  category?: string;
  data: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  relation: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface InsightMetrics {
  total_memories: number;
  total_decisions: number;
  total_incidents: number;
  total_lessons: number;
  repeated_issues: number;
  resolved_patterns: number;
  recurring_risks: number;
  top_technologies: { name: string; count: number }[];
  recent_lessons: { id: string; title: string; lesson: string; date: string; technology: string }[];
  live_pulse_stream?: LivePulseItem[];
}

export interface IngestResponse {
  success: boolean;
  memory_id: string;
  message: string;
  extracted_memory?: MemoryItem;
}

export interface GitHubPRAuditRequest {
  repo_name?: string;
  pr_number?: number;
  pr_title: string;
  author?: string;
  diff_or_description: string;
  target_branch?: string;
}

export interface GitHubPRAuditResponse {
  pr_number: number;
  status: 'APPROVED' | 'WARNING_REVIEW_REQUIRED' | 'BLOCKED_HIGH_RISK';
  risk_score: number;
  markdown_comment: string;
  cited_adrs: string[];
  cited_incidents: string[];
  suggested_code_changes: string[];
  safe_merge_checklist: string[];
}

export interface SlackCommandRequest {
  command?: string;
  text: string;
  channel_name?: string;
  user_name?: string;
}

export interface SlackCommandResponse {
  response_type: string;
  text: string;
  formatted_blocks: Record<string, any>[];
  historical_matches: number;
  recommended_responders: string[];
}
