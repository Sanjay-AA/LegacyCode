import React from 'react';
import HealthStatus from './HealthStatus';
import { ArrowRight, Code2, GitPullRequest, ExternalLink } from 'lucide-react';

export default function Header({
  sourceTech = 'jQuery',
  targetTech = 'React',
  status = 'Idle',
  stageStatus = 'idle',
  shipResult = null
}) {
  return (
    <header className="border-b border-[#1c2e38] bg-[#0c1219] sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* LEFT: Branding */}
        <div className="flex items-center space-x-3 shrink-0">
          <div>
            <h1 className="text-base font-extrabold tracking-wider font-mono text-white flex items-center gap-1.5">
              <span>LEGACY</span>
              <span className="text-[#10b981]">RESCUE</span>
              <span className="text-[10px] uppercase font-mono bg-[#10b981]/10 text-[#10b981] font-bold px-1.5 py-0.5 rounded border border-[#10b981]/20">
                BuildSprint 2026
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-sans">Autonomous Legacy Modernization Platform</p>
          </div>
        </div>

        {/* CENTER: Migration Path */}
        <div className="hidden md:flex items-center space-x-2 text-xs bg-[#070a0e] border border-[#1c2e38] px-3.5 py-1.5 rounded-xl text-slate-300 font-mono shadow-inner">
          <Code2 className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-bold text-slate-200">{sourceTech}</span>
          <ArrowRight className="w-3 h-3 text-slate-500" />
          <span className="text-[#10b981] font-bold">{targetTech}</span>
        </div>

        {/* RIGHT: Backend Connection & Migration Status */}
        <div className="flex items-center space-x-3 shrink-0">
          <HealthStatus />

          {/* GitHub PR Badge if shipped */}
          {shipResult && shipResult.pullRequest ? (
            <a
              href={shipResult.pullRequest.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center space-x-1.5 bg-[#10b981]/10 hover:bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30 px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all"
            >
              <GitPullRequest className="w-3.5 h-3.5" />
              <span>PR #{shipResult.pullRequest.number} Created</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <div className={`hidden lg:flex items-center space-x-2 px-3 py-1 rounded-lg border text-xs font-mono font-bold uppercase ${
              stageStatus === 'running'
                ? 'bg-sky-500/10 text-sky-400 border-sky-500/30 animate-pulse'
                : stageStatus === 'ready_for_review'
                ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30'
                : stageStatus === 'success'
                ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/40'
                : stageStatus === 'error'
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : 'bg-[#070a0e] text-slate-400 border-[#1c2e38]'
            }`}>
              <span>● {status}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
