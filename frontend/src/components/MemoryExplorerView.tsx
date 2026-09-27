import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Search, 
  Filter, 
  Tag, 
  Calendar, 
  User, 
  FileCode2, 
  AlertTriangle, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { MemoryItem } from '../types';

export const MemoryExplorerView: React.FC = () => {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<MemoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTech, setSelectedTech] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMemories();
  }, [selectedTech, selectedType]);

  const loadMemories = async () => {
    setLoading(true);
    try {
      const tech = selectedTech === 'All' ? undefined : selectedTech;
      const type = selectedType === 'All' ? undefined : selectedType;
      const data = await api.getMemories(searchQuery || undefined, tech, undefined, type);
      setMemories(data);
      if (data.length > 0 && !selectedMemory) {
        setSelectedMemory(data[0]);
      }
    } catch (err) {
      console.error('Failed to load memories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadMemories();
  };

  const techOptions = ["All", "PostgreSQL", "Redis", "Kafka", "Kubernetes", "DynamoDB", "GraphQL", "gRPC", "Vault", "Temporal.io"];
  const typeOptions = [
    { label: "All Types", value: "All" },
    { label: "ADR Decisions", value: "architecture_decision" },
    { label: "Incidents", value: "engineering_incident" },
    { label: "GitHub Issues", value: "github_issue" }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
            <Database className="h-6 w-6 text-cyan-400" />
            <span>Hindsight Memory Explorer</span>
          </h1>
          <p className="text-xs text-slate-400">
            Browse and search persistent institutional memories across NovaStack engineering history.
          </p>
        </div>

        <div className="text-xs text-slate-400">
          Showing <span className="font-bold text-cyan-400">{memories.length}</span> persistent records
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords, lessons, root causes, technology..."
              className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs text-white placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 text-xs text-slate-300 border border-white/10"
            >
              {techOptions.map((t) => (
                <option key={t} value={t}>{t === 'All' ? 'All Tech' : t}</option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 text-xs text-slate-300 border border-white/10"
            >
              {typeOptions.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Split Layout: List + Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Memory List */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
          {loading ? (
            <div className="text-center py-10 text-xs text-slate-400">Loading persistent memories...</div>
          ) : memories.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">No matching memories found.</div>
          ) : (
            memories.map((m) => {
              const isSelected = selectedMemory?.id === m.id;
              const isIncident = m.type === 'engineering_incident';
              const isADR = m.type === 'architecture_decision';

              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMemory(m)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-900/60 border-white/5 hover:bg-slate-900 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
                    <span className="font-mono px-2 py-0.5 rounded bg-slate-950 text-cyan-300 border border-white/5">
                      {m.source_id || m.id}
                    </span>
                    <span>{m.date}</span>
                  </div>

                  <h3 className="text-xs font-bold text-white line-clamp-1 mb-1">
                    {m.title}
                  </h3>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {m.lesson || m.summary || m.outcome}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[10px] text-slate-400">
                    <span className="font-medium text-slate-300">{m.project}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {m.technology}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Memory Inspector Panel */}
        <div className="lg:col-span-7">
          {selectedMemory ? (
            <div className="glass-panel p-6 lg:p-8 rounded-2xl border border-white/10 space-y-6 sticky top-20">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40">
                      {selectedMemory.source_id || selectedMemory.id}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {selectedMemory.type.replace('_', ' ')}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-1">{selectedMemory.title}</h2>
                </div>

                <div className="text-right text-xs text-slate-400">
                  <div>{selectedMemory.date}</div>
                  <div className="text-cyan-400 font-medium">{selectedMemory.project}</div>
                </div>
              </div>

              {/* Structured Tuple: Event -> Context -> Decision -> Action -> Outcome -> Lesson */}
              <div className="space-y-3 text-xs">
                {selectedMemory.event && (
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-0.5">Event / Trigger</span>
                    <p className="text-slate-200">{selectedMemory.event}</p>
                  </div>
                )}

                {selectedMemory.context && (
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-0.5">Context & Background</span>
                    <p className="text-slate-200">{selectedMemory.context}</p>
                  </div>
                )}

                {selectedMemory.decision && (
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-0.5">Decision Taken</span>
                    <p className="text-slate-200">{selectedMemory.decision}</p>
                  </div>
                )}

                {selectedMemory.outcome && (
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-0.5">Actual Outcome</span>
                    <p className="text-slate-200">{selectedMemory.outcome}</p>
                  </div>
                )}

                {selectedMemory.lesson && (
                  <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                    <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px] block mb-1">
                      Institutional Lesson Learned
                    </span>
                    <p className="text-emerald-200 font-medium italic">"{selectedMemory.lesson}"</p>
                  </div>
                )}
              </div>

              {/* Tags & Metadata */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-white/5">
                <span className="text-[10px] text-slate-400 font-medium mr-1">Tags:</span>
                {selectedMemory.tags.map((t, idx) => (
                  <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-2xl border border-white/10 text-center text-slate-400 text-xs">
              Select a memory to inspect its full causal details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
