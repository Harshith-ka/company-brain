import React, { useState } from 'react';
import { 
  Sparkles, 
  Play, 
  ArrowRight, 
  CheckCircle2, 
  RotateCcw, 
  Layers, 
  Zap, 
  Clock, 
  FileText, 
  Database,
  Cpu,
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import { api } from '../services/api';
import { ChatResponse } from '../types';

interface DemoRunnerViewProps {
  onNavigate: (view: string, query?: string) => void;
}

export const DemoRunnerView: React.FC<DemoRunnerViewProps> = ({ onNavigate }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [stepResponses, setStepResponses] = useState<Record<number, ChatResponse>>({});

  const demoSteps = [
    {
      step: 1,
      title: "Part 1 — The Cold Agent",
      question: "Why did NovaStack stop using Redis?",
      explanation: "Demonstrates baseline behavior before organizational memory exists. The AI accurately admits lack of institutional history.",
      expectedConfidence: "Unknown (15%)",
      stage: 1
    },
    {
      step: 2,
      title: "Part 2 — Feed Historical Experiences",
      question: "Ingesting NovaStack Engineering Timeline into Hindsight...",
      explanation: "Ingests ADR-002 (Redis intro), INC-101 (cache stampede), GH-102 (mutex hotfix), ADR-006 (Local LRU pivot), and ADR-020.",
      expectedConfidence: "Forming Memory...",
      stage: 2
    },
    {
      step: 3,
      title: "Part 3 — Ask Again: Causal Memory Recall",
      question: "Why did NovaStack stop using Redis?",
      explanation: "The agent now traces the causal chain: Redis was introduced $\to$ Cache stampede occurred (INC-101) $\to$ Pivoted to Local LRU + DynamoDB (ADR-006).",
      expectedConfidence: "Known Fact (96%)",
      stage: 3
    },
    {
      step: 4,
      title: "Part 4 — Apply Memory to New Situation (Project Nova)",
      question: "We're considering Redis for our new payment service (Project Nova). What should we know?",
      explanation: "The agent connects past failure modes to a new project, recommending mandatory single-flight locks and randomized jitter.",
      expectedConfidence: "Inferred Synthesis (88%)",
      stage: 3
    },
    {
      step: 5,
      title: "Part 5 — Visual Memory Graph & Timeline",
      question: "Inspect connected causal links and organizational evolution.",
      explanation: "Navigate directly to the interactive Memory Graph and Chronological Timeline.",
      expectedConfidence: "Visual Verification",
      stage: 3
    },
    {
      step: 6,
      title: "Part 6 — The Killer Question: Learning Synthesis",
      question: "What has the company learned about caching?",
      explanation: "Synthesizes 2 years of incidents and decisions into high-value institutional engineering principles.",
      expectedConfidence: "Known Fact (98%)",
      stage: 3
    }
  ];

  const executeStep = async (stepNumber: number) => {
    setLoading(true);
    setCurrentStep(stepNumber);

    try {
      const stepConfig = demoSteps.find(s => s.step === stepNumber);
      if (!stepConfig) return;

      if (stepNumber === 2) {
        // Feed experiences
        await api.setDemoStage(3);
        setTimeout(() => {
          setLoading(false);
        }, 800);
        return;
      }

      if (stepNumber === 5) {
        setLoading(false);
        return;
      }

      // Execute Chat for step 1, 3, 4, 6
      const stageParam = stepNumber === 1 ? 1 : (stepNumber === 3 || stepNumber === 4 || stepNumber === 6 ? 3 : 1);
      const res = await api.sendChat(stepConfig.question, undefined, stageParam);
      setStepResponses(prev => ({ ...prev, [stepNumber]: res }));
    } catch (err) {
      console.error('Demo step error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    await api.resetDemo();
    setCurrentStep(1);
    setStepResponses({});
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-950/30 via-slate-900 to-slate-900">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold">
            <Zap className="h-3.5 w-3.5" />
            <span>Hackathon Judge Script (60-Second Walkthrough)</span>
          </div>
          <h1 className="text-2xl font-black text-white">
            Memory Evolution Demonstration
          </h1>
          <p className="text-xs text-slate-300">
            Witness how CompanyBrain evolves from <em>no memory</em> to <em>deep causal reasoning</em> and <em>forward application</em>.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition-all flex items-center space-x-2 self-start md:self-auto"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Demo State</span>
        </button>
      </div>

      {/* 6-Step Stepper Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {demoSteps.map((s) => {
          const isCurrent = currentStep === s.step;
          const isDone = s.step < currentStep || !!stepResponses[s.step];
          return (
            <button
              key={s.step}
              onClick={() => executeStep(s.step)}
              className={`p-3 rounded-xl text-left transition-all border ${
                isCurrent
                  ? 'bg-purple-600/30 border-purple-400 text-white shadow-lg shadow-purple-500/20 ring-1 ring-purple-400'
                  : isDone
                  ? 'bg-slate-900/90 border-emerald-500/40 text-slate-200'
                  : 'bg-slate-900/50 border-white/5 text-slate-400 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
                <span>Step {s.step}</span>
                {isDone ? <CheckCircle2 className="h-3 w-3 text-emerald-400" /> : <Play className="h-2.5 w-2.5 opacity-50" />}
              </div>
              <div className="text-xs font-bold truncate">{s.title.split('—')[1] || s.title}</div>
            </button>
          );
        })}
      </div>

      {/* Active Step Runner Display */}
      {(() => {
        const activeConfig = demoSteps.find(s => s.step === currentStep) || demoSteps[0];
        const res = stepResponses[currentStep];

        return (
          <div className="glass-panel p-6 lg:p-8 rounded-2xl border border-white/10 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800/40">
                  Step {activeConfig.step} of 6
                </span>
                <h2 className="text-lg font-extrabold text-white mt-1.5">{activeConfig.title}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{activeConfig.explanation}</p>
              </div>

              <button
                onClick={() => executeStep(currentStep)}
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25 transition-all flex items-center space-x-2"
              >
                <Play className="h-3.5 w-3.5" />
                <span>{loading ? "Reasoning..." : "Execute Step " + currentStep}</span>
              </button>
            </div>

            {/* Prompt Box */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Cpu className="h-5 w-5 text-cyan-400" />
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">Prompt Sent to CompanyBrain:</div>
                  <div className="text-sm font-semibold text-cyan-300">"{activeConfig.question}"</div>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-800 text-slate-300">
                Target: {activeConfig.expectedConfidence}
              </span>
            </div>

            {/* Step 2 Ingest Experience Visualization */}
            {currentStep === 2 && (
              <div className="p-6 rounded-2xl bg-slate-950/80 border border-cyan-500/30 space-y-4 text-xs">
                <div className="flex items-center space-x-2 text-cyan-400 font-bold uppercase tracking-wider">
                  <Database className="h-4 w-4" />
                  <span>Feeding Organizational Experience Stream</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div className="p-3 rounded-lg bg-slate-900 border border-white/5 space-y-1">
                    <span className="text-slate-500 font-mono text-[10px]">June 2023</span>
                    <div className="font-bold text-slate-200">ADR-002</div>
                    <p className="text-[11px] text-slate-400">Redis introduced for caching</p>
                  </div>
                  <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 space-y-1">
                    <span className="text-rose-400 font-mono text-[10px]">Jan 26, 2024</span>
                    <div className="font-bold text-rose-300">INC-101 Outage</div>
                    <p className="text-[11px] text-slate-400">Redis cache stampede (p99: 4.8s)</p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/30 space-y-1">
                    <span className="text-amber-400 font-mono text-[10px]">Jan 27, 2024</span>
                    <div className="font-bold text-amber-300">GH-102 Hotfix</div>
                    <p className="text-[11px] text-slate-400">Single-flight query mutex lock</p>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-950/40 border border-purple-500/30 space-y-1">
                    <span className="text-purple-400 font-mono text-[10px]">Feb 2, 2024</span>
                    <div className="font-bold text-purple-300">ADR-006</div>
                    <p className="text-[11px] text-slate-400">Replaced with Local LRU + DynamoDB</p>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 space-y-1">
                    <span className="text-emerald-400 font-mono text-[10px]">March 1, 2025</span>
                    <div className="font-bold text-emerald-300">ADR-020 Policy</div>
                    <p className="text-[11px] text-slate-400">Company-wide Caching Policy v2</p>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => executeStep(3)}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5"
                  >
                    <span>Proceed to Step 3: Ask Again</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 5 Visual Links */}
            {currentStep === 5 && (
              <div className="p-6 rounded-2xl bg-slate-950/80 border border-purple-500/30 space-y-4">
                <div className="flex items-center space-x-2 text-purple-400 font-bold uppercase tracking-wider text-xs">
                  <Layers className="h-4 w-4" />
                  <span>Inspect Visual Knowledge Artifacts</span>
                </div>
                <p className="text-xs text-slate-300">
                  Observe how institutional memory is mapped into an interactive knowledge graph and chronological evolution timeline.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => onNavigate('graph')}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-2"
                  >
                    <span>Open Memory Graph</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onNavigate('timeline')}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs border border-cyan-500/30 flex items-center space-x-2"
                  >
                    <span>Open Timeline</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => executeStep(6)}
                    className="ml-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-2"
                  >
                    <span>Run Step 6: Killer Question</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Response Output Box */}
            {res && (
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-white/10 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                    CompanyBrain Output ({res.confidence_level} — {res.confidence_percentage}%)
                  </span>
                  <span className="text-slate-400">{res.historical_count} memories recalled</span>
                </div>

                <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-line font-sans">
                  {res.answer}
                </div>

                {res.causal_chain.length > 0 && (
                  <div className="pt-2 border-t border-white/5 space-y-2">
                    <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                      Causal Chain Reconstruction:
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                      {res.causal_chain.map((c, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-slate-950 border border-white/5">
                          <div className="text-[10px] font-bold text-purple-300">{c.label}</div>
                          <div className="text-[11px] text-slate-400 mt-1">{c.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Next Step CTA */}
                {currentStep < 6 && currentStep !== 2 && currentStep !== 5 && (
                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={() => executeStep(currentStep + 1)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md"
                    >
                      <span>Next: Step {currentStep + 1}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};
