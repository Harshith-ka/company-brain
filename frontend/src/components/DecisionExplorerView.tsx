import React, { useState, useEffect } from 'react';
import { 
  FileCode2, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  Calendar, 
  Layers, 
  Lightbulb, 
  ArrowRight,
  GitPullRequest
} from 'lucide-react';
import { api } from '../services/api';
import { DecisionItem } from '../types';

export const DecisionExplorerView: React.FC = () => {
  const [decisions, setDecisions] = useState<DecisionItem[]>([]);
  const [selectedDecision, setSelectedDecision] = useState<DecisionItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDecisions(undefined, statusFilter === 'All' ? undefined : statusFilter)
      .then(data => {
        setDecisions(data);
        if (data.length > 0) setSelectedDecision(data[0]);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const filteredDecisions = decisions.filter(d => 
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.technology.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.decision.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
            <FileCode2 className="h-6 w-6 text-purple-400" />
            <span>Architecture Decision Records (ADRs)</span>
          </h1>
          <p className="text-xs text-slate-400">
            Explore 20 foundational architectural decisions, alternatives evaluated, and actual outcomes.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setStatusFilter('All')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold ${statusFilter === 'All' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400'}`}
          >
            All (20)
          </button>
          <button
            onClick={() => setStatusFilter('Accepted')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold ${statusFilter === 'Accepted' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400'}`}
          >
            Accepted (18)
          </button>
          <button
            onClick={() => setStatusFilter('Superseded')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold ${statusFilter === 'Superseded' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400'}`}
          >
            Superseded (2)
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
          <div className="relative mb-2">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ADRs..."
              className="w-full pl-9 pr-4 py-1.5 rounded-xl glass-input text-xs text-white"
            />
          </div>

          {filteredDecisions.map((d) => {
            const isSelected = selectedDecision?.id === d.id;
            const isSuperseded = d.status.toLowerCase() === 'superseded';
            return (
              <div
                key={d.id}
                onClick={() => setSelectedDecision(d)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-purple-950/40 border-purple-500 shadow-md shadow-purple-500/10'
                    : 'bg-slate-900/60 border-white/5 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="font-mono font-bold text-purple-300">{d.id}</span>
                  <span className={`px-2 py-0.5 rounded font-semibold ${
                    isSuperseded ? 'bg-amber-950 text-amber-400 border border-amber-800/40' : 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                  }`}>
                    {d.status}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white mb-1 line-clamp-1">{d.title}</h3>
                <p className="text-[11px] text-slate-400 line-clamp-2">{d.decision}</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[10px] text-slate-400">
                  <span>{d.date}</span>
                  <span className="font-medium text-slate-300">{d.technology}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Detail View */}
        <div className="lg:col-span-7">
          {selectedDecision ? (
            <div className="glass-panel p-6 lg:p-8 rounded-2xl border border-white/10 space-y-6 sticky top-20">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-purple-950 text-purple-300 border border-purple-800/40">
                      {selectedDecision.id}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {selectedDecision.category}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-2">{selectedDecision.title}</h2>
                </div>

                <div className="text-right text-xs text-slate-400">
                  <div>{selectedDecision.date}</div>
                  <div className="text-purple-400 font-semibold">{selectedDecision.project}</div>
                </div>
              </div>

              {/* Authors */}
              <div className="flex items-center space-x-2 text-xs text-slate-300">
                <Users className="h-4 w-4 text-slate-400" />
                <span className="text-slate-400">Authors:</span>
                <span className="font-medium text-white">{selectedDecision.authors.join(', ')}</span>
              </div>

              {/* Structured Sections */}
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                  <span className="font-bold text-purple-400 uppercase tracking-wider text-[10px]">The Decision</span>
                  <p className="text-slate-200 text-sm leading-relaxed">{selectedDecision.decision}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Context & Motivation</span>
                  <p className="text-slate-300 leading-relaxed">{selectedDecision.reason}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-2">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Alternatives Evaluated</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedDecision.alternatives_considered.map((alt, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-white/5 font-mono text-[11px]">
                        {alt}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Expected Outcome</span>
                    <p className="text-slate-300">{selectedDecision.expected_outcome}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                    <span className="font-bold text-cyan-400 uppercase tracking-wider text-[10px]">Actual Outcome</span>
                    <p className="text-slate-200">{selectedDecision.actual_outcome}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-1">
                  <div className="flex items-center space-x-1.5 text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
                    <Lightbulb className="h-3.5 w-3.5" />
                    <span>Institutional Lesson</span>
                  </div>
                  <p className="text-emerald-200 font-medium italic leading-relaxed">
                    "{selectedDecision.lessons_learned}"
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-2xl border border-white/10 text-center text-slate-400 text-xs">
              Select an ADR to view full architectural rationale.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
