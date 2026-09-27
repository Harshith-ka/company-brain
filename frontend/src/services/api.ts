import type { 
  ChatResponse, 
  MemoryItem, 
  DecisionItem, 
  IncidentItem, 
  TimelineItem, 
  GraphData, 
  InsightMetrics, 
  IngestResponse,
  SimulationRequest,
  SimulationResponse,
  GitHubPRAuditRequest,
  GitHubPRAuditResponse,
  SlackCommandRequest,
  SlackCommandResponse
} from '../types';

const API_BASE = '/api';

export const api = {
  // Chat
  async sendChat(query: string, projectContext?: string, demoStage?: number, persona?: string): Promise<ChatResponse> {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, project_context: projectContext, demo_stage: demoStage, persona }),
    });
    if (!res.ok) throw new Error(`Chat API error: ${res.statusText}`);
    return res.json();
  },

  // Pre-Flight Architectural Risk Simulator
  async simulateChange(payload: SimulationRequest): Promise<SimulationResponse> {
    const res = await fetch(`${API_BASE}/simulate-change`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Simulator API error: ${res.statusText}`);
    return res.json();
  },

  // GitHub PR Guard Integration
  async auditGitHubPR(payload: GitHubPRAuditRequest): Promise<GitHubPRAuditResponse> {
    const res = await fetch(`${API_BASE}/integrations/github/audit-pr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`GitHub Audit API error: ${res.statusText}`);
    return res.json();
  },

  // Slack War-Room Bot Integration
  async sendSlackCommand(payload: SlackCommandRequest): Promise<SlackCommandResponse> {
    const res = await fetch(`${API_BASE}/integrations/slack/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Slack API error: ${res.statusText}`);
    return res.json();
  },

  // Memories
  async getMemories(query?: string, technology?: string, project?: string, type?: string): Promise<MemoryItem[]> {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (technology) params.append('technology', technology);
    if (project) params.append('project', project);
    if (type) params.append('type', type);
    
    const res = await fetch(`${API_BASE}/memories?${params.toString()}`);
    if (!res.ok) throw new Error(`Memories API error: ${res.statusText}`);
    return res.json();
  },

  async getMemoryById(id: string): Promise<MemoryItem> {
    const res = await fetch(`${API_BASE}/memories/${id}`);
    if (!res.ok) throw new Error(`Memory API error: ${res.statusText}`);
    return res.json();
  },

  // Decisions (ADRs)
  async getDecisions(technology?: string, status?: string): Promise<DecisionItem[]> {
    const params = new URLSearchParams();
    if (technology) params.append('technology', technology);
    if (status) params.append('status', status);
    
    const res = await fetch(`${API_BASE}/decisions?${params.toString()}`);
    if (!res.ok) throw new Error(`Decisions API error: ${res.statusText}`);
    return res.json();
  },

  async getDecisionById(id: string): Promise<DecisionItem> {
    const res = await fetch(`${API_BASE}/decisions/${id}`);
    if (!res.ok) throw new Error(`Decision API error: ${res.statusText}`);
    return res.json();
  },

  // Incidents
  async getIncidents(severity?: string, system?: string): Promise<IncidentItem[]> {
    const params = new URLSearchParams();
    if (severity) params.append('severity', severity);
    if (system) params.append('system', system);
    
    const res = await fetch(`${API_BASE}/incidents?${params.toString()}`);
    if (!res.ok) throw new Error(`Incidents API error: ${res.statusText}`);
    return res.json();
  },

  async getIncidentById(id: string): Promise<IncidentItem> {
    const res = await fetch(`${API_BASE}/incidents/${id}`);
    if (!res.ok) throw new Error(`Incident API error: ${res.statusText}`);
    return res.json();
  },

  // Timeline
  async getTimeline(): Promise<TimelineItem[]> {
    const res = await fetch(`${API_BASE}/timeline`);
    if (!res.ok) throw new Error(`Timeline API error: ${res.statusText}`);
    return res.json();
  },

  // Graph
  async getGraph(): Promise<GraphData> {
    const res = await fetch(`${API_BASE}/graph`);
    if (!res.ok) throw new Error(`Graph API error: ${res.statusText}`);
    return res.json();
  },

  // Insights
  async getInsights(): Promise<InsightMetrics> {
    const res = await fetch(`${API_BASE}/insights`);
    if (!res.ok) throw new Error(`Insights API error: ${res.statusText}`);
    return res.json();
  },

  // Ingestion
  async ingestDocument(payload: {
    title: string;
    type: string;
    content: string;
    project?: string;
    technology?: string;
    author?: string;
    date?: string;
  }): Promise<IngestResponse> {
    const res = await fetch(`${API_BASE}/memory/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Ingestion API error: ${res.statusText}`);
    return res.json();
  },

  // Demo Controls
  async setDemoStage(stage: number): Promise<{ stage: number; description: string; active_memory_count: number }> {
    const res = await fetch(`${API_BASE}/demo/set-stage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage }),
    });
    if (!res.ok) throw new Error(`Demo API error: ${res.statusText}`);
    return res.json();
  },

  async resetDemo(): Promise<any> {
    const res = await fetch(`${API_BASE}/demo/reset`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error(`Reset API error: ${res.statusText}`);
    return res.json();
  },

  async getDemoStatus(): Promise<{ current_stage: number; total_available_memories: number; active_memories: number }> {
    const res = await fetch(`${API_BASE}/demo/status`);
    if (!res.ok) throw new Error(`Demo status error: ${res.statusText}`);
    return res.json();
  }
};
