import React from 'react';
import { Upload, Search, Map, Code, CheckCircle, Send } from 'lucide-react';

const PIPELINE_STAGES = [
  { id: 'upload', label: 'Upload', icon: Upload, desc: 'Source file ingestion' },
  { id: 'analyze', label: 'Analyze', icon: Search, desc: 'jQuery AST & DOM extraction' },
  { id: 'plan', label: 'Plan', icon: Map, desc: 'React component & state design' },
  { id: 'migrate', label: 'Migrate', icon: Code, desc: 'Imperative to JSX transformation' },
  { id: 'verify', label: 'Verify', icon: CheckCircle, desc: 'Behavioral verification suite' },
  { id: 'ship', label: 'Ship', icon: Send, desc: 'GitHub PR & branch creation' }
];

export default function PipelineOverview({
  hasUploaded = false,
  hasAnalysis = false,
  hasPlan = false,
  hasMigrated = false,
  hasVerified = false,
  hasShipped = false,
  currentStage = 'idle',
  errorState = null
}) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 mb-6 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-200">Autonomous Modernization Pipeline</h2>
          <p className="text-xs text-slate-400">Upload `.js` file to automatically analyze, plan, migrate, verify & ship</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 font-semibold">
            Agent Mode: Fully Autonomous
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
        {PIPELINE_STAGES.map((stage) => {
          const Icon = stage.icon;

          const isUploaded = stage.id === 'upload' && hasUploaded;
          const isAnalyzeDone = stage.id === 'analyze' && hasAnalysis;
          const isPlanDone = stage.id === 'plan' && hasPlan;
          const isMigrateDone = stage.id === 'migrate' && hasMigrated;
          const isVerifyDone = stage.id === 'verify' && hasVerified;
          const isShipDone = stage.id === 'ship' && hasShipped;

          const isDone = isUploaded || isAnalyzeDone || isPlanDone || isMigrateDone || isVerifyDone || isShipDone;
          const isActive = currentStage === stage.id;
          const isFailed = errorState && errorState.stage === stage.id;

          return (
            <div
              key={stage.id}
              className={`border rounded-xl p-3 relative transition-all ${
                isFailed
                  ? 'bg-rose-950/20 border-rose-500/50 shadow-md shadow-rose-500/10'
                  : isDone
                  ? 'bg-emerald-950/20 border-emerald-500/40 shadow-sm shadow-emerald-500/5'
                  : isActive
                  ? 'bg-sky-950/30 border-sky-400/60 ring-1 ring-sky-400/40 shadow-md shadow-sky-500/10 animate-pulse'
                  : 'bg-slate-950/40 border-slate-800/80 opacity-60'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1.5">
                <div className={`p-1.5 rounded-lg ${
                  isFailed
                    ? 'bg-rose-500/20 text-rose-400'
                    : isDone
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : isActive
                    ? 'bg-sky-500/20 text-sky-400'
                    : 'bg-slate-800 text-slate-500'
                }`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className={`text-xs font-semibold ${
                  isFailed ? 'text-rose-300' : isDone ? 'text-emerald-300' : isActive ? 'text-sky-300' : 'text-slate-400'
                }`}>
                  {stage.label}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight mb-2 truncate">{stage.desc}</p>
              
              <div className="flex items-center justify-between">
                <span className={`text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded border ${
                  isFailed
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    : isDone
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : isActive
                    ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                    : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}>
                  {isFailed ? '✕ Failed' : isDone ? '✓' : isActive ? '● Active' : '○ Pending'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
