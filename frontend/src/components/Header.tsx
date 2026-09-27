import React from 'react';
import { Brain, Sparkles, Database, ShieldCheck, PlayCircle } from 'lucide-react';

interface HeaderProps {
  activeView: string;
  onSelectView: (view: string) => void;
  activeMemoryCount: number;
}

export const Header: React.FC<HeaderProps> = ({ activeView, onSelectView, activeMemoryCount }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#090d16]/80 backdrop-blur-md px-6 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Brain className="h-6 w-6 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-sky-200 to-purple-400 bg-clip-text text-transparent">
              CompanyBrain
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-700/50">
              NovaStack
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Persistent Organizational Intelligence & Experience Memory
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Hindsight Memory Status */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-emerald-500/30 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-300 font-medium">Hindsight Active:</span>
          <span className="text-emerald-400 font-semibold">{activeMemoryCount} Experiences</span>
        </div>
      </div>
    </header>
  );
};
