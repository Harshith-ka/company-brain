import React, { useState } from 'react';
import { api } from '../services/api';
import type { GitHubPRAuditResponse, GitHubPRAuditRequest } from '../types';
import { 
  GitPullRequest, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Download, 
  Sparkles, 
  Cpu, 
  GitCommit,
  GitBranch,
  Terminal,
  FileCode,
  ArrowRight
} from 'lucide-react';

export const GitHubGuardView: React.FC = () => {
  const presets = [
    {
      label: 'Direct Postgres Connection in Worker (Risky)',
      repo: 'novastack/checkout-worker',
      pr: 492,
      title: 'feat: Configure 50 direct Postgres connections per worker container',
      author: 'alex-backend',
      diff: `diff --git a/config/database.go b/config/database.go
--- a/config/database.go
+++ b/config/database.go
@@ -14,6 +14,8 @@ func NewDBPool() *pgxpool.Pool {
-    dbURL := os.Getenv("PGBOUNCER_URL")
+    // Direct connection to Aurora Postgres cluster to bypass proxy latency
+    dbURL := "postgres://user:pass@aurora-primary.internal:5432/main_db"
     config, _ := pgxpool.ParseConfig(dbURL)
+    config.MaxConns = 50
+    config.MinConns = 10
     return pgxpool.ConnectConfig(context.Background(), config)
 }`
    },
    {
      label: 'Shared Redis for Recommendation Service (Risky)',
      repo: 'novastack/recommendation-svc',
      pr: 501,
      title: 'refactor: Add central Redis cluster caching for user scores',
      author: 'dev-priya',
      diff: `diff --git a/cache/redis.go b/cache/redis.go
--- a/cache/redis.go
+++ b/cache/redis.go
@@ -25,5 +25,7 @@ func SetUserScore(ctx context.Context, userID string, score float64) error {
-    // Local in-process LRU cache
-    return localCache.Set(userID, score, 5*time.Minute)
+    // Centralized Redis cluster across all 40 pods without jitter
+    return redisClient.Set(ctx, "rec:"+userID, score, 3600*time.Second).Err()
 }`
    },
    {
      label: 'Stripe Webhook Async Retry (Risky)',
      repo: 'novastack/payment-gateway',
      pr: 512,
      title: 'fix: Add retry loop on failed Stripe webhook callbacks',
      author: 'marcus-pay',
      diff: `diff --git a/handlers/stripe.go b/handlers/stripe.go
--- a/handlers/stripe.go
+++ b/handlers/stripe.go
@@ -40,6 +40,9 @@ func HandleStripeEvent(w http.ResponseWriter, r *http.Request) {
+    // Process payment mutation asynchronously with automatic retry
+    go func() {
+        for i := 0; i < 3; i++ {
+            if err := ledger.CreditAccount(event.AccountID, event.Amount); err == nil { break }
+        }
+    }()
 }`
    },
    {
      label: 'Temporal Saga with Idempotency (Safe / Approved)',
      repo: 'novastack/settlement-v2',
      pr: 520,
      title: 'feat: Standardize settlement workflow with Temporal deterministic activities',
      author: 'dave-chen',
      diff: `diff --git a/workflows/settlement.go b/workflows/settlement.go
--- a/workflows/settlement.go
+++ b/workflows/settlement.go
@@ -12,6 +12,12 @@ func SettlementWorkflow(ctx workflow.Context, req SettlementRequest) error {
+    ao := workflow.ActivityOptions{
+        StartToCloseTimeout: 30 * time.Second,
+        RetryPolicy: &temporal.RetryPolicy{
+            InitialInterval: time.Second,
+            BackoffCoefficient: 2.0,
+            MaximumAttempts: 5,
+        },
+    }
+    ctx = workflow.WithActivityOptions(ctx, ao)
+    return workflow.ExecuteActivity(ctx, ProcessPayoutActivity, req).Get(ctx, nil)
 }`
    }
  ];

  const [formData, setFormData] = useState<GitHubPRAuditRequest>({
    repo_name: presets[0].repo,
    pr_number: presets[0].pr,
    pr_title: presets[0].title,
    author: presets[0].author,
    diff_or_description: presets[0].diff,
    target_branch: 'main'
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GitHubPRAuditResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const handleAudit = async (customPayload?: GitHubPRAuditRequest) => {
    const payload = customPayload || formData;
    setLoading(true);
    setResult(null);
    try {
      const data = await api.auditGitHubPR(payload);
      setResult(data);
    } catch (err) {
      console.error('GitHub PR audit failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyComment = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.markdown_comment);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs uppercase tracking-wider mb-1">
              <GitPullRequest className="w-4 h-4 text-indigo-400 animate-pulse" />
              Shift-Left Memory & CI Guard
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              GitHub PR Guard & Architectural CI Bot
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Simulate GitHub Pull Request reviews before merging. CompanyBrain Guard automatically audits incoming code diffs against 56 historical ADRs and outage postmortems, blocking regressions directly in CI.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-950/60 border border-indigo-500/20 px-4 py-2 rounded-xl text-xs font-mono text-indigo-300 self-start md:self-auto">
            <Cpu className="w-4 h-4 text-indigo-400" />
            GitHub Action Integration Active
          </div>
        </div>

        {/* Quick PR Presets */}
        <div className="mt-5 pt-4 border-t border-indigo-500/10">
          <div className="text-xs text-slate-400 font-medium mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Simulate Pull Request Templates:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  const payload = {
                    repo_name: p.repo,
                    pr_number: p.pr,
                    pr_title: p.title,
                    author: p.author,
                    diff_or_description: p.diff,
                    target_branch: 'main'
                  };
                  setFormData(payload);
                  handleAudit(payload);
                }}
                className="text-left p-2.5 rounded-lg bg-slate-900/80 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/40 transition-all text-xs group"
              >
                <div className="font-semibold text-slate-200 group-hover:text-indigo-300 line-clamp-1">
                  {p.label}
                </div>
                <div className="text-slate-500 text-[10px] mt-0.5 font-mono truncate">
                  PR #{p.pr} • {p.repo}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PR Input & Audit Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Diff Box */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4 backdrop-blur-md">
            <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <FileCode className="w-4 h-4 text-indigo-400" />
              Incoming Pull Request Metadata
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Repository</label>
                <input
                  type="text"
                  value={formData.repo_name}
                  onChange={(e) => setFormData({ ...formData, repo_name: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">PR Number</label>
                <input
                  type="number"
                  value={formData.pr_number}
                  onChange={(e) => setFormData({ ...formData, pr_number: parseInt(e.target.value) || 1 })}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">PR Title</label>
              <input
                type="text"
                value={formData.pr_title}
                onChange={(e) => setFormData({ ...formData, pr_title: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Code Diff / Patch</label>
              <textarea
                rows={9}
                value={formData.diff_or_description}
                onChange={(e) => setFormData({ ...formData, diff_or_description: e.target.value })}
                className="w-full bg-slate-950/90 border border-slate-700/80 rounded-lg p-3 text-[11px] text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <button
              onClick={() => handleAudit()}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-indigo-900/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Auditing PR against Hindsight Memory...</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  <span>Run GitHub CI Architectural Audit</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* GitHub PR UI Output Preview */}
        <div className="lg:col-span-7">
          {loading && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
              <div className="w-12 h-12 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto" />
              <div>
                <h3 className="text-base font-semibold text-slate-200">
                  Executing Shift-Left Architectural Gate
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Cross-referencing code diff against historical postmortems, ADR constraints, and concurrency invariants...
                </p>
              </div>
            </div>
          )}

          {!loading && !result && (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-10 text-center text-slate-500 space-y-3">
              <GitPullRequest className="w-10 h-10 mx-auto text-slate-600" />
              <div className="text-sm font-medium text-slate-300">
                Simulate a Pull Request Audit
              </div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Pick one of the preset pull requests above to see how CompanyBrain Guard detects risky changes, cites historical outages, and posts automated PR comments.
              </p>
            </div>
          )}

          {!loading && result && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* GitHub Header Mockup */}
              <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                      result.status === 'APPROVED' 
                        ? 'bg-[#238636] text-white' 
                        : result.status === 'BLOCKED_HIGH_RISK'
                        ? 'bg-[#da3633] text-white'
                        : 'bg-[#9e6a03] text-white'
                    }`}>
                      <GitPullRequest className="w-3.5 h-3.5" />
                      {result.status === 'APPROVED' ? 'Open (Checks Passed)' : result.status === 'BLOCKED_HIGH_RISK' ? 'Blocked (High Risk)' : 'Changes Requested'}
                    </span>
                    <span className="text-xs text-slate-300 font-mono">
                      {formData.repo_name}#{result.pr_number}
                    </span>
                  </div>

                  <button
                    onClick={handleCopyComment}
                    className="px-2.5 py-1 rounded-lg bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-xs text-slate-200 flex items-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copied ? 'Copied PR Comment!' : 'Copy Comment'}
                  </button>
                </div>

                <div className="text-sm font-semibold text-slate-200">
                  {formData.pr_title}
                </div>
              </div>

              {/* GitHub Bot Comment Card */}
              <div className="bg-[#0d1117] border border-[#30363d] rounded-xl overflow-hidden shadow-xl">
                <div className="bg-[#161b22] px-4 py-2.5 border-b border-[#30363d] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
                      CB
                    </div>
                    <span className="text-xs font-bold text-slate-200">companybrain-guard</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#30363d] text-slate-400 font-mono">bot</span>
                    <span className="text-xs text-slate-400">• commented just now</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    result.risk_score >= 80 ? 'bg-red-950 text-red-400 border border-red-800' :
                    result.risk_score >= 50 ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  }`}>
                    Risk: {result.risk_score}/100
                  </span>
                </div>

                <div className="p-5 text-xs text-slate-300 leading-relaxed space-y-4 font-sans whitespace-pre-line">
                  {result.markdown_comment}
                </div>
              </div>

              {/* Citations Badges */}
              {(result.cited_adrs.length > 0 || result.cited_incidents.length > 0) && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-wrap gap-2 items-center text-xs">
                  <span className="text-slate-400 font-semibold">Historical Citations:</span>
                  {result.cited_adrs.map((adr, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono text-[11px]">
                      📜 {adr}
                    </span>
                  ))}
                  {result.cited_incidents.map((inc, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-mono text-[11px]">
                      🚨 {inc}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
