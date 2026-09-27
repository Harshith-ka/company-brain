import React, { useState, useEffect } from 'react';
import { 
  Database, 
  FileCode2, 
  AlertTriangle, 
  Lightbulb, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  TrendingUp, 
  Layers, 
  Search,
  Sparkles,
  ShieldAlert,
  Radio,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { InsightMetrics, LivePulseItem } from '../types';

interface DashboardViewProps {
  onNavigate: (view: string, initialQuery?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const [insights, setInsights] = useState<InsightMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getInsights()
      .then(data => setInsights(data))
      .catch(err => console.error('Failed to load insights:', err))
      .finally(() => setLoading(false));
  }, []);

  const quickPrompts = [
    {
      title: 'Why did we stop using Redis?',
      desc: 'Trace the root cause of INC-101 and the ADR-006 architectural pivot.',
      category: 'Causal Reason',
      color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-300'
    },
    {
      title: 'Should we use Redis for Project Nova?',
      desc: 'Evaluate high-throughput payment routing against past caching lessons.',
      category: 'Advisory',
      color: 'from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-300'
    },
    {
      title: 'What has the company learned about caching?',
      desc: 'Synthesize 2 years of incident postmortems and ADR standards.',
      category: 'Learning Synthesis',
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300'
    },
    {
      title: 'Have we experienced database latency during high traffic?',
      desc: 'Match historical connection saturation & cache stampede incidents.',
      category: 'Incident Match',
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-300'
    }
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-white/10 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Agents That Learn Using Hindsight</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
            Organizational Memory & Institutional Experience
          </h1>
          <p className="text-slate-300 text-sm lg:text-base leading-relaxed">
            CompanyBrain connects <strong className="text-white">Decisions $\to$ Incidents $\to$ Outcomes $\to$ Lessons</strong>. Instead of static document search, ask what NovaStack has actually experienced and learned.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => onNavigate('chat')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 transition-all duration-200 flex items-center space-x-2"
            >
              <span>Ask CompanyBrain</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onNavigate('simulator')}
              className="px-5 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-200 font-semibold text-sm transition-all duration-200 flex items-center space-x-2"
            >
              <ShieldAlert className="h-4 w-4 text-purple-400" />
              <span>Pre-Flight Risk Simulator</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Institutional Activity Pulse Ticker */}
      {insights?.live_pulse_stream && insights.live_pulse_stream.length > 0 && (
        <div className="bg-slate-900/90 border border-purple-500/30 rounded-xl p-3.5 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3 mb-2.5 px-1">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-purple-400" />
                Live Institutional Knowledge Pulse
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Continuous Memory Stream</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {insights.live_pulse_stream.map((pulse: LivePulseItem) => (
              <div 
                key={pulse.id}
                className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-lg text-xs flex flex-col justify-between space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono uppercase ${
                    pulse.tag === 'Safeguard' ? 'bg-purple-950 text-purple-300 border border-purple-800/40' :
                    pulse.tag === 'Reliability' ? 'bg-amber-950 text-amber-300 border border-amber-800/40' :
                    pulse.tag === 'Architecture' ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/40' :
                    'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                  }`}>
                    {pulse.tag}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{pulse.timestamp}</span>
                </div>
                <div className="font-medium text-slate-200 line-clamp-2 text-[11px]">
                  {pulse.title}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  👤 {pulse.actor}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Persistent Memories</span>
            <Database className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">{insights?.total_memories || 55}</div>
          <div className="text-[11px] text-cyan-400 font-medium">Hindsight Vector Store</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">ADR Decisions</span>
            <FileCode2 className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">{insights?.total_decisions || 20}</div>
          <div className="text-[11px] text-purple-400 font-medium">Structured Architecture</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Incidents Logged</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{insights?.total_incidents || 15}</div>
          <div className="text-[11px] text-amber-400 font-medium">With Root Postmortems</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Learned Lessons</span>
            <Lightbulb className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{insights?.total_lessons || 35}</div>
          <div className="text-[11px] text-emerald-400 font-medium">Actionable Wisdom</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Repeated Issues</span>
            <ShieldCheck className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400">{insights?.repeated_issues || 7}</div>
          <div className="text-[11px] text-slate-400 font-medium">Monitored Risk Vectors</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Resolved Patterns</span>
            <TrendingUp className="h-4 w-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-400">{insights?.resolved_patterns || 13}</div>
          <div className="text-[11px] text-slate-400 font-medium">Permanent Standards</div>
        </div>
      </div>

      {/* Quick Questions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Experience-Based Queries</h2>
            <p className="text-xs text-slate-400">Click any scenario to see causal reasoning and evidence in action</p>
          </div>
          <button 
            onClick={() => onNavigate('chat')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center space-x-1"
          >
            <span>Open Interactive Chat</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickPrompts.map((q, idx) => (
            <div
              key={idx}
              onClick={() => onNavigate('chat', q.title)}
              className={`glass-panel glass-panel-hover p-5 rounded-2xl border cursor-pointer bg-gradient-to-br ${q.color} transition-all duration-200`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-900/80 border border-white/10">
                  {q.category}
                </span>
                <ArrowRight className="h-4 w-4 opacity-60 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">{q.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{q.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Grid: Recent Lessons + Caching Journey */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Organizational Lessons */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Recent Institutional Lessons</h3>
            </div>
            <button 
              onClick={() => onNavigate('insights')}
              className="text-xs text-emerald-400 hover:underline"
            >
              View All Lessons
            </button>
          </div>

          <div className="space-y-3">
            {insights?.recent_lessons.slice(0, 4).map((l: any, i: number) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 hover:border-emerald-500/30 transition-colors">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="font-semibold text-slate-200">{l.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono">
                    {l.technology}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{l.lesson}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Case Study Card: The NovaStack Caching Journey */}
        <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-cyan-950/20 to-slate-900/60 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Layers className="h-4 w-4" />
              <span>Core Case Study</span>
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              The Redis $\to$ Local LRU $\to$ Caching Policy v2 Evolution
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              How NovaStack transformed a P1 cache stampede outage into a company-wide multi-tier caching standard with 99.995% uptime.
            </p>
          </div>

          <div className="space-y-2 py-2 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span>1. ADR-002: Redis Introduced</span>
              <span className="text-slate-500 font-mono">June 2023</span>
            </div>
            <div className="flex items-center justify-between text-rose-300">
              <span>2. INC-101: Cache Stampede Outage</span>
              <span className="text-slate-500 font-mono">Jan 2024</span>
            </div>
            <div className="flex items-center justify-between text-purple-300">
              <span>3. ADR-006: Local LRU + DynamoDB</span>
              <span className="text-slate-500 font-mono">Feb 2024</span>
            </div>
            <div className="flex items-center justify-between text-emerald-300 font-semibold">
              <span>4. ADR-020: Caching Policy v2</span>
              <span className="text-emerald-400 font-mono">March 2025</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('timeline')}
            className="w-full py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-semibold transition-all flex items-center justify-center space-x-2"
          >
            <span>Explore Evolution Timeline</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
