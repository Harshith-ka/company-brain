import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  ShieldCheck, 
  HelpCircle, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  FileText, 
  Lightbulb, 
  History, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Cpu,
  RefreshCw,
  Download,
  Copy,
  UserCheck
} from 'lucide-react';
import { api } from '../services/api';
import { ChatResponse, EvidenceItem } from '../types';

interface ChatViewProps {
  initialQuery?: string;
  onNavigateToEvidence?: (sourceType: string, sourceId: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({ initialQuery, onNavigateToEvidence }) => {
  const [query, setQuery] = useState(initialQuery || '');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [expandedEvidence, setExpandedEvidence] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>('All Projects');
  const [persona, setPersona] = useState<string>('architect');
  const [copied, setCopied] = useState(false);

  const presetQueries = [
    "Why did we stop using Redis?",
    "Should we use Redis for Project Nova?",
    "What has the company learned about caching?",
    "Have we experienced database latency during high traffic?",
    "Why did we migrate away from Firebase Auth?",
    "How was the gRPC client thread starvation incident resolved?"
  ];

  const handleSend = async (qText?: string, customPersona?: string) => {
    const textToSend = qText || query;
    if (!textToSend.trim()) return;

    const activePersona = customPersona || persona;
    setLoading(true);
    setQuery(textToSend);
    try {
      const projContext = selectedProject === 'All Projects' ? undefined : selectedProject;
      const res = await api.sendChat(textToSend, projContext, undefined, activePersona);
      setResponse(res);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportMarkdown = () => {
    if (!response) return;
    const md = `# 🧠 CompanyBrain Organizational Intelligence Report
**Query:** ${query}
**Persona Lens:** ${response.persona_applied || 'Principal Architect'}
**Intent:** ${response.intent}
**Confidence:** ${response.confidence_level} (${response.confidence_percentage}%)
**Generated:** ${new Date().toISOString()}

---

## 📋 Organizational Synthesis
${response.answer}

---

${response.key_lessons.length > 0 ? `## 💡 Key Synthesized Lessons
${response.key_lessons.map(l => `- ${l}`).join('\n')}

---
` : ''}

${response.causal_chain.length > 0 ? `## ⛓️ Causal Reconstruction Trace ("Why?" Engine)
${response.causal_chain.map(c => `- **${c.step} (${c.label})**: ${c.description} [${c.reference_id || ''}]`).join('\n')}

---
` : ''}

## 🔍 Institutional Citations & Evidence
${response.evidence.map(e => `### [${e.source_id || e.id}] ${e.title} (${e.date})
- **Technology:** ${e.technology}
- **Relevance:** ${e.relevance_reason}
- **Excerpt:**
> ${e.citation_snippet}
`).join('\n')}
`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `companybrain-report-${query.slice(0, 30).toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyMarkdown = () => {
    if (!response) return;
    navigator.clipboard.writeText(response.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (initialQuery) {
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  const getConfidenceBadge = (level: string, percentage: number) => {
    switch (level) {
      case 'Known':
        return (
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Known Fact ({percentage}%)</span>
          </div>
        );
      case 'Inferred':
        return (
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            <span>Inferred Synthesis ({percentage}%)</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-400 text-xs font-semibold">
            <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
            <span>Insufficient Memory ({percentage}%)</span>
          </div>
        );
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Top Header & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
              <Cpu className="h-6 w-6 text-cyan-400" />
              <span>Ask CompanyBrain</span>
            </h1>
            <p className="text-xs text-slate-400">
              Query organizational memory, trace decisions backward, and apply historical lessons to new situations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-1.5">
              <UserCheck className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-xs text-slate-400 font-medium">Memory Lens:</span>
              <select
                value={persona}
                onChange={(e) => {
                  setPersona(e.target.value);
                  if (query) handleSend(query, e.target.value);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-purple-300 border border-purple-500/30 text-xs focus:outline-none focus:border-purple-400"
              >
                <option value="architect">🏛️ Principal Architect</option>
                <option value="sre">⚡ Staff SRE / DevOps Lead</option>
                <option value="security">🔒 Security & Governance</option>
                <option value="new_hire">🌱 New Hire Onboarding</option>
              </select>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="text-xs text-slate-400 font-medium">Context Scope:</span>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-slate-200 border border-white/10 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="All Projects">All NovaStack Projects</option>
                <option value="Recommendation Service">Recommendation Service</option>
                <option value="Project Nova">Project Nova (Settlement V2)</option>
                <option value="Core Platform">Core Platform</option>
                <option value="Auth Service">Auth Service</option>
              </select>
            </div>
          </div>
        </div>

        {/* Input Bar */}
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about NovaStack architecture, decisions, outages, or lessons..."
            className="w-full pl-5 pr-28 py-4 rounded-2xl glass-input text-sm text-white placeholder-slate-400 shadow-xl focus:ring-2 focus:ring-cyan-500/30"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !query.trim()}
            className="absolute right-3 top-2.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center space-x-2 shadow-md shadow-cyan-500/20"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>Reason</span>
                <Send className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>

        {/* Preset Queries Pill List */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-medium text-slate-400 flex items-center space-x-1">
            <Sparkles className="h-3 w-3 text-cyan-400" />
            <span>Try asking:</span>
          </span>
          {presetQueries.map((pq, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(pq)}
              className="text-xs px-3 py-1 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-white/5 hover:border-cyan-500/30 transition-colors"
            >
              {pq}
            </button>
          ))}
        </div>
      </div>

      {/* Response Panel */}
      {loading && (
        <div className="glass-panel p-10 rounded-2xl border border-cyan-500/30 text-center space-y-4 animate-pulse">
          <div className="h-10 w-10 mx-auto rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
            <RefreshCw className="h-5 w-5 animate-spin" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Recalling Hindsight Memory...</h3>
            <p className="text-xs text-slate-400 mt-1">
              Matching causal sequences, architecture decision records, and incident postmortems with {persona} lens.
            </p>
          </div>
        </div>
      )}

      {response && !loading && (
        <div className="space-y-6">
          {/* Main Answer Card */}
          <div className="glass-panel p-6 lg:p-8 rounded-2xl border border-white/10 space-y-6 shadow-xl">
            {/* Header: Intent, Lens & Confidence Badge + Export Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-1 rounded-md bg-slate-900 border border-white/10 text-cyan-400">
                  Intent: {response.intent.replace('_', ' ').toUpperCase()}
                </span>
                {response.persona_applied && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-purple-950/80 border border-purple-500/30 text-purple-300">
                    Lens: {response.persona_applied}
                  </span>
                )}
                <span className="text-xs text-slate-400">
                  {response.historical_count} relevant memories
                </span>
              </div>

              <div className="flex items-center gap-2">
                {getConfidenceBadge(response.confidence_level, response.confidence_percentage)}
                <button
                  onClick={handleCopyMarkdown}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 text-xs flex items-center gap-1 transition-colors"
                  title="Copy response"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleExportMarkdown}
                  className="p-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Export full executive report"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export Report</span>
                </button>
              </div>
            </div>

            {/* Answer Content */}
            <div className="text-sm text-slate-200 leading-relaxed space-y-4 whitespace-pre-line font-sans">
              {response.answer}
            </div>

            {/* Key Lessons Pill */}
            {response.key_lessons.length > 0 && (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-2">
                <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <Lightbulb className="h-4 w-4" />
                  <span>Synthesized Key Lesson</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                  {response.key_lessons.map((lesson, idx) => (
                    <li key={idx} className="leading-relaxed italic">
                      {lesson}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggested Followups */}
            {response.suggested_followups.length > 0 && (
              <div className="pt-2 border-t border-white/5 space-y-2">
                <span className="text-xs font-medium text-slate-400">Suggested Follow-Up Queries:</span>
                <div className="flex flex-wrap gap-2">
                  {response.suggested_followups.map((sf, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(sf)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/40 hover:border-cyan-500/60 transition-colors flex items-center space-x-1.5"
                    >
                      <span>{sf}</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Causal Backward Trace ("Why?" Engine Stepper) */}
          {response.causal_chain.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl border border-purple-500/20 bg-gradient-to-b from-purple-950/10 to-slate-900/60 space-y-4">
              <div className="flex items-center space-x-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
                <Layers className="h-4 w-4" />
                <span>"Why?" Engine — Causal Reconstruction Trace</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
                {response.causal_chain.map((step, idx) => (
                  <div 
                    key={idx} 
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-2"
                  >
                    <div>
                      <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                        {step.step}
                      </div>
                      <div className="text-xs font-bold text-white mt-0.5">
                        {step.label}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      {step.description}
                    </p>
                    {step.reference_id && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-purple-300 w-fit">
                        {step.reference_id}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Supporting Evidence Drawer */}
          {response.evidence.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                  <FileText className="h-4 w-4" />
                  <span>Institutional Memory Citations ({response.evidence.length})</span>
                </div>
                <span className="text-[11px] text-slate-400">Directly referenced records</span>
              </div>

              <div className="space-y-2">
                {response.evidence.map((ev, idx) => {
                  const isExpanded = expandedEvidence === ev.id;
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-900/70 border border-white/5 hover:border-cyan-500/30 transition-colors"
                    >
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setExpandedEvidence(isExpanded ? null : ev.id)}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40">
                            {ev.source_id || ev.id}
                          </span>
                          <span className="text-xs font-semibold text-slate-200">
                            {ev.title}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-slate-400">
                          <span className="text-[11px]">{ev.date}</span>
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-white/5 space-y-2 text-xs text-slate-300">
                          <p className="leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-white/5 font-mono text-[11px]">
                            {ev.citation_snippet}
                          </p>
                          <div className="text-[11px] text-cyan-400 italic">
                            Relevance: {ev.relevance_reason}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
