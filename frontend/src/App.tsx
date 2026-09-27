import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ChatView } from './components/ChatView';
import { MemoryExplorerView } from './components/MemoryExplorerView';
import { DecisionExplorerView } from './components/DecisionExplorerView';
import { IncidentExplorerView } from './components/IncidentExplorerView';
import { TimelineView } from './components/TimelineView';
import { MemoryGraphView } from './components/MemoryGraphView';
import { LearningInsightsView } from './components/LearningInsightsView';
import { IngestionView } from './components/IngestionView';
import { RiskSimulatorView } from './components/RiskSimulatorView';
import { GitHubGuardView } from './components/GitHubGuardView';
import { SlackWarRoomView } from './components/SlackWarRoomView';
import { api } from './services/api';

export function App() {
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [chatInitialQuery, setChatInitialQuery] = useState<string | undefined>(undefined);
  const [activeMemoryCount, setActiveMemoryCount] = useState<number>(55);

  useEffect(() => {
    api.getDemoStatus()
      .then(st => setActiveMemoryCount(st.active_memories))
      .catch(err => console.error(err));
  }, [activeView]);

  const handleNavigate = (view: string, initialQuery?: string) => {
    if (initialQuery) {
      setChatInitialQuery(initialQuery);
    }
    setActiveView(view);
  };

  return (
    <div className="h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 overflow-hidden">
      <Header 
        activeView={activeView} 
        onSelectView={setActiveView} 
        activeMemoryCount={activeMemoryCount} 
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          activeView={activeView} 
          onSelectView={(v) => {
            setChatInitialQuery(undefined);
            setActiveView(v);
          }} 
        />

        <main className="flex-1 overflow-y-auto bg-[#090d16]/50">
          {activeView === 'dashboard' && (
            <DashboardView onNavigate={handleNavigate} />
          )}

          {activeView === 'chat' && (
            <ChatView 
              initialQuery={chatInitialQuery} 
              onNavigateToEvidence={(type, id) => {
                if (type === 'adr') setActiveView('decisions');
                else if (type === 'incident') setActiveView('incidents');
              }}
            />
          )}

          {activeView === 'simulator' && (
            <div className="p-8 max-w-6xl mx-auto">
              <RiskSimulatorView />
            </div>
          )}

          {activeView === 'github_guard' && (
            <GitHubGuardView />
          )}

          {activeView === 'slack_bot' && (
            <SlackWarRoomView />
          )}

          {activeView === 'memories' && (
            <MemoryExplorerView />
          )}

          {activeView === 'decisions' && (
            <DecisionExplorerView />
          )}

          {activeView === 'incidents' && (
            <IncidentExplorerView />
          )}

          {activeView === 'timeline' && (
            <TimelineView />
          )}

          {activeView === 'graph' && (
            <MemoryGraphView />
          )}

          {activeView === 'insights' && (
            <LearningInsightsView />
          )}

          {activeView === 'ingest' && (
            <IngestionView />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
