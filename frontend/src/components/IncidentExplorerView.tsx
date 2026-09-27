import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Clock, 
  UserCheck, 
  ShieldAlert, 
  CheckCircle2, 
  FileText, 
  Lightbulb, 
  Link as LinkIcon 
} from 'lucide-react';
import { api } from '../services/api';
import { IncidentItem } from '../types';

export const IncidentExplorerView: React.FC = () => {
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<IncidentItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getIncidents(severityFilter === 'All' ? undefined : severityFilter)
      .then(data => {
        setIncidents(data);
        if (data.length > 0) setSelectedIncident(data[0]);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [severityFilter]);

  const filteredIncidents = incidents.filter(i =>
    i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.system.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.root_cause.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSeverityBadge = (sev: string) => {
    if (sev.includes('P1')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800/40">P1 Critical</span>;
    } else if (sev.includes('P2')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800/40">P2 Major</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-400 border border-blue-800/40">P3 Moderate</span>;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6 text-amber-400" />
            <span>Engineering Incidents & Postmortems</span>
          </h1>
          <p className="text-xs text-slate-400">
            Historical outages, root causes, emergency remediations, and organizational takeaways.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSeverityFilter('All')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold ${severityFilter === 'All' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400'}`}
          >
            All (15)
          </button>
          <button
            onClick={() => setSeverityFilter('P1')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold ${severityFilter === 'P1' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-400'}`}
          >
            P1 (5)
          </button>
          <button
            onClick={() => setSeverityFilter('P2')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold ${severityFilter === 'P2' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400'}`}
          >
            P2 (7)
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Incident List */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
          <div className="relative mb-2">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search incidents by root cause, system..."
              className="w-full pl-9 pr-4 py-1.5 rounded-xl glass-input text-xs text-white"
            />
          </div>

          {filteredIncidents.map((inc) => {
            const isSelected = selectedIncident?.id === inc.id;
            return (
              <div
                key={inc.id}
                onClick={() => setSelectedIncident(inc)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-amber-950/40 border-amber-500 shadow-md shadow-amber-500/10'
                    : 'bg-slate-900/60 border-white/5 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono font-bold text-amber-300 text-xs">{inc.id}</span>
                  {getSeverityBadge(inc.severity)}
                </div>
                <h3 className="text-xs font-bold text-white mb-1 line-clamp-1">{inc.title}</h3>
                <p className="text-[11px] text-slate-400 line-clamp-2">{inc.root_cause}</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[10px] text-slate-400">
                  <span>{inc.date}</span>
                  <span className="font-medium text-slate-300">{inc.system}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Postmortem Panel */}
        <div className="lg:col-span-7">
          {selectedIncident ? (
            <div className="glass-panel p-6 lg:p-8 rounded-2xl border border-white/10 space-y-6 sticky top-20">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-amber-950 text-amber-300 border border-amber-800/40">
                      {selectedIncident.id}
                    </span>
                    {getSeverityBadge(selectedIncident.severity)}
                    <span className="text-xs text-slate-400 flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{selectedIncident.duration}</span>
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-2">{selectedIncident.title}</h2>
                </div>

                <div className="text-right text-xs text-slate-400">
                  <div>{selectedIncident.date}</div>
                  <div className="text-amber-400 font-semibold">{selectedIncident.system}</div>
                </div>
              </div>

              {/* Responder Info */}
              <div className="flex items-center space-x-2 text-xs text-slate-300">
                <UserCheck className="h-4 w-4 text-emerald-400" />
                <span className="text-slate-400">Lead Responder:</span>
                <span className="font-semibold text-white">{selectedIncident.lead_responder}</span>
              </div>

              {/* Sections */}
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                  <span className="font-bold text-rose-400 uppercase tracking-wider text-[10px]">Symptoms Observed</span>
                  <p className="text-slate-300 leading-relaxed font-mono text-[11px]">{selectedIncident.symptoms}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                  <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">Root Cause Analysis</span>
                  <p className="text-slate-200 leading-relaxed">{selectedIncident.root_cause}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-2">
                  <span className="font-bold text-cyan-400 uppercase tracking-wider text-[10px]">Emergency Actions Taken</span>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-300">
                    {selectedIncident.actions_taken.map((act, i) => (
                      <li key={i} className="leading-relaxed">{act}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                    <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">Resolution</span>
                    <p className="text-slate-300">{selectedIncident.resolution}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Business Impact</span>
                    <p className="text-slate-300">{selectedIncident.impact}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-1">
                  <div className="flex items-center space-x-1.5 text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
                    <Lightbulb className="h-3.5 w-3.5" />
                    <span>Postmortem Institutional Lesson</span>
                  </div>
                  <p className="text-emerald-200 font-medium italic leading-relaxed">
                    "{selectedIncident.lessons_learned}"
                  </p>
                </div>

                {/* Related ADRs */}
                {selectedIncident.related_adrs && selectedIncident.related_adrs.length > 0 && (
                  <div className="pt-2 flex items-center space-x-2">
                    <span className="text-[11px] text-slate-400">Triggered / Related ADRs:</span>
                    {selectedIncident.related_adrs.map((adr, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-mono text-[10px] border border-purple-800/40">
                        {adr}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-2xl border border-white/10 text-center text-slate-400 text-xs">
              Select an incident to view root cause postmortem.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
