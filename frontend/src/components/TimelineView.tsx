import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  Calendar, 
  FileCode2, 
  AlertTriangle, 
  Layers, 
  Lightbulb, 
  Filter,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { TimelineItem } from '../types';

export const TimelineView: React.FC = () => {
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [filter, setFilter] = useState<'All' | 'Decision' | 'Incident'>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTimeline()
      .then(data => setTimeline(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredItems = timeline.filter(item => {
    if (filter === 'All') return true;
    return item.category === filter;
  });

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
            <GitBranch className="h-6 w-6 text-cyan-400" />
            <span>Organizational Memory Evolution Timeline</span>
          </h1>
          <p className="text-xs text-slate-400">
            Chronological sequence of architecture decisions, production failures, and institutional learnings.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilter('All')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold ${filter === 'All' ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-400'}`}
          >
            All Milestones
          </button>
          <button
            onClick={() => setFilter('Decision')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold ${filter === 'Decision' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400'}`}
          >
            Decisions (ADR)
          </button>
          <button
            onClick={() => setFilter('Incident')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold ${filter === 'Incident' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400'}`}
          >
            Incidents
          </button>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 md:pl-10 space-y-8 before:absolute before:left-3 md:before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-purple-500 before:to-emerald-500">
        {loading ? (
          <div className="text-center py-10 text-xs text-slate-400">Loading evolution timeline...</div>
        ) : (
          filteredItems.map((item, idx) => {
            const isDecision = item.category === 'Decision';
            const isIncident = item.category === 'Incident';

            return (
              <div key={item.id} className="relative group">
                {/* Node Dot */}
                <div className={`absolute -left-6 md:-left-10 top-1.5 h-6 w-6 rounded-full flex items-center justify-center border-2 ${
                  isDecision
                    ? 'bg-slate-950 border-purple-400 text-purple-400 shadow-lg shadow-purple-500/30'
                    : isIncident
                    ? 'bg-slate-950 border-rose-500 text-rose-400 shadow-lg shadow-rose-500/30'
                    : 'bg-slate-950 border-cyan-400 text-cyan-400 shadow-lg shadow-cyan-500/30'
                }`}>
                  {isDecision ? (
                    <FileCode2 className="h-3 w-3" />
                  ) : isIncident ? (
                    <AlertTriangle className="h-3 w-3" />
                  ) : (
                    <CheckCircle2 className="h-3 w-3" />
                  )}
                </div>

                {/* Content Card */}
                <div className="glass-panel p-5 rounded-2xl border border-white/5 group-hover:border-cyan-500/30 transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-white/5">
                        {item.related_ids[0] || item.id}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isDecision
                          ? 'bg-purple-950 text-purple-300 border border-purple-800/40'
                          : isIncident
                          ? 'bg-rose-950 text-rose-400 border border-rose-800/40'
                          : 'bg-cyan-950 text-cyan-300 border border-cyan-800/40'
                      }`}>
                        {item.category}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 font-mono">
                      {item.date}
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-white leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.summary}
                  </p>

                  {item.lesson && (
                    <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs">
                      <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold text-[11px] mb-1">
                        <Lightbulb className="h-3.5 w-3.5" />
                        <span>Takeaway</span>
                      </div>
                      <p className="text-emerald-200 italic">"{item.lesson}"</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
