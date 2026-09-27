import React, { useState, useEffect } from 'react';
import { 
  Network, 
  Layers, 
  FileCode2, 
  AlertTriangle, 
  Cpu, 
  Users, 
  FolderGit2, 
  Search,
  Filter,
  Info,
  Maximize2
} from 'lucide-react';
import { api } from '../services/api';
import { GraphData, GraphNode, GraphEdge } from '../types';

export const MemoryGraphView: React.FC = () => {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getGraph()
      .then(data => {
        setGraphData(data);
        const redisNode = data.nodes.find(n => n.label.toLowerCase().includes('redis')) || data.nodes[0];
        if (redisNode) setSelectedNode(redisNode);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'technology': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-cyan-500/20';
      case 'decision': return 'bg-purple-500/20 text-purple-300 border-purple-500/60 shadow-purple-500/20';
      case 'incident': return 'bg-rose-500/20 text-rose-300 border-rose-500/60 shadow-rose-500/20';
      case 'project': return 'bg-blue-500/20 text-blue-300 border-blue-500/60 shadow-blue-500/20';
      case 'person': return 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-amber-500/20';
      default: return 'bg-slate-700/40 text-slate-300 border-slate-600';
    }
  };

  const filteredNodes = graphData.nodes.filter(n => {
    const matchesType = filterType === 'All' || n.type === filterType;
    const matchesSearch = !searchQuery || n.label.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const connectedEdges = selectedNode ? graphData.edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id) : [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
            <Network className="h-6 w-6 text-purple-400" />
            <span>Organizational Memory Knowledge Graph</span>
          </h1>
          <p className="text-xs text-slate-400">
            Interactive topology connecting Technologies, Decisions, Incidents, Outcomes, and People.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['All', 'technology', 'decision', 'incident', 'project', 'person'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                filterType === t 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Graph Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Node Link Topology Canvas */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-2xl border border-white/10 space-y-4 min-h-[520px] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400 flex items-center space-x-2">
              <Info className="h-4 w-4 text-cyan-400" />
              <span>Click any node to inspect connected causal relationships</span>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {filteredNodes.length} nodes | {connectedEdges.length} active links
            </div>
          </div>

          {/* Interactive Visual Node Clusters */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 py-4 max-h-[460px] overflow-y-auto pr-1">
            {filteredNodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-3.5 rounded-xl border text-left transition-all relative ${getNodeColor(node.type)} ${
                    isSelected ? 'ring-2 ring-white scale-105 shadow-xl' : 'hover:scale-[1.02]'
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold tracking-wider opacity-75 mb-1">
                    {node.type}
                  </div>
                  <div className="text-xs font-bold text-white truncate">
                    {node.label}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="pt-3 border-t border-white/5 flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center space-x-1.5"><span className="h-2.5 w-2.5 rounded-full bg-cyan-400"></span><span>Technology</span></span>
            <span className="flex items-center space-x-1.5"><span className="h-2.5 w-2.5 rounded-full bg-purple-400"></span><span>Architecture Decision</span></span>
            <span className="flex items-center space-x-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-400"></span><span>Incident Postmortem</span></span>
            <span className="flex items-center space-x-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-400"></span><span>Project</span></span>
            <span className="flex items-center space-x-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-400"></span><span>Engineer</span></span>
          </div>
        </div>

        {/* Node Detail & Connected Relations Inspector */}
        <div className="lg:col-span-4">
          {selectedNode ? (
            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-5 sticky top-20">
              <div className="border-b border-white/10 pb-3">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-900 text-purple-300 border border-white/5">
                  {selectedNode.type}
                </span>
                <h2 className="text-lg font-bold text-white mt-1.5">{selectedNode.label}</h2>
                {selectedNode.data?.title && (
                  <p className="text-xs text-slate-300 mt-1">{selectedNode.data.title}</p>
                )}
              </div>

              {/* Node Metadata */}
              <div className="space-y-3 text-xs">
                {selectedNode.data?.date && (
                  <div className="flex justify-between text-slate-400">
                    <span>Date:</span>
                    <span className="text-slate-200 font-mono">{selectedNode.data.date}</span>
                  </div>
                )}
                {selectedNode.data?.lesson && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                    <span className="text-[10px] font-bold text-emerald-400 block mb-1">Lesson</span>
                    <p className="text-emerald-200 italic leading-relaxed">"{selectedNode.data.lesson}"</p>
                  </div>
                )}
              </div>

              {/* Connected Edges */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="text-xs font-bold text-slate-300">Connected Causal Relationships ({connectedEdges.length})</div>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {connectedEdges.map((edge) => (
                    <div key={edge.id} className="p-2.5 rounded-lg bg-slate-900/80 border border-white/5 text-xs space-y-1">
                      <div className="text-[10px] font-mono text-purple-400 font-bold uppercase">
                        [{edge.relation}] {edge.label}
                      </div>
                      <div className="text-[11px] text-slate-300 truncate">
                        {edge.source === selectedNode.id ? `$\to$ Target: ${edge.target}` : `$\leftarrow$ Source: ${edge.source}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-2xl border border-white/10 text-center text-slate-400 text-xs">
              Select any node in the graph to inspect relationships.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
