import { 
  LayoutDashboard, 
  MessageSquareCode, 
  Database, 
  FileCode2, 
  AlertTriangle, 
  GitBranch, 
  Network, 
  Lightbulb, 
  UploadCloud, 
  Sparkles,
  ShieldAlert,
  GitPullRequest,
  MessageSquare
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onSelectView: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onSelectView }) => {
  const navItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard, badge: 'Live' },
    { id: 'chat', label: 'Ask CompanyBrain', icon: MessageSquareCode, badge: 'Why Engine', highlight: true },
    { id: 'simulator', label: 'Risk Simulator', icon: ShieldAlert, badge: 'Pre-Flight' },
    { id: 'github_guard', label: 'GitHub PR Guard', icon: GitPullRequest, badge: 'CI/CD' },
    { id: 'slack_bot', label: 'Slack War Room', icon: MessageSquare, badge: 'Bot' },
    { id: 'memories', label: 'Memory Explorer', icon: Database },
    { id: 'decisions', label: 'Decisions (ADR)', icon: FileCode2, count: '20' },
    { id: 'incidents', label: 'Incidents & Postmortems', icon: AlertTriangle, count: '15' },
    { id: 'timeline', label: 'Evolution Timeline', icon: GitBranch },
    { id: 'graph', label: 'Memory Graph', icon: Network },
    { id: 'insights', label: 'Learning & Insights', icon: Lightbulb },
    { id: 'ingest', label: 'Ingestion Center', icon: UploadCloud },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-white/10 bg-[#090d16]/95 p-4 flex flex-col justify-between h-full overflow-y-auto z-30 select-none">
      <div className="space-y-1 pr-0.5">
        <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Organizational Intelligence
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                  {item.badge}
                </span>
              )}
              {item.count && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="pt-3 mt-3 border-t border-white/5">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Memory Engine</span>
            <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800/40">Hindsight</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Preserving causal experience loops across NovaStack software evolution.
          </p>
        </div>
      </div>
    </aside>
  );
};
