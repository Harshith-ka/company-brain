import React, { useState } from 'react';
import { api } from '../services/api';
import type { SimulationResponse, SimulationRequest } from '../types';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Flame, 
  CheckCircle2, 
  FileText, 
  Download, 
  Copy, 
  Sparkles, 
  Cpu, 
  ArrowRight,
  Layers
} from 'lucide-react';

export const RiskSimulatorView: React.FC = () => {
  const [formData, setFormData] = useState<SimulationRequest>({
    proposal_title: 'Replace Redis with Central Memcached for Session Cache',
    proposed_change: 'We propose migrating recommendation and session cache from current DynamoDB/Local LRU to a centralized Memcached cluster to reduce AWS read costs and standardize caching.',
    target_project: 'Recommendation Service',
    technology_involved: 'Memcached, Redis, DynamoDB',
    target_workload: 'High-throughput production (50,000 req/sec)'
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulationResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const presets = [
    {
      title: 'Remove PgBouncer & Use Direct Postgres Connection Pools',
      change: 'To reduce proxy overhead, configure our Kubernetes Go microservices to connect directly to AWS RDS Aurora Postgres with a pool size of 30 per pod.',
      tech: 'PostgreSQL, PgBouncer, Kubernetes',
      project: 'Core Database Layer'
    },
    {
      title: 'Replace Kafka with AWS SQS for Order Event Streams',
      change: 'Migrate high-volume checkout events from self-managed Kafka to AWS SQS Standard queues to reduce operational cluster maintenance.',
      tech: 'Kafka, AWS SQS, Event Streaming',
      project: 'Order Processing Pipeline'
    },
    {
      title: 'Re-introduce Central Redis Cluster for Recommendation Caching',
      change: 'Deploy an AWS ElastiCache Redis cluster to replace in-process Go-cache and share cached recommendation scores across 40 container instances.',
      tech: 'Redis, In-Memory Caching, PostgreSQL',
      project: 'Recommendation Service'
    },
    {
      title: 'Add Unbounded Async Retries for Stripe Webhook Handler',
      change: 'Configure automated retry loops on failed Stripe billing webhooks without atomic idempotency lock to guarantee payment event delivery.',
      tech: 'Stripe, Webhooks, Temporal, Redis',
      project: 'Payment Gateway'
    }
  ];

  const handleRunSimulation = async (customPayload?: SimulationRequest) => {
    const payload = customPayload || formData;
    if (!payload.proposal_title.trim() || !payload.proposed_change.trim()) return;

    setLoading(true);
    setResult(null);
    try {
      const data = await api.simulateChange(payload);
      setResult(data);
    } catch (err) {
      console.error('Simulation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportMarkdown = () => {
    if (!result) return;
    const md = `# 🛡️ Architectural Pre-Flight Risk Report
**Proposal:** ${result.proposal_title}
**Risk Level:** ${result.risk_level} (Score: ${result.risk_score}/100)
**Recommendation:** ${result.approval_recommendation}
**Generated Date:** ${new Date().toISOString()}
**Source:** NovaStack CompanyBrain (Powered by Hindsight Persistent Memory)

---

## 📋 Executive Simulation Summary
${result.summary}

---

## ⚠️ Identified Historical Risks & Failure Modes
${result.identified_risks.map(r => `### [${r.severity.toUpperCase()}] ${r.title}
- **Historical Precedent:** ${r.historical_incident_ref || 'Organizational Memory'}
- **Failure Description:** ${r.description}
- **Mandatory Mitigation:** ${r.mitigation}
`).join('\n')}

---

## 📜 Affected Architecture Decision Records (ADRs)
${result.affected_adrs.map(adr => `- ${adr}`).join('\n')}

---

## ✅ Mandatory Pre-Deployment Safeguards Checklist
${result.mandatory_safeguards.map(s => `- [ ] ${s}`).join('\n')}
`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `risk-simulation-${result.proposal_title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyMarkdown = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-400 border-red-500/40 bg-red-950/30';
    if (score >= 50) return 'text-amber-400 border-amber-500/40 bg-amber-950/30';
    return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-purple-400 font-mono text-xs uppercase tracking-wider mb-1">
              <ShieldAlert className="w-4 h-4 text-purple-400 animate-pulse" />
              Pre-Flight Blast Radius Analysis
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Architectural Risk Simulator
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Simulate proposed code and architectural changes against NovaStack's entire history of past outages, postmortems, and ADRs before pushing to production.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-950/60 border border-purple-500/20 px-4 py-2.5 rounded-xl text-xs font-mono text-purple-300 self-start md:self-auto">
            <Cpu className="w-4 h-4 text-purple-400" />
            Hindsight Causal Evaluator Active
          </div>
        </div>

        {/* Presets */}
        <div className="mt-5 pt-4 border-t border-purple-500/10">
          <div className="text-xs text-slate-400 font-medium mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Quick-Load Architectural Proposals:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  const payload = {
                    proposal_title: p.title,
                    proposed_change: p.change,
                    target_project: p.project,
                    technology_involved: p.tech,
                    target_workload: 'High-throughput production'
                  };
                  setFormData(payload);
                  handleRunSimulation(payload);
                }}
                className="text-left p-2.5 rounded-lg bg-slate-900/80 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500/40 transition-all text-xs group"
              >
                <div className="font-semibold text-slate-200 group-hover:text-purple-300 line-clamp-1">
                  {p.title}
                </div>
                <div className="text-slate-500 text-[10px] mt-0.5 font-mono truncate">
                  {p.tech}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Form & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-4 backdrop-blur-md">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              Proposed Change Specification
            </h2>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Proposal Title
              </label>
              <input
                type="text"
                value={formData.proposal_title}
                onChange={(e) => setFormData({ ...formData, proposal_title: e.target.value })}
                placeholder="e.g. Replace Kafka with SQS in checkout"
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Proposed Architecture / Implementation Details
              </label>
              <textarea
                rows={4}
                value={formData.proposed_change}
                onChange={(e) => setFormData({ ...formData, proposed_change: e.target.value })}
                placeholder="Describe what you plan to change and why..."
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Target System / Project
                </label>
                <input
                  type="text"
                  value={formData.target_project || ''}
                  onChange={(e) => setFormData({ ...formData, target_project: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Technologies Involved
                </label>
                <input
                  type="text"
                  value={formData.technology_involved || ''}
                  onChange={(e) => setFormData({ ...formData, technology_involved: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <button
              onClick={() => handleRunSimulation()}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Reasoning over Institutional Memory...
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  Run Pre-Flight Risk Simulation
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results View */}
        <div className="lg:col-span-7">
          {loading && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-12 text-center space-y-4">
              <div className="w-12 h-12 border-3 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto" />
              <div>
                <h3 className="text-base font-semibold text-slate-200">
                  Cross-Checking Hindsight Knowledge Base
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Evaluating proposed change against 56 historical ADRs, incident postmortems, and past production outages...
                </p>
              </div>
            </div>
          )}

          {!loading && !result && (
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-10 text-center text-slate-500 space-y-3">
              <ShieldCheck className="w-12 h-12 mx-auto text-slate-600" />
              <div className="text-sm font-medium text-slate-300">
                Ready for Pre-Flight Evaluation
              </div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Choose a quick preset above or input your own architectural proposal to evaluate risk scores, identify historical conflicts, and generate safeguards.
              </p>
            </div>
          )}

          {!loading && result && (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* Score & Decision Header */}
              <div className={`p-5 rounded-xl border ${getScoreColor(result.risk_score)} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
                <div className="flex items-center gap-4">
                  <div className="text-center px-4 py-2 rounded-lg bg-black/40 border border-current">
                    <div className="text-3xl font-black">{result.risk_score}</div>
                    <div className="text-[10px] uppercase tracking-wider font-mono opacity-80">Risk Score</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-white">{result.risk_level}</span>
                    </div>
                    <div className="text-xs font-mono mt-0.5 opacity-90">{result.approval_recommendation}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyMarkdown}
                    className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
                    title="Copy Summary"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={handleExportMarkdown}
                    className="p-2 rounded-lg bg-purple-900/50 hover:bg-purple-800/60 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export Report (.md)
                  </button>
                </div>
              </div>

              {/* Identified Historical Risks */}
              {result.identified_risks.length > 0 && (
                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-3">
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Flame className="w-4 h-4 text-red-400" />
                    Identified Historical Failure Modes ({result.identified_risks.length})
                  </h3>
                  <div className="space-y-2.5">
                    {result.identified_risks.map((rf, idx) => (
                      <div key={idx} className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                            <AlertTriangle className={`w-3.5 h-3.5 ${rf.severity === 'Critical' ? 'text-red-400' : 'text-amber-400'}`} />
                            {rf.title}
                          </span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase ${
                            rf.severity === 'Critical' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}>
                            {rf.severity}
                          </span>
                        </div>
                        {rf.historical_incident_ref && (
                          <div className="text-[11px] font-mono text-purple-300/90">
                            🔗 Reference: {rf.historical_incident_ref}
                          </div>
                        )}
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {rf.description}
                        </p>
                        <div className="text-xs text-emerald-400/90 bg-emerald-950/30 border border-emerald-500/20 p-2 rounded mt-1.5">
                          <span className="font-semibold">Required Mitigation:</span> {rf.mitigation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mandatory Safeguards */}
              {result.mandatory_safeguards.length > 0 && (
                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-3">
                  <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Mandatory Pre-Deployment Safeguards Checklist
                  </h3>
                  <div className="space-y-2">
                    {result.mandatory_safeguards.map((s, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                        <div className="w-4 h-4 rounded border border-purple-400/60 bg-purple-950/40 flex items-center justify-center shrink-0 mt-0.5 text-[10px] text-purple-300 font-bold">
                          {idx + 1}
                        </div>
                        <span className="leading-snug">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Affected ADRs */}
              {result.affected_adrs.length > 0 && (
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    Referenced Architecture Decision Records (ADRs)
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.affected_adrs.map((adr, idx) => (
                      <span key={idx} className="text-xs font-mono bg-indigo-950/50 border border-indigo-500/30 text-indigo-300 px-2.5 py-1 rounded-md">
                        {adr}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
