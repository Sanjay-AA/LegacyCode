import React from 'react';
import { Cpu, Search, Map, Code, CheckCircle, ShieldCheck, GitPullRequest } from 'lucide-react';

const PIPELINE_STAGES = [
  { id: 'detect', label: 'Detect', icon: Cpu, desc: 'Technology stack detection' },
  { id: 'analyze', label: 'Analyze', icon: Search, desc: 'Legacy health & AST extraction' },
  { id: 'plan', label: 'Plan', icon: Map, desc: 'Architecture & state design' },
  { id: 'migrate', label: 'Migrate', icon: Code, desc: 'Code transformation engine' },
  { id: 'verify', label: 'Verify', icon: CheckCircle, desc: 'Behavioral contract suite' },
  { id: 'review', label: 'Review', icon: ShieldCheck, desc: 'Human approval gate' },
  { id: 'ship', label: 'GitHub', icon: GitPullRequest, desc: 'Branch, commit & PR creation' }
];

export default function PipelineOverview({
  hasDetected = false,
  hasAnalysis = false,
  hasPlan = false,
  hasMigrated = false,
  hasVerified = false,
  readyForReview = false,
  hasShipped = false,
  currentStage = 'idle',
  errorState = null
}) {
  return (
    <div className="bg-[#0c1219] border border-[#1c2e38] rounded-2xl p-5 mb-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-100 font-mono tracking-wider uppercase">
            Modernization Pipeline
          </h2>
          <p className="text-xs text-slate-400">
            Autonomous 7-Stage Execution Stream
          </p>
        </div>
        <span className="text-[11px] font-mono text-[#10b981] bg-[#10b981]/10 px-2.5 py-1 rounded border border-[#10b981]/20 font-bold">
          Engine: Real-Time SSE Stream
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {PIPELINE_STAGES.map((stage, idx) => {
          const Icon = stage.icon;

          const isDetectDone = stage.id === 'detect' && hasDetected;
          const isAnalyzeDone = stage.id === 'analyze' && hasAnalysis;
          const isPlanDone = stage.id === 'plan' && hasPlan;
          const isMigrateDone = stage.id === 'migrate' && hasMigrated;
          const isVerifyDone = stage.id === 'verify' && hasVerified;
          const isReviewDone = stage.id === 'review' && (readyForReview || hasShipped);
          const isShipDone = stage.id === 'ship' && hasShipped;

          const isDone = isDetectDone || isAnalyzeDone || isPlanDone || isMigrateDone || isVerifyDone || isReviewDone || isShipDone;
          const isActive = currentStage === stage.id;
          const isFailed = errorState && errorState.stage === stage.id;

          return (
            <div
              key={stage.id}
              className={`border rounded-xl p-3 relative transition-all ${
                isFailed
                  ? 'bg-rose-950/20 border-rose-500/50 shadow-rose-500/10'
                  : isDone
                  ? 'bg-[#10b981]/10 border-[#10b981]/40 shadow-[#10b981]/5'
                  : isActive
                  ? 'bg-[#10b981]/10 border-[#10b981] ring-1 ring-[#10b981]/50 animate-pulse'
                  : 'bg-[#070a0e]/60 border-[#1c2e38] opacity-50'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1.5">
                <div className={`p-1.5 rounded-lg ${
                  isFailed
                    ? 'bg-rose-500/20 text-rose-400'
                    : isDone || isActive
                    ? 'bg-[#10b981]/20 text-[#10b981]'
                    : 'bg-[#111a22] text-slate-500'
                }`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className={`text-xs font-bold font-mono ${
                  isFailed ? 'text-rose-300' : isDone || isActive ? 'text-[#10b981]' : 'text-slate-400'
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
                    ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30'
                    : isActive
                    ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/40'
                    : 'bg-[#0c1219] text-slate-500 border-[#1c2e38]'
                }`}>
                  {isFailed ? '✕ Failed' : isDone ? '✓ Done' : isActive ? '● Active' : '○ Pending'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
