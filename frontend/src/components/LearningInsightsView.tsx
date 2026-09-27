import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  ShieldAlert, 
  TrendingUp, 
  CheckCircle2, 
  Layers, 
  Cpu, 
  Zap, 
  Flame 
} from 'lucide-react';
import { api } from '../services/api';
import { InsightMetrics } from '../types';

export const LearningInsightsView: React.FC = () => {
  const [insights, setInsights] = useState<InsightMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getInsights()
      .then(data => setInsights(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const recurringRisks = [
    {
      title: "Un-jittered Cache Expirations & Thundering Herds",
      occurrences: "INC-101, GH-102",
      preventativeRule: "All caching layers must mandate ±20% randomized TTL jitter and single-flight mutex coalescing.",
      severity: "High Risk"
    },
    {
      title: "Unbounded Elastic Pod Connections to PostgreSQL",
      occurrences: "INC-102, ADR-010",
      preventativeRule: "Microservices must connect exclusively through centralized connection poolers (PgBouncer) capped at 150 backend connections.",
      severity: "Critical Risk"
    },
    {
      title: "Third-Party Authentication Quota Vulnerability",
      occurrences: "INC-103, INC-114",
      preventativeRule: "Self-hosted OAuth2/JWT with dual-key JWKS rotation grace periods to avoid session blackouts.",
      severity: "High Risk"
    },
    {
      title: "RPC Calls Without Deadlines / Timeouts",
      occurrences: "INC-113, ADR-008",
      preventativeRule: "Mandatory 2000ms deadline on all outbound gRPC stubs with circuit breaker fallback.",
      severity: "Medium Risk"
    }
  ];

  const resolvedStandards = [
    {
      domain: "Caching Architecture",
      standard: "Multi-Tier Caching Policy v2 (ADR-020): Local L1 LRU + L2 DynamoDB/Redis with event invalidation.",
      established: "March 2025"
    },
    {
      domain: "Database Reliability",
      standard: "Transaction Connection Pooling (ADR-010) + Row-Level Security (RLS) Multi-Tenancy (ADR-013).",
      established: "June 2024"
    },
    {
      domain: "Asynchronous Pipelines",
      standard: "Kafka Static Group Membership (ADR-004) + Dead Letter Queues with Exponential Jitter (ADR-019).",
      established: "February 2025"
    },
    {
      domain: "Long-Running Workflows",
      standard: "Deterministic Temporal.io stateful orchestration replacing custom cron saga loops (ADR-012).",
      established: "August 2024"
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
          <Lightbulb className="h-6 w-6 text-emerald-400" />
          <span>Organizational Learning & Synthesis Dashboard</span>
        </h1>
        <p className="text-xs text-slate-400">
          Tracking institutional memory evolution, recurring engineering risks, and codified architectural standards.
        </p>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-rose-500/20 bg-rose-950/10 space-y-1">
          <div className="flex items-center justify-between text-xs text-rose-400 font-semibold">
            <span>Monitored Risk Patterns</span>
            <Flame className="h-4 w-4" />
          </div>
          <div className="text-3xl font-extrabold text-white">{insights?.recurring_risks || 4}</div>
          <p className="text-[11px] text-slate-400">Identified from multi-incident postmortems</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-sky-500/20 bg-sky-950/10 space-y-1">
          <div className="flex items-center justify-between text-xs text-sky-400 font-semibold">
            <span>Codified Standards</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="text-3xl font-extrabold text-white">{insights?.resolved_patterns || 13}</div>
          <p className="text-[11px] text-slate-400">Standardized across all 18 backend services</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 bg-emerald-950/10 space-y-1">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
            <span>Synthesized Lessons</span>
            <Lightbulb className="h-4 w-4" />
          </div>
          <div className="text-3xl font-extrabold text-white">{insights?.total_lessons || 35}</div>
          <p className="text-[11px] text-slate-400">Preserved in Hindsight memory</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-purple-500/20 bg-purple-950/10 space-y-1">
          <div className="flex items-center justify-between text-xs text-purple-400 font-semibold">
            <span>Total Memories</span>
            <Cpu className="h-4 w-4" />
          </div>
          <div className="text-3xl font-extrabold text-white">{insights?.total_memories || 55}</div>
          <p className="text-[11px] text-slate-400">Active experience records</p>
        </div>
      </div>

      {/* Grid: Recurring Risks + Resolved Standards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recurring Risk Mitigation */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm uppercase tracking-wider">
            <ShieldAlert className="h-4 w-4" />
            <span>High-Priority Recurring Engineering Risks</span>
          </div>

          <div className="space-y-3">
            {recurringRisks.map((risk, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">{risk.title}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800/40">
                    {risk.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-rose-400">Safeguard: </strong>
                  {risk.preventativeRule}
                </p>
                <div className="text-[10px] text-slate-500 font-mono">
                  Evidence: {risk.occurrences}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resolved Standards */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center space-x-2 text-sky-400 font-bold text-sm uppercase tracking-wider">
            <CheckCircle2 className="h-4 w-4" />
            <span>Permanent Architectural Resolutions</span>
          </div>

          <div className="space-y-3">
            {resolvedStandards.map((std, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-sky-300">{std.domain}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{std.established}</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {std.standard}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Technologies Distribution */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Technology Memory Intensity (NovaStack Tech Stack)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {insights?.top_technologies.map((t, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-white/5 text-center space-y-1">
              <div className="text-xs font-bold text-white">{t.name}</div>
              <div className="text-xl font-extrabold text-cyan-400">{t.count}</div>
              <div className="text-[10px] text-slate-500">Associated Records</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
