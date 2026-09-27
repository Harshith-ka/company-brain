import React, { useState } from 'react';
import { api } from '../services/api';
import type { SlackCommandResponse } from '../types';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  Bot, 
  Hash, 
  Clock, 
  Users, 
  Zap, 
  ArrowRight,
  ShieldCheck,
  Flame
} from 'lucide-react';

interface SlackMessage {
  id: string;
  sender: string;
  avatarColor: string;
  isBot?: boolean;
  time: string;
  text: string;
  responders?: string[];
  matches?: number;
}

export const SlackWarRoomView: React.FC = () => {
  const [messages, setMessages] = useState<SlackMessage[]>([
    {
      id: '1',
      sender: 'priya-sre (Staff SRE)',
      avatarColor: 'bg-emerald-600',
      time: '14:20',
      text: '🚨 @channel Alert firing on production: `Database connection count reached 495/500`. Checkout pods are receiving connection timeout errors.'
    },
    {
      id: '2',
      sender: 'alex-devops (DevOps Lead)',
      avatarColor: 'bg-blue-600',
      time: '14:22',
      text: 'Checking the deployment logs. Looks like the Kubernetes HPA just scaled checkout workers from 20 to 90 pods. Let\'s ask the CompanyBrain bot if we had this before.'
    }
  ]);

  const [inputVal, setInputVal] = useState('/askbrain Why is PostgreSQL rejecting connections during autoscaling?');
  const [loading, setLoading] = useState(false);

  const quickCommands = [
    '/askbrain Why is PostgreSQL rejecting connections during autoscaling?',
    '/askbrain How was the Redis cache stampede resolved in INC-101?',
    '/askbrain What is our architectural policy for Stripe webhooks and idempotency?',
    '/askbrain Who decided on Temporal.io for distributed payment sagas?'
  ];

  const handleSend = async (customCmd?: string) => {
    const textToSend = customCmd || inputVal;
    if (!textToSend.trim()) return;

    const userMsg: SlackMessage = {
      id: Date.now().toString(),
      sender: 'priya-sre (Staff SRE)',
      avatarColor: 'bg-emerald-600',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: textToSend
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setLoading(true);

    try {
      const cleanQuery = textToSend.replace(/^\/askbrain\s*/i, '').replace(/^@companybrain\s*/i, '');
      const res: SlackCommandResponse = await api.sendSlackCommand({
        command: '/askbrain',
        text: cleanQuery,
        channel_name: 'incident-war-room',
        user_name: 'priya-sre'
      });

      const botMsg: SlackMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'CompanyBrain',
        avatarColor: 'bg-gradient-to-tr from-cyan-500 to-purple-600',
        isBot: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: res.text,
        responders: res.recommended_responders,
        matches: res.historical_matches
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Slack bot error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider mb-1">
              <MessageSquare className="w-4 h-4 text-emerald-400 animate-pulse" />
              Live Incident War-Room Integration
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Slack & Teams War-Room Bot (`@CompanyBrain`)
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              An on-call organizational memory copilot embedded in your team's Slack incident channels. Ask questions or run `/askbrain` to retrieve past triage playbooks and loop in the original incident responders.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-950/60 border border-emerald-500/20 px-4 py-2 rounded-xl text-xs font-mono text-emerald-300 self-start md:self-auto">
            <Zap className="w-4 h-4 text-emerald-400" />
            Slack Webhook Endpoint Active
          </div>
        </div>

        {/* Quick Slash Commands */}
        <div className="mt-5 pt-4 border-t border-emerald-500/10">
          <div className="text-xs text-slate-400 font-medium mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Simulate Slack Slash Commands:
          </div>
          <div className="flex flex-wrap gap-2">
            {quickCommands.map((cmd, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputVal(cmd);
                  handleSend(cmd);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-emerald-950/50 border border-slate-800 hover:border-emerald-500/40 text-xs font-mono text-slate-300 hover:text-emerald-300 transition-all text-left"
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Slack Window Interface */}
      <div className="bg-[#1a1d21] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[560px]">
        {/* Slack Channel Header */}
        <div className="bg-[#111315] px-6 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-200 font-bold text-sm">
              <Hash className="w-4 h-4 text-slate-400" />
              <span>incident-war-room</span>
            </div>
            <span className="text-xs text-slate-500 border-l border-slate-700 pl-3 hidden sm:inline">
              P1 Incident Triage & Live CompanyBrain Copilot
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>12 responders on-call</span>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#1a1d21]">
          {messages.map((m) => (
            <div key={m.id} className={`flex items-start gap-3.5 p-2 rounded-xl transition-colors ${m.isBot ? 'bg-slate-900/50 border border-purple-500/20' : 'hover:bg-slate-800/20'}`}>
              <div className={`w-8 h-8 rounded-lg ${m.avatarColor} flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5`}>
                {m.isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200">{m.sender}</span>
                  {m.isBot && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 font-mono border border-purple-800">
                      APP
                    </span>
                  )}
                  <span className="text-[11px] text-slate-500 font-mono">{m.time}</span>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                  {m.text}
                </div>

                {m.responders && m.responders.length > 0 && (
                  <div className="pt-2 mt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Recommended Past Responders:
                    </span>
                    {m.responders.map((resp, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-950 text-purple-300 border border-purple-900 font-mono text-[10px]">
                        @{resp}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-300 animate-pulse">
              <Bot className="w-4 h-4 animate-spin" />
              <span>CompanyBrain is reasoning over historical incident playbooks...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-[#111315] border-t border-slate-800">
          <div className="relative">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type /askbrain <query> or @CompanyBrain <question>..."
              className="w-full bg-[#1a1d21] border border-slate-700 rounded-xl pl-4 pr-24 py-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-sans"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !inputVal.trim()}
              className="absolute right-2 top-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <span>Send</span>
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
