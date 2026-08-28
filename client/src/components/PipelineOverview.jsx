import React from 'react';
import { Search, Map, Code, CheckCircle, Send } from 'lucide-react';

const PIPELINE_STAGES = [
  { id: 'analyze', label: '1. Analyze', icon: Search, desc: 'Inspect jQuery AST & DOM patterns' },
  { id: 'plan', label: '2. Plan', icon: Map, desc: 'Design React component hierarchy & state' },
  { id: 'migrate', label: '3. Migrate', icon: Code, desc: 'Transform imperative code to JSX/Hooks' },
  { id: 'verify', label: '4. Verify', icon: CheckCircle, desc: 'Validate syntax & functional equality' },
  { id: 'ship', label: '5. Ship', icon: Send, desc: 'Generate modernized React module' }
];

export default function PipelineOverview({ hasAnalysis = false, hasPlan = false, hasMigrated = false, hasVerified = false, activeTab = 'analyze' }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-200">Modernization Workflow Pipeline</h2>
          <p className="text-xs text-slate-400">5-Stage Autonomous Agent Architecture</p>
        </div>
        <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700/50">
          Scope: jQuery → React Only
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {PIPELINE_STAGES.map((stage) => {
          const Icon = stage.icon;
          const isAnalyzeDone = stage.id === 'analyze' && hasAnalysis;
          const isPlanDone = stage.id === 'plan' && hasPlan;
          const isMigrateDone = stage.id === 'migrate' && hasMigrated;
          const isVerifyDone = stage.id === 'verify' && hasVerified;

          const isDone = isAnalyzeDone || isPlanDone || isMigrateDone || isVerifyDone;
          const isActive = stage.id === activeTab ||
            (stage.id === 'analyze' && !hasAnalysis) ||
            (stage.id === 'plan' && hasAnalysis && !hasPlan) ||
            (stage.id === 'migrate' && hasPlan && !hasMigrated) ||
            (stage.id === 'verify' && hasMigrated && !hasVerified);

          return (
            <div
              key={stage.id}
              className={`border rounded-xl p-3.5 relative transition-all ${
                isDone
                  ? 'bg-emerald-950/20 border-emerald-500/40 opacity-100 shadow-md shadow-emerald-500/5'
                  : isActive
                  ? 'bg-slate-900 border-sky-500/40 opacity-100 shadow-md shadow-sky-500/5'
                  : 'bg-slate-950/40 border-slate-800/80 opacity-50'
              }`}
            >
              <div className="flex items-center space-x-2.5 mb-2">
                <div className={`p-1.5 rounded-lg ${
                  isDone
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : isActive
                    ? 'bg-sky-500/20 text-sky-400'
                    : 'bg-slate-800 text-slate-500'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-xs font-medium ${isDone ? 'text-emerald-300' : isActive ? 'text-sky-300' : 'text-slate-400'}`}>
                  {stage.label}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">{stage.desc}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className={`text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded border ${
                  isDone
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : isActive
                    ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}>
                  {isDone ? '✓ Complete' : isActive ? '● Active' : '○ Pending'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
