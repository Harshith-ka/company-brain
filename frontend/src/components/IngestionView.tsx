import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  AlertCircle, 
  ArrowRight,
  Database,
  GitPullRequest,
  AlertTriangle,
  FileCode2,
  MessageSquare,
  Cpu,
  ShieldCheck,
  Tag,
  Flame,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { MemoryItem, IngestResponse } from '../types';

interface IngestionViewProps {
  onNavigateToChat?: (query: string) => void;
}

export const IngestionView: React.FC<IngestionViewProps> = ({ onNavigateToChat }) => {
  const [activeTab, setActiveTab] = useState<'github' | 'incident' | 'adr' | 'chat'>('github');
  const [title, setTitle] = useState('feat(cache): Replace shared Redis with DynamoDB & in-process LRU');
  const [type, setType] = useState('github_issue');
  const [project, setProject] = useState('Recommendation Service');
  const [technology, setTechnology] = useState('Redis, DynamoDB, Go');
  const [author, setAuthor] = useState('Priya Sharma (Senior Infrastructure Engineer)');
  const [content, setContent] = useState(`## Pull Request: #482 (Merged to main)
### Summary & Catalyst:
Mitigates cache stampede vulnerability identified in INC-101. Replaced single-point-of-failure shared Redis cluster with local in-process Go-cache LRU backed by AWS DynamoDB for immutable long-term scores.

### Technical Problem:
Shared Redis cluster had 15ms p99 network latency and suffered cache stampedes when 50,000 keys expired concurrently during flash sales.

### Architecture Decision:
- Implemented single-flight request coalescing mutexes on cache misses.
- Added +/- 20% randomized TTL jitter to eliminate synchronized key expirations.
- Deployed AWS DynamoDB with on-demand capacity as the authoritative secondary store.

### Measurable Production Impact:
- Recommendation score read latency dropped from 18ms to 3.2ms p99.
- Redis cluster infrastructure costs reduced by $4,200/month.
- Zero cache stampede errors during subsequent marketing surges.

### Permanent Institutional Rule:
All caching layers must enforce randomized TTL jitter (+/-20%) and single-flight request coalescing. Shared in-memory caches must not be used for high-throughput read-heavy services.`);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IngestResponse | null>(null);

  const presets = {
    github: {
      type: 'github_issue',
      title: 'feat(cache): Replace shared Redis with DynamoDB & in-process LRU',
      project: 'Recommendation Service',
      tech: 'Redis, DynamoDB, Go',
      author: 'Priya Sharma (Senior Infrastructure Engineer)',
      content: `## Pull Request: #482 (Merged to main)
### Summary & Catalyst:
Mitigates cache stampede vulnerability identified in INC-101. Replaced single-point-of-failure shared Redis cluster with local in-process Go-cache LRU backed by AWS DynamoDB for immutable long-term scores.

### Technical Problem:
Shared Redis cluster had 15ms p99 network latency and suffered cache stampedes when 50,000 keys expired concurrently during flash sales.

### Architecture Decision:
- Implemented single-flight request coalescing mutexes on cache misses.
- Added +/- 20% randomized TTL jitter to eliminate synchronized key expirations.
- Deployed AWS DynamoDB with on-demand capacity as the authoritative secondary store.

### Measurable Production Impact:
- Recommendation score read latency dropped from 18ms to 3.2ms p99.
- Redis cluster infrastructure costs reduced by $4,200/month.
- Zero cache stampede errors during subsequent marketing surges.

### Permanent Institutional Rule:
All caching layers must enforce randomized TTL jitter (+/-20%) and single-flight request coalescing. Shared in-memory caches must not be used for high-throughput read-heavy services.`
    },
    incident: {
      type: 'engineering_incident',
      title: 'INC-409: PgBouncer Pool Saturation During Black Friday Kubernetes Burst',
      project: 'Core Database Layer',
      tech: 'PostgreSQL, PgBouncer, Kubernetes',
      author: 'Dave Chen & SRE On-Call',
      content: `## Incident Postmortem: INC-409 (P1 Outage)
### Trigger Event:
At 09:14 UTC, Aurora PostgreSQL CPU spiked to 100% and rejected incoming checkout connections with 'FATAL: sorry, too many clients already'.

### Root Cause Analysis:
Horizontal Pod Autoscaler (HPA) scaled checkout pods from 20 to 120 replicas. Each pod opened 15 direct Postgres connections, creating 1,800 active backend connections and exceeding the max_connections limit of 500.

### Corrective Action Taken:
- Deployed centralized PgBouncer in transaction pooling mode as mandatory ingress proxy.
- Capped max server connections to 45 with aggressive 30s idle query timeouts.
- Configured connection pool alarms at 80% saturation.

### Measured Outcome:
Database CPU normalized to 28%. System sustained 180 pod autoscaling spikes with zero connection rejection errors.

### Core Lesson & Directive:
Never allow direct application pod connections to PostgreSQL in autoscaling environments. All services must route through transaction-mode PgBouncer connection poolers.`
    },
    adr: {
      type: 'architecture_decision',
      title: 'ADR-028: Standardize Distributed Sagas on Temporal.io for Payment Workflows',
      project: 'Payment Settlement V2',
      tech: 'Temporal.io, Go, PostgreSQL',
      author: 'Marcus Vance (Principal Architect)',
      content: `## Architecture Decision Record: ADR-028
### Status: ACCEPTED
### Context:
Multi-step financial settlements across payment gateways, ledger mutations, and merchant payouts previously used custom choreography over Kafka, which suffered from silent partial failures and state drift during network timeouts.

### Decision:
Adopt Temporal.io as the standard orchestration engine for all long-running, multi-step financial workflows across NovaStack.

### Rules & Determinism Constraints:
1. Workflow definitions must remain 100% deterministic (no direct Date.now() or random generation inside workflow functions).
2. All side effects and external HTTP requests must execute exclusively within Temporal Activities with exponential retry policies.

### Expected & Measured Outcome:
Eliminated manual ledger reconciliation incidents. Automatic replay and saga compensation reduced failed transaction support tickets by 94%.`
    },
    chat: {
      type: 'meeting_note',
      title: 'War Room Slack Log: Hot Key Throttling in Kafka Partition #4',
      project: 'Order Streaming Pipeline',
      tech: 'Apache Kafka, Go',
      author: 'DevOps & Data Platform Squad',
      content: `[14:10] @alex: Alert firing: Kafka partition 4 lag is > 85,000 messages on checkout-events topic.
[14:14] @priya: Hot tenant 8820 is sending 70% of total traffic with default key hash, overloading single partition consumer.
[14:22] @alex: Applied dynamic salted partition hashing for high-volume enterprise tenant IDs (PR #903).
[14:35] @priya: Consumer lag dropped to 0 in 10 minutes. Throughput balanced across all 16 partitions evenly.
[14:40] @team-lead: Key Takeaway: Always implement salted hash keys for high-volume tenants to prevent single-partition consumer starvation in Kafka.`
    }
  };

  const handleTabChange = (tabKey: keyof typeof presets) => {
    setActiveTab(tabKey);
    const p = presets[tabKey];
    setTitle(p.title);
    setType(p.type);
    setProject(p.project);
    setTechnology(p.tech);
    setAuthor(p.author);
    setContent(p.content);
  };

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setLoading(true);
    setResult(null);
    try {
      const res = await api.ingestDocument({
        title,
        type,
        project,
        technology,
        author,
        content
      });
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-indigo-950/30 to-slate-900 border border-cyan-500/30 rounded-2xl p-6 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
              <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
              Universal Experience Ingestion & Structuring
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Hindsight Ingestion Center
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Feed raw engineering documents, GitHub PRs, incident postmortems, ADRs, or Slack war-room chats. CompanyBrain analyzes the input, structures the causal experience loop, and indexes it into Hindsight persistent memory.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-950/60 border border-cyan-500/20 px-4 py-2 rounded-xl text-xs font-mono text-cyan-300 self-start md:self-auto">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            AI Semantic Parser Active
          </div>
        </div>

        {/* Source Ingestion Tabs */}
        <div className="mt-5 pt-4 border-t border-cyan-500/10 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleTabChange('github')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'github'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <GitPullRequest className="w-4 h-4 text-cyan-400" />
            GitHub PR / Code Diff
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('incident')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'incident'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            Incident Postmortem
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('adr')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'adr'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <FileCode2 className="w-4 h-4 text-purple-400" />
            Architecture Decision (ADR)
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('chat')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'chat'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            Slack / Chat War Room
          </button>
        </div>
      </div>

      {/* Form & Extraction Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form */}
        <form onSubmit={handleIngest} className="lg:col-span-6 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4 backdrop-blur-md">
          <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            Document / Experience Source
          </h2>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400">Record Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Category</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="github_issue">GitHub Issue / PR</option>
                <option value="engineering_incident">Engineering Incident</option>
                <option value="architecture_decision">Architecture Decision (ADR)</option>
                <option value="meeting_note">Meeting / War Room Note</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Primary Technologies</label>
              <input
                type="text"
                value={technology}
                onChange={(e) => setTechnology(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Target Project / Service</label>
              <input
                type="text"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Lead Engineer / Author</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400">Raw Input (Markdown / Diff / Notes)</label>
            <textarea
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="w-full bg-slate-950/90 border border-slate-700/80 rounded-lg p-3 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-900/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Extracting Experience Causal Loop via Ollama...</span>
              </>
            ) : (
              <>
                <Database className="w-4 h-4" />
                <span>Analyze & Ingest into Hindsight</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Extraction Output Panel */}
        <div className="lg:col-span-6">
          {loading && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
              <div className="w-12 h-12 border-3 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto" />
              <div>
                <h3 className="text-base font-semibold text-slate-200">
                  Synthesizing Causal Experience Tuple
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Extracting Trigger Event, Technical Context, Decision, Action, Measurable Outcome, and Permanent Rule...
                </p>
              </div>
            </div>
          )}

          {!loading && !result && (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-10 text-center text-slate-500 space-y-3">
              <Layers className="w-10 h-10 mx-auto text-slate-600" />
              <div className="text-sm font-medium text-slate-300">
                Ready for Semantic Experience Ingestion
              </div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Select a tab above or paste raw engineering documentation to watch CompanyBrain extract structured causal wisdom and save it into Hindsight.
              </p>
            </div>
          )}

          {!loading && result?.extracted_memory && (
            <div className="bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-6 space-y-5 animate-in fade-in duration-300">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Extracted Experience Dossier
                    </h3>
                    <span className="text-[11px] font-mono text-cyan-400">
                      {result.extracted_memory.id} • Indexed in Hindsight
                    </span>
                  </div>
                </div>

                <span className="text-[10px] uppercase font-mono px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  96% Confidence
                </span>
              </div>

              {/* Causal Flow Stepper */}
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    1. Trigger Event & Catalyst
                  </div>
                  <div className="text-xs text-slate-200">
                    {result.extracted_memory.event}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    2. Technical Context & Constraints
                  </div>
                  <div className="text-xs text-slate-300">
                    {result.extracted_memory.context}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    3. Architectural Decision / Fix
                  </div>
                  <div className="text-xs text-slate-200">
                    {result.extracted_memory.decision}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    4. Measured Production Outcome
                  </div>
                  <div className="text-xs text-slate-300">
                    {result.extracted_memory.outcome}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-1">
                  <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    5. Permanent Institutional Directive
                  </div>
                  <div className="text-xs text-emerald-200 italic font-medium leading-relaxed">
                    "{result.extracted_memory.lesson}"
                  </div>
                </div>
              </div>

              {/* Tags & Metadata */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <Tag className="w-3 h-3 text-slate-500" />
                {result.extracted_memory.tags.map((tag, idx) => (
                  <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
